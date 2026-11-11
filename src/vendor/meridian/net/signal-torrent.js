// @ts-nocheck
// Signaling over public WebTorrent trackers: the fallback when no lighthouse is set.
//
// A WebTorrent tracker introduces browsers for WebRTC. Peers announce a 20-byte info_hash
// (the room) with a few "offers"; the tracker hands each offer to random peers in the room and
// routes "answers" back to one peer (to_peer_id). Meridian rides that routing:
//   - presence: every announce carries offers whose sdp holds {pubkey, role, catalog}. A peer
//     that hears one answers with its own presence, so both sides learn each other at once.
//   - signal: room.send(to, blob) is an answer addressed to that peer, carrying the blob.
// The real SDP and ICE still go peer to peer through connectPeer() in room.js, exactly as with
// a lighthouse. Several trackers are used at once; messages carry an id so duplicates drop.
//
// Same interface as createRoom(): start, send, onMessage, list, subscribed, close, plus peers().
// Lost compared with a lighthouse: no world directory and no authoritative roster. The roster is
// "who we heard from lately", so it can lag a dead peer by up to peerTtlMs.

export const DEFAULT_TRACKERS = [
  "wss://tracker.webtorrent.dev",
  "wss://tracker.openwebtorrent.com",
];
const TAG = "a=x-meridian:";
const SDP_HEAD = "v=0\r\no=- 0 0 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\n";

// The room: SHA-1 of a namespaced world id, as a 20-char latin1 string (the tracker wire form).
export async function roomHash(world, subtle = globalThis.crypto?.subtle) {
  const bytes = new Uint8Array(await subtle.digest("SHA-1", new TextEncoder().encode(`meridian/torrent/1/${world}`)));
  return String.fromCharCode(...bytes);
}

export function randomId(random = Math.random) {
  let out = "";
  for (let i = 0; i < 20; i += 1) out += String.fromCharCode(Math.floor(random() * 256));
  return out;
}

export function wrap(body) {
  return `${SDP_HEAD}${TAG}${JSON.stringify(body)}\r\n`;
}

export function unwrapSdp(sdp) {
  if (typeof sdp !== "string") return null;
  const at = sdp.indexOf(TAG);
  if (at < 0) return null;
  const end = sdp.indexOf("\r\n", at);
  try {
    const body = JSON.parse(sdp.slice(at + TAG.length, end < 0 ? undefined : end));
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

export function trackersFrom(params) {
  const asked = params?.get?.("trackers");
  if (!asked) return DEFAULT_TRACKERS.slice();
  const list = asked.split(",").map((item) => item.trim()).filter((item) => /^wss?:\/\//.test(item));
  return list.length ? list : DEFAULT_TRACKERS.slice();
}

export function createTorrentRoom({
  me, cell = "atoll-0", role = "player", catalog = "", trackers = DEFAULT_TRACKERS,
  announceMs = 30000, peerTtlMs = 100000, offers = 5, numwant = 10,
  Socket = globalThis.WebSocket, subtle = globalThis.crypto?.subtle, random = Math.random, now = () => Date.now(),
}) {
  const listeners = new Set();
  const roster = new Map(); // pubkey -> { pubkey, role, catalog, peerId, seen }
  const seenMsg = new Map();
  const sockets = [];
  const peerId = randomId(random);
  const presence = { t: "hi", pubkey: me, role, catalog };
  let hash = null;
  let timer = null;
  let closed = false;
  const sentHi = new Map(); // peerId -> ms, so we answer each peer's offers at most every few seconds
  let seq = 0;
  const tag = Math.floor(random() * 2 ** 32).toString(36);
  const lastBlob = new Map();

  function emit(message) {
    for (const listener of [...listeners]) listener(message);
  }
  function fresh(id) {
    const t = now();
    for (const [key, at] of seenMsg) if (t - at > 60000) seenMsg.delete(key);
    if (seenMsg.has(id)) return false;
    seenMsg.set(id, t);
    return true;
  }
  function learn(body, from) {
    if (!body || typeof body.pubkey !== "string" || body.pubkey === me) return null;
    const known = roster.get(body.pubkey);
    const entry = { pubkey: body.pubkey, role: body.role || "player", catalog: body.catalog || "", peerId: from, seen: now() };
    roster.set(body.pubkey, entry);
    if (!known) emit({ type: "roster", cell, add: [{ pubkey: entry.pubkey, role: entry.role, catalog: entry.catalog }], drop: [] });
    return entry;
  }
  function prune() {
    const t = now();
    const drop = [];
    for (const [key, entry] of roster) if (t - entry.seen > peerTtlMs) { roster.delete(key); drop.push(key); }
    if (drop.length) emit({ type: "roster", cell, add: [], drop });
  }
  const tokens = new Map(); // socket -> peerId -> [offer_id]
  function tokensOf(socket, peer) {
    if (!tokens.has(socket)) tokens.set(socket, new Map());
    const bySocket = tokens.get(socket);
    if (!bySocket.has(peer)) bySocket.set(peer, []);
    return bySocket.get(peer);
  }
  function rawSend(socket, body) {
    if (socket.readyState !== 1) return;
    try { socket.send(JSON.stringify(body)); } catch { /* the next announce repairs it */ }
  }
  function answer(socket, toPeer, offerId, body) {
    rawSend(socket, { action: "announce", info_hash: hash, peer_id: peerId, to_peer_id: toPeer, offer_id: offerId, answer: { type: "answer", sdp: wrap(body) } });
  }
  function announce(socket, event) {
    const list = [];
    for (let i = 0; i < offers; i += 1) list.push({ offer_id: randomId(random), offer: { type: "offer", sdp: wrap(presence) } });
    const body = { action: "announce", info_hash: hash, peer_id: peerId, numwant, uploaded: 0, downloaded: 0, left: 1, offers: list };
    if (event) body.event = event;
    rawSend(socket, body);
  }
  function onTracker(socket, data) {
    let message;
    try { message = JSON.parse(typeof data === "string" ? data : String(data)); } catch { return; }
    if (!message || message.info_hash !== hash || message.peer_id === peerId) return;
    if (message.offer) {
      const body = unwrapSdp(message.offer.sdp);
      if (!body || body.t !== "hi") return;
      learn(body, message.peer_id);
      const last = sentHi.get(message.peer_id) || -Infinity;
      if (now() - last > 20000) {
        sentHi.set(message.peer_id, now());
        answer(socket, message.peer_id, message.offer_id, presence);
      } else {
        // Some trackers (tracker.webtorrent.dev) route one answer per offer they handed out,
        // so an unanswered offer is kept as a token for the next signal to that peer.
        const pool = tokensOf(socket, message.peer_id);
        pool.push(message.offer_id);
        if (pool.length > 10) pool.shift();
      }
      return;
    }
    if (message.answer) {
      const body = unwrapSdp(message.answer.sdp);
      if (!body) return;
      if (body.t === "hi") {
        learn(body, message.peer_id);
        return;
      }
      if (body.t === "sig" && body.to === me && typeof body.from === "string" && typeof body.blob === "string") {
        if (body.n && !fresh(`${body.from}:${body.n}`)) return;
        const entry = roster.get(body.from);
        if (entry) { entry.seen = now(); entry.peerId = message.peer_id; }
        else learn({ pubkey: body.from, role: "player" }, message.peer_id);
        emit({ type: "signal", from: body.from, to: me, blob: body.blob });
      }
    }
  }

  async function start() {
    hash = await roomHash(cell, subtle);
    const opened = trackers.map((url) => new Promise((resolve, reject) => {
      let socket;
      try { socket = new Socket(url); } catch (error) { reject(error); return; }
      sockets.push(socket);
      socket.onopen = () => { announce(socket, "started"); resolve(socket); };
      socket.onerror = () => reject(new Error(`tracker failed ${url}`));
      socket.onmessage = (event) => onTracker(socket, event.data);
    }));
    // Ready once any one tracker answers; the rest keep joining in the background.
    await Promise.any(opened).catch(() => { throw new Error("no tracker reachable"); });
    timer = setInterval(() => {
      if (closed) return;
      prune();
      for (const socket of sockets) announce(socket);
    }, announceMs);
  }
  function onMessage(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  // A blob goes out on every open tracker; connectPeer() repeats itself every second until the
  // link opens, so the same blob to the same peer within 2.5 s is skipped to spare the trackers.
  function send(to, blob) {
    const entry = roster.get(to);
    if (!entry) return;
    const key = `${to}\n${blob}`;
    const t = now();
    if (t - (lastBlob.get(key) || -Infinity) < 2500) return;
    lastBlob.set(key, t);
    if (lastBlob.size > 400) for (const [k, at] of lastBlob) if (t - at > 10000) lastBlob.delete(k);
    seq += 1;
    const body = { t: "sig", from: me, to, n: `${tag}-${seq}`, blob };
    for (const socket of sockets) answer(socket, entry.peerId, tokensOf(socket, entry.peerId).shift() || randomId(random), body);
  }
  function list() {
    prune();
    return Promise.resolve([...roster.values()].map(({ pubkey, role: r, catalog: c }) => ({ pubkey, role: r, catalog: c })));
  }
  function close() {
    closed = true;
    clearInterval(timer);
    for (const socket of sockets) {
      if (hash) rawSend(socket, { action: "announce", info_hash: hash, peer_id: peerId, numwant: 0, uploaded: 0, downloaded: 0, left: 1, event: "stopped" });
      try { socket.close(); } catch { /* already closed */ }
    }
  }
  return {
    kind: "torrent", start, send, onMessage, list, close,
    subscribed: () => true,
    peers: () => roster.size,
    trackersUp: () => sockets.filter((socket) => socket.readyState === 1).length,
    setCatalog: (next) => { presence.catalog = String(next || ""); },
  };
}
