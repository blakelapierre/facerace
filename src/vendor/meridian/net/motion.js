// @ts-nocheck
// Pose wire v3: interest-tiered dead reckoning (Batch 6).
//
// The sender and each receiver run the same deterministic predictor from the last state the sender
// actually put on the wire, after quantization (the "verified" state). The sender keeps one copy of
// that state per receiver and sends only when the receiver's prediction would drift past an error
// bound for that receiver's tier, when the motion mode changes (start, stop, jump, land), or on a
// slow keepalive. The receiver blends each correction in over CORRECT_S instead of snapping.
//
// Frame (snap channel): 0xB3, flags, varint tick, zigzag x/y/z (cm), [zigzag vx/vy/vz (2 cm/s)],
// [int8 ax/ay/az (0.25 m/s²)], uint16 yaw (2pi/65536), [int8 yaw rate (0.04 rad/s)], int8 pitch
// (0.0125 rad). Quantization errors are well below the smallest error bound (5 cm).
import { wrapYaw } from "./wire.js";

export const POSE_V3 = 0xb3;
export const TICK_HZ = 30;
export const CORRECT_S = 0.2;
const MAX_PREDICT_S = 1.5; // past this, hold position rather than extrapolate into walls
const WALL_COAST_M = 1.25; // a 30 Hz coast this far off the body is resent, even when the tick prediction still matches
export const COAST_M = 2; // a prediction never walks more than this far from the last packet
const A_MAX = [8, 8, 12]; // m/s^2
const ACCEL_S = 0.5; // acceleration only shapes the first half second

// Receiver interest tiers. err is a position bound in metres, yawErr in radians, minGap the least
// number of ticks between two sends, keepalive the most.
// Ticks between loss repairs at the near tiers while a sent state is unacked.
export const LOSS_GAP_NEAR = 6;
export const TIERS = [
  { name: "near-visible", err: 0.05, yawErr: 0.05, minGap: 1, keepalive: 60 }, // up to 30 Hz
  { name: "mid-visible", err: 0.25, yawErr: 0.15, minGap: 5, keepalive: 90 }, // up to 6 Hz
  { name: "unseen", err: 1.0, yawErr: 0.6, minGap: 15, keepalive: 150 }, // up to 2 Hz
  { name: "beyond", err: 4.0, yawErr: Math.PI, minGap: 60, keepalive: 300 }, // up to 0.5 Hz, 10 s keepalive
];
// Yaw also steers the receiver's frustum test on the *other* side, so within perception range a
// turn goes out within VIEW_GAP ticks once it passes VIEW_YAW, whatever the tier.
const VIEW_YAW = 0.3;
const VIEW_GAP = 8;

// view: what the receiver advertises (position, yaw, horizontal fov in radians, perception range in m).
export function tierFor(view, at) {
  if (!view) return 1;
  const dx = at[0] - view.x;
  const dy = at[1] - view.y;
  const d = Math.hypot(dx, dy);
  if (d > (view.range || 80) + 20) return 3; // 20 m margin: sharpen before it enters perception range
  const ahead = [Math.sin(view.yaw), Math.cos(view.yaw)];
  const cos = d < 1e-6 ? 1 : (dx * ahead[0] + dy * ahead[1]) / d;
  const half = (view.fov || 1.4) / 2 + 0.25; // margin so a peer is already sharp when it slides into view
  const onScreen = cos >= Math.cos(Math.min(Math.PI, half));
  if (d < 6) return 0; // within arm's reach, behind or not
  if (onScreen) return d < 35 ? 0 : 1;
  return d < 15 ? 1 : 2;
}

// View advert on ctrl, sent at most every second: JSON so a v2 peer that doesn't know it ignores it.
export function viewMessage({ x, y, yaw, fov, range }) {
  return JSON.stringify({ t: "view", x: Math.round(x), y: Math.round(y), yaw: Math.round(wrapYaw(yaw) * 100) / 100, fov: Math.round(fov * 100) / 100, range: Math.round(range) });
}

export function readView(text) {
  try {
    const m = JSON.parse(typeof text === "string" ? text : new TextDecoder().decode(text));
    if (m?.t !== "view") return null;
    return { x: +m.x || 0, y: +m.y || 0, yaw: +m.yaw || 0, fov: +m.fov || 1.4, range: +m.range || 80 };
  } catch {
    return null;
  }
}

// The snap channel does not retransmit. The receiver confirms the sender tick it actually
// applied, on the reliable ctrl channel, so a dropped sprint is repeated until it lands.
export function ackMessage(tick) {
  return JSON.stringify({ t: "ack", tick });
}

export function readAck(text) {
  try {
    const m = JSON.parse(typeof text === "string" ? text : new TextDecoder().decode(text));
    if (m?.t !== "ack" || !Number.isFinite(+m.tick)) return null;
    return { tick: +m.tick };
  } catch {
    return null;
  }
}

// Velocity and acceleration from local history (sender side): least-squares slope over the
// last few ticks, then the difference of two such slopes for acceleration.
export function createEstimator(size = 6) {
  return { size, hist: [] };
}

export function observe(est, tick, pos, yaw) {
  est.hist.push({ tick, p: [pos[0], pos[1], pos[2]], yaw });
  if (est.hist.length > est.size * 2) est.hist.shift();
}

function slope(samples, pick) {
  const n = samples.length;
  if (n < 2) return 0;
  let st = 0;
  let sv = 0;
  for (const s of samples) { st += s.tick; sv += pick(s); }
  const mt = st / n;
  const mv = sv / n;
  let num = 0;
  let den = 0;
  for (const s of samples) { num += (s.tick - mt) * (pick(s) - mv); den += (s.tick - mt) ** 2; }
  return den ? (num / den) * TICK_HZ : 0;
}

export function estimate(est) {
  const h = est.hist;
  const recent = h.slice(-Math.min(3, h.length));
  const older = h.slice(-est.size, -est.size + 3 || undefined);
  const v = [0, 1, 2].map((k) => slope(recent, (s) => s.p[k]));
  const vOld = [0, 1, 2].map((k) => slope(older, (s) => s.p[k]));
  const span = older.length && recent.length ? (recent.at(-1).tick - older.at(-1).tick) / TICK_HZ : 0;
  // Clamp to what a body can actually do; start/stop spikes would otherwise fling the prediction.
  const a = span > 0 ? v.map((value, k) => Math.max(-A_MAX[k], Math.min(A_MAX[k], (value - vOld[k]) / span))) : [0, 0, 0];
  const yawRate = recent.length >= 2 ? wrapYaw(recent.at(-1).yaw - recent[0].yaw) / ((recent.at(-1).tick - recent[0].tick) / TICK_HZ) : 0;
  return { v, a, yawRate };
}

// Shared deterministic predictor. Both sides call this on the same verified state.
export function predict(state, tick) {
  const dt = Math.max(0, Math.min(MAX_PREDICT_S, (tick - state.tick) / TICK_HZ));
  const da = Math.min(dt, ACCEL_S);
  const p = [0, 1, 2].map((k) => state.p[k] + state.v[k] * dt + state.a[k] * (da * dt - da * da / 2));
  const dx = p[0] - state.p[0];
  const dy = p[1] - state.p[1];
  const flat = Math.hypot(dx, dy);
  if (flat > COAST_M) {
    const scale = COAST_M / flat;
    p[0] = state.p[0] + dx * scale;
    p[1] = state.p[1] + dy * scale;
  }
  // A body on flat ground does not keep sinking: a falling prediction stops at the sender's last ground.
  if (state.floor !== undefined && p[2] < state.floor) p[2] = state.floor;
  return { p, yaw: wrapYaw(state.yaw + state.yawRate * dt), pitch: state.pitch };
}

const q = (value, step) => Math.round(value / step);
const MODE = { idle: 0, move: 1, air: 2 };
export function modeOf(v, airborne) {
  if (airborne) return MODE.air;
  return Math.hypot(v[0], v[1]) > 0.3 ? MODE.move : MODE.idle;
}

class W {
  constructor() { this.b = []; }
  u8(v) { this.b.push(v & 255); }
  i8(v) { this.u8(Math.max(-127, Math.min(127, v))); }
  u16(v) { this.u8(v); this.u8(v >> 8); }
  varint(v) { v >>>= 0; while (v >= 0x80) { this.u8((v & 0x7f) | 0x80); v >>>= 7; } this.u8(v); }
  zz(v) { this.varint(((v << 1) ^ (v >> 31)) >>> 0); }
}

// Encode a send and return both the bytes and the verified state the receiver will rebuild.
export function encodeMotion({ tick, p, v, a, yaw, yawRate, pitch, floor }, mode) {
  const moving = mode !== MODE.idle;
  const vq = moving ? v.map((x) => q(x, 0.02)) : [0, 0, 0];
  const aq = a.map((x) => Math.max(-127, Math.min(127, q(x, 0.25))));
  const hasA = moving && aq.some((x) => x !== 0);
  const rq = Math.max(-127, Math.min(127, q(yawRate, 0.04)));
  const hasR = rq !== 0;
  const w = new W();
  w.u8(POSE_V3);
  w.u8((moving ? 1 : 0) | (hasA ? 2 : 0) | (hasR ? 4 : 0) | (mode << 3));
  w.varint(tick);
  for (const x of p) w.zz(q(x, 0.01));
  if (moving) for (const x of vq) w.zz(x);
  if (hasA) for (const x of aq) w.i8(x);
  w.u16(Math.round(((wrapYaw(yaw) + Math.PI) / (Math.PI * 2)) * 65536) & 0xffff);
  if (hasR) w.i8(rq);
  w.i8(q(pitch, 0.0125));
  const bytes = Uint8Array.from(w.b);
  return { bytes, state: decodeMotion(bytes, floor) };
}

export function decodeMotion(bytes, floor) {
  let at = 1;
  const u8 = () => bytes[at++];
  const i8 = () => { const v = bytes[at++]; return v > 127 ? v - 256 : v; };
  const varint = () => { let v = 0; let s = 0; for (;;) { const b = u8(); v += (b & 0x7f) * 2 ** s; if (b < 0x80) return v; s += 7; } };
  const zz = () => { const v = varint(); return v % 2 ? -(v + 1) / 2 : v / 2; };
  const flags = u8();
  const tick = varint();
  const p = [zz() / 100, zz() / 100, zz() / 100];
  const v = flags & 1 ? [zz() * 0.02, zz() * 0.02, zz() * 0.02] : [0, 0, 0];
  const a = flags & 2 ? [i8() * 0.25, i8() * 0.25, i8() * 0.25] : [0, 0, 0];
  const yaw = wrapYaw(((bytes[at] | (bytes[at + 1] << 8)) / 65536) * Math.PI * 2 - Math.PI);
  at += 2;
  const yawRate = flags & 4 ? i8() * 0.04 : 0;
  const pitch = i8() * 0.0125;
  const mode = (flags >> 3) & 3;
  // Airborne states keep their fall; grounded ones are pinned to the height they were sent at.
  return { tick, p, v, a, yaw, yawRate, pitch, mode, floor: mode === MODE.air ? floor : p[2] };
}

export function isMotion(bytes) {
  return bytes[0] === POSE_V3 && bytes.length !== 16 && bytes.length !== 24;
}

// Sender: one record per receiver.
export function createSendState() {
  return { verified: null, acked: null, ackTick: -1, sent: [], lastTick: -1e9, mode: -1, tier: 3, sentWallMs: null };
}

export function noteAck(rec, tick) {
  const got = +tick;
  if (!Number.isFinite(got) || got < rec.ackTick) return;
  rec.ackTick = got;
  let held = null;
  for (const sent of rec.sent) if (sent.tick <= got) held = sent.state;
  if (held) rec.acked = held;
}

// Decide whether to send `now` (local truth plus estimate) to a receiver with this tier.
export function shouldSend(rec, now, tierIndex) {
  const tier = TIERS[tierIndex];
  const gap = now.tick - rec.lastTick;
  if (!rec.verified) return "first";
  if (now.mode !== rec.mode && gap >= 1) return "mode";
  const guess = predict(rec.verified, now.tick);
  const turned = Math.abs(wrapYaw(guess.yaw - now.yaw));
  // A receiver that just came into a sharper tier gets a fresh state at once.
  if (tierIndex < (rec.tier ?? 3) && gap >= 1) return "tier";
  if (tierIndex < 3 && gap >= VIEW_GAP && turned > VIEW_YAW) return "view";
  const err = Math.hypot(guess.p[0] - now.p[0], guess.p[1] - now.p[1], guess.p[2] - now.p[2]);
  // minGap caps chatter that is still inside the tier's error. A sprint covers the unseen
  // 1 m bound in a handful of ticks, so the bound has to be allowed to send inside the gap.
  if (err > tier.err && gap >= 1) return "error";
  // The receiver coasts by wall time. A page behind 30 Hz still matches its own tick
  // prediction, so it would not send, and the peer holds a 30 Hz coast until keepalive.
  if (gap >= 1 && Number.isFinite(now.wallMs) && Number.isFinite(rec.sentWallMs)) {
    const dtSec = Math.max(0, Math.min(MAX_PREDICT_S, (now.wallMs - rec.sentWallMs) / 1000));
    const wallGuess = predict(rec.verified, rec.verified.tick + dtSec * TICK_HZ);
    const wallErr = Math.hypot(wallGuess.p[0] - now.p[0], wallGuess.p[1] - now.p[1], wallGuess.p[2] - now.p[2]);
    if (wallErr > WALL_COAST_M) return "wall";
  }
  // A coarse tier will not send again while its newest state still predicts the body.
  // If the peer has not confirmed that state, it is still on the last one it acked,
  // and one missed sprint correction is how a pose ends up 7 m off.
  // Near tiers repair too (Batch 17 packet-loss test): a straight walk at the near tier only
  // sends on drift, so one lost packet on the unreliable lane left the peer coasting to the
  // 2 m cap; they retry at most every LOSS_GAP_NEAR ticks until the peer acks.
  if (rec.verified && rec.ackTick < rec.verified.tick && gap >= (tier.minGap > 3 ? 3 : LOSS_GAP_NEAR)) {
    if (!rec.acked) return "loss";
    const old = predict(rec.acked, now.tick);
    const oldErr = Math.hypot(old.p[0] - now.p[0], old.p[1] - now.p[1], old.p[2] - now.p[2]);
    if (oldErr > tier.err) return "loss";
  }
  // Wall-clock keepalive: a hidden or starved tab stops advancing ticks, so a body standing
  // still (or a lost first state on the unreliable lane) was never repeated and the peer saw
  // nobody. Repeat by wall time at the tier's keepalive period too.
  if (Number.isFinite(now.wallMs) && Number.isFinite(rec.sentWallMs) && now.wallMs - rec.sentWallMs >= (tier.keepalive / TICK_HZ) * 1000) return "keepalive";
  if (gap < tier.minGap) return null;
  if (gap >= tier.keepalive) return "keepalive";
  if (turned > tier.yawErr) return "yaw";
  return null;
}

export function sendNow(rec, now, tierIndex = 3) {
  rec.tier = tierIndex;
  const { bytes, state } = encodeMotion(now, now.mode);
  rec.sent.push({ tick: state.tick, state });
  if (rec.sent.length > 8) rec.sent.shift();
  rec.verified = state;
  rec.lastTick = now.tick;
  rec.mode = now.mode;
  if (Number.isFinite(now.wallMs)) rec.sentWallMs = now.wallMs;
  return bytes;
}

// Receiver: predicted pose plus a decaying offset that hides each correction.
export function createView() {
  return { state: null, offset: [0, 0, 0], yawOffset: 0, corrections: 0, arrivalTick: 0 };
}

export function receive(view, bytes, tick, floor, nowMs) {
  const next = decodeMotion(bytes, floor);
  if (view.state && next.tick < view.state.tick) return false;
  // `tick` is this page's sim clock, not the sender's. A client opened later is behind by
  // every tick the others have already run, so predicting to the local tick flings them.
  const arrival = tick ?? next.tick;
  const was = view.state ? shown(view, arrival, nowMs) : null;
  if (view.state && Number.isFinite(view.arrivalMs) && Number.isFinite(nowMs)) {
    const dMs = nowMs - view.arrivalMs;
    const dTick = next.tick - view.state.tick;
    // How fast *their* sim tick actually advances. A busy client falls behind 30 Hz;
    // coasting them at 30 would run the body ahead of where they are.
    if (dMs >= 40 && dTick > 0) {
      const hz = Math.max(4, Math.min(TICK_HZ, (dTick / dMs) * 1000));
      view.senderHz = view.senderHz ? view.senderHz * 0.5 + hz * 0.5 : hz;
    }
  }
  if (was) {
    const now = predict(next, next.tick);
    view.offset = [0, 1, 2].map((k) => was.p[k] - now.p[k]);
    // A jump of more than 3 m is a teleport (respawn, tour): snap.
    if (Math.hypot(...view.offset) > 3) view.offset = [0, 0, 0];
    view.yawOffset = wrapYaw(was.yaw - now.yaw);
    view.corrections += 1;
  }
  view.state = next;
  view.arrivalTick = arrival;
  if (Number.isFinite(nowMs)) view.arrivalMs = nowMs;
  return true;
}

export function shown(view, tick, nowMs) {
  if (!view.state) return null;
  // Wall time since this packet, scaled by the sender's real tick rate. The tick count
  // alone is not a clock: a later or busier page does not step at the same speed.
  let dtSec;
  if (Number.isFinite(view.arrivalMs) && Number.isFinite(nowMs)) dtSec = Math.max(0, (nowMs - view.arrivalMs) / 1000);
  else {
    const elapsed = view.arrivalTick === undefined ? tick - view.state.tick : tick - view.arrivalTick;
    dtSec = Math.max(0, elapsed) / TICK_HZ;
  }
  const at = view.state.tick + dtSec * (view.senderHz || TICK_HZ);
  const base = predict(view.state, at);
  return { p: base.p.map((x, k) => x + view.offset[k]), yaw: wrapYaw(base.yaw + view.yawOffset), pitch: base.pitch };
}

// Call once per tick after shown(): the offset fades out over about CORRECT_S.
export function settle(view, dt = 1 / TICK_HZ) {
  const keep = Math.exp(-dt / (CORRECT_S / 3));
  view.offset = view.offset.map((x) => x * keep);
  view.yawOffset *= keep;
}
