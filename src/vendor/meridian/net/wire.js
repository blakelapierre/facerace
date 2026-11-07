// @ts-nocheck
// Wire protocol v2. These are link-layer encodings only. Signed frames are rebuilt
// byte for byte on receipt, so signatures, saves and the archive still see v1 frames.
//
//   hello (ctrl channel, JSON): {t:"hello", proto, catalog}. A peer that never sends
//     one is v1. Each side sends v2 only after the other side's hello says proto >= 2.
//   pose v2 (snap): 0xB2, varint tick, zigzag varint x/y/z in cm, int16 yaw (wrapped
//     to [-pi, pi)) x1e4, int16 pitch x1e4. A v1 pose is exactly 16 or 24 bytes, so a v2
//     pose of that length gets one pad byte to keep the two told apart by length.
//   pack (ops): 0xF2, varint count, then per frame: flags, sender (a 32 B key the first
//     time, after that a varint index), kind, 64 B sig, payload. A payload that contains a
//     recent payload (>= 64 B) sent on the same link, such as a terrain commit embedding
//     its proposal, is sent as before + reference + after.
//   deflated pack (archive replay/snapshots): 0xF3 + deflate-raw(pack body). It is
//     self-contained: it uses a fresh key table and cache.
export const PROTO = 3; // 3: dead-reckoned, interest-tiered poses (src/net/motion.js)
export const POSE_V2 = 0xb2;
export const PACK = 0xf2;
export const PACK_DEFLATE = 0xf3;
const REF_MIN = 64;
const CACHE = 32;

// fov (horizontal radians) is optional: the peer uses it to pick what we can see.
// range (metres) is optional: past it, that peer does not need our pose.
// notify (Batch 16): this side reads seq/ack-framed `snap` packets (src/net/notify.js).
export function helloMessage(catalog = "", fov = 0, range = 0, notify = false) {
  const message = { t: "hello", proto: PROTO, catalog };
  if (notify) message.notify = 1;
  if (Number.isFinite(fov) && fov > 0.1 && fov < 3.1) message.fov = Math.round(fov * 1000) / 1000;
  if (Number.isFinite(range) && range >= 8 && range <= 2000) message.range = Math.round(range);
  return JSON.stringify(message);
}

export function readHello(text) {
  try {
    const message = JSON.parse(typeof text === "string" ? text : new TextDecoder().decode(text));
    if (message?.t !== "hello") return null;
    const hello = { proto: Math.max(1, Math.min(PROTO, Number(message.proto) || 1)), catalog: String(message.catalog || "") };
    const fov = Number(message.fov);
    if (Number.isFinite(fov) && fov > 0.1 && fov < 3.1) hello.fov = fov;
    const range = Number(message.range);
    if (Number.isFinite(range) && range >= 8 && range <= 2000) hello.range = Math.round(range);
    if (message.notify === 1) hello.notify = true;
    return hello;
  } catch {
    return null;
  }
}

class Writer {
  constructor() { this.parts = []; this.size = 0; }
  byte(value) { this.bytes(Uint8Array.of(value & 255)); }
  bytes(bytes) { this.parts.push(bytes); this.size += bytes.length; }
  varint(value) {
    const out = [];
    let v = value >>> 0;
    while (v >= 0x80) { out.push((v & 0x7f) | 0x80); v >>>= 7; }
    out.push(v);
    this.bytes(Uint8Array.from(out));
  }
  zigzag(value) { this.varint(((value << 1) ^ (value >> 31)) >>> 0); }
  int16(value) { const b = new Uint8Array(2); new DataView(b.buffer).setInt16(0, value, true); this.bytes(b); }
  done() {
    const out = new Uint8Array(this.size);
    let at = 0;
    for (const part of this.parts) { out.set(part, at); at += part.length; }
    return out;
  }
}

class Reader {
  constructor(bytes, at = 0) { this.b = bytes; this.at = at; }
  byte() { if (this.at >= this.b.length) throw new Error("short"); return this.b[this.at++]; }
  bytes(n) { if (this.at + n > this.b.length) throw new Error("short"); const out = this.b.subarray(this.at, this.at + n); this.at += n; return out; }
  varint() {
    let value = 0;
    let shift = 0;
    for (;;) {
      const byte = this.byte();
      value += (byte & 0x7f) * 2 ** shift;
      if (byte < 0x80) return value;
      shift += 7;
      if (shift > 35) throw new Error("varint");
    }
  }
  zigzag() { const v = this.varint(); return v % 2 ? -(v + 1) / 2 : v / 2; }
  int16() { const v = new DataView(this.b.buffer, this.b.byteOffset + this.at, 2).getInt16(0, true); this.at += 2; return v; }
}

export function wrapYaw(yaw) {
  const turn = Math.PI * 2;
  let y = ((yaw + Math.PI) % turn + turn) % turn - Math.PI;
  if (y >= Math.PI) y -= turn;
  return y;
}

export function encodePoseV2({ tick, x, y, z, yaw = 0, pitch = 0 }) {
  const w = new Writer();
  w.byte(POSE_V2);
  w.varint(tick);
  w.zigzag(Math.round(x * 100));
  w.zigzag(Math.round(y * 100));
  w.zigzag(Math.round(z * 100));
  w.int16(Math.max(-31415, Math.min(31415, Math.round(wrapYaw(yaw) * 10000))));
  w.int16(Math.max(-32767, Math.min(32767, Math.round(pitch * 10000))));
  if (w.size === 16 || w.size === 24) w.byte(0);
  return w.done();
}

export function isPoseV2(bytes) {
  return bytes.length !== 16 && bytes.length !== 24 && bytes[0] === POSE_V2;
}

export function decodePoseV2(bytes) {
  const r = new Reader(bytes, 1);
  return { tick: r.varint(), x: r.zigzag() / 100, y: r.zigzag() / 100, z: r.zigzag() / 100, yaw: r.int16() / 10000, pitch: r.int16() / 10000 };
}

// Change-only sending: a pose goes out when it moved or turned, or once a second as a keepalive.
export function poseDue(last, pose, nowMs, keepaliveMs = 1000) {
  if (!last) return true;
  if (nowMs - last.at >= keepaliveMs) return true;
  if (Math.abs(pose.x - last.x) >= 0.01 || Math.abs(pose.y - last.y) >= 0.01 || Math.abs(pose.z - last.z) >= 0.01) return true;
  return Math.abs(wrapYaw(pose.yaw - last.yaw)) >= 0.002 || Math.abs(pose.pitch - last.pitch) >= 0.002;
}

export function packState() {
  return { keys: [], cache: [] };
}

function keyHex(key) {
  let s = "";
  for (const b of key) s += b.toString(16).padStart(2, "0");
  return s;
}

function indexOfBytes(hay, needle) {
  if (needle.length > hay.length) return -1;
  const first = needle[0];
  outer: for (let i = 0; i <= hay.length - needle.length; i += 1) {
    if (hay[i] !== first) continue;
    for (let j = 1; j < needle.length; j += 1) if (hay[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}

function remember(state, payload) {
  if (payload.length < REF_MIN) return;
  state.cache.push(payload.slice());
  if (state.cache.length > CACHE) state.cache.shift();
}

function writeBody(w, frames, state) {
  w.varint(frames.length);
  for (const frame of frames) {
    const key = frame.subarray(1, 33);
    const sig = frame.subarray(33, 97);
    const payload = frame.subarray(97);
    const hex = keyHex(key);
    let index = state.keys.indexOf(hex);
    let ref = -1;
    let at = -1;
    for (let c = state.cache.length - 1; c >= 0; c -= 1) {
      const found = indexOfBytes(payload, state.cache[c]);
      if (found >= 0 && (ref < 0 || state.cache[c].length > state.cache[ref].length)) { ref = c; at = found; }
    }
    w.byte((index < 0 ? 1 : 0) | (ref >= 0 ? 2 : 0));
    if (index < 0) { w.bytes(key); state.keys.push(hex); } else w.varint(index);
    w.byte(frame[0]);
    w.bytes(sig);
    if (ref >= 0) {
      const size = state.cache[ref].length;
      w.varint(state.cache.length - 1 - ref);
      w.varint(at);
      w.bytes(payload.subarray(0, at));
      w.varint(payload.length - at - size);
      w.bytes(payload.subarray(at + size));
    } else {
      w.varint(payload.length);
      w.bytes(payload);
    }
    remember(state, payload);
  }
}

function readBody(r, state) {
  const count = r.varint();
  const frames = [];
  for (let n = 0; n < count; n += 1) {
    const flags = r.byte();
    let key;
    if (flags & 1) { key = r.bytes(32).slice(); state.keys.push(key); } else key = state.keys[r.varint()];
    if (!key) throw new Error("key");
    const kind = r.byte();
    const sig = r.bytes(64);
    let payload;
    if (flags & 2) {
      const cached = state.cache[state.cache.length - 1 - r.varint()];
      if (!cached) throw new Error("ref");
      const before = r.bytes(r.varint());
      const after = r.bytes(r.varint());
      payload = new Uint8Array(before.length + cached.length + after.length);
      payload.set(before, 0);
      payload.set(cached, before.length);
      payload.set(after, before.length + cached.length);
    } else payload = r.bytes(r.varint()).slice();
    const frame = new Uint8Array(97 + payload.length);
    frame[0] = kind;
    frame.set(key, 1);
    frame.set(sig, 33);
    frame.set(payload, 97);
    frames.push(frame);
    remember(state, payload);
  }
  return frames;
}

// Only frames shaped like signed frames (>= 97 bytes) can be packed. Anything else goes alone.
export function packable(frame) {
  return frame.length >= 97 && frame[0] !== PACK && frame[0] !== PACK_DEFLATE;
}

export function encodePack(frames, state) {
  const w = new Writer();
  w.byte(PACK);
  writeBody(w, frames, state);
  return w.done();
}

export function decodePack(bytes, state) {
  return readBody(new Reader(bytes, 1), state);
}

async function stream(bytes, transform) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(transform));
  return new Uint8Array(await out.arrayBuffer());
}

export async function encodeDeflatedPack(frames) {
  const w = new Writer();
  writeBody(w, frames, packState());
  const body = await stream(w.done(), new CompressionStream("deflate-raw"));
  const out = new Uint8Array(1 + body.length);
  out[0] = PACK_DEFLATE;
  out.set(body, 1);
  return out;
}

export async function decodeDeflatedPack(bytes) {
  const body = await stream(bytes.subarray(1), new DecompressionStream("deflate-raw"));
  return readBody(new Reader(body), packState());
}

// One entry point for receivers. It returns the v1 frames a message carries, in order.
// A deflated pack resolves asynchronously, so the result may be a promise.
export function unwrap(bytes, state) {
  if (bytes[0] === PACK) return decodePack(bytes, state);
  if (bytes[0] === PACK_DEFLATE) return decodeDeflatedPack(bytes);
  return [bytes];
}
