// @ts-nocheck
import { isLocalHubUrl, localSocket } from "./localhub.js";
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Wire v2: a client sends `proto` in announce and `subscribe` once. A lighthouse that knows
// subscribe answers `present` with sub:true and then pushes `roster` diffs. The client then
// stops polling `list` and announces every subscribedRefreshMs. An old lighthouse ignores both
// and the client keeps the v1 behavior (announce every refreshMs, poll `list`).
export function createRoom({ url, me, cell = "atoll-0", refreshMs = 5000, subscribedRefreshMs = 12000, role = "player", catalog = "", proto = 2 }) {
  const socket = isLocalHubUrl(url) ? localSocket(url) : new WebSocket(url);
  const listeners = new Set();
  let roster = null;
  let timer = null;
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve());
    socket.addEventListener("error", () => reject(new Error("lighthouse failed")));
  });
  socket.addEventListener("message", (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    if (message.type === "present" && message.sub && message.cell === cell) {
      const fresh = !roster;
      roster = new Map((message.peers || []).map((peer) => [peer.pubkey, peer]));
      if (fresh && timer) {
        clearInterval(timer);
        timer = setInterval(announce, subscribedRefreshMs);
      }
    } else if (message.type === "roster" && roster && message.cell === cell) {
      for (const peer of message.add || []) roster.set(peer.pubkey, peer);
      for (const key of message.drop || []) roster.delete(key);
    }
    for (const listener of [...listeners]) listener(message);
  });
  function announce() {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify({ type: "announce", pubkey: me, cell, role, catalog, proto }));
    }
  }
  async function start() {
    await ready;
    announce();
    timer = setInterval(announce, refreshMs);
    if (proto >= 2) socket.send(JSON.stringify({ type: "subscribe", cell }));
    socket.addEventListener("close", () => clearInterval(timer));
  }
  function onMessage(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  function send(to, blob) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "signal", to, from: me, blob }));
  }
  function list() {
    if (roster) return Promise.resolve([...roster.values()]);
    return new Promise((resolve) => {
      let settled = false;
      const finish = (peers) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        stop();
        resolve(peers);
      };
      const stop = onMessage((message) => {
        if (message.type !== "present") return;
        finish(message.peers || []);
      });
      const timer = setTimeout(() => finish([]), 2000);
      try {
        socket.send(JSON.stringify({ type: "list", cell }));
      } catch {
        finish([]);
      }
    });
  }
  return { start, send, onMessage, list, subscribed: () => Boolean(roster), close: () => socket.close() };
}

export async function connectPeer({ pc, room, me, to, offer, isOpen, status }) {
  const candidates = [];
  const pending = [];
  let description = null;
  let remoteReady = false;
  let shown = "";
  const note = (line) => {
    if (line === shown) return;
    shown = line;
    status(line);
  };
  pc.onicecandidate = (event) => {
    if (!event.candidate) return;
    candidates.push(event.candidate);
    room.send(to, JSON.stringify({ candidate: event.candidate }));
  };
  pc.oniceconnectionstatechange = () => note(`ice ${pc.iceConnectionState}`);
  room.onMessage(async (message) => {
    if (message.type !== "signal" || message.from !== to) return;
    let payload;
    try {
      payload = JSON.parse(message.blob);
    } catch {
      return;
    }
    try {
      if (payload.sdp) {
        if (pc.remoteDescription?.sdp === payload.sdp.sdp) return;
        await pc.setRemoteDescription(payload.sdp);
        remoteReady = true;
        while (pending.length) await pc.addIceCandidate(pending.shift()).catch(() => {});
        if (payload.sdp.type === "offer" && !description) {
          description = await pc.createAnswer();
          await pc.setLocalDescription(description);
          room.send(to, JSON.stringify({ sdp: pc.localDescription }));
          note("answered");
        }
        return;
      }
      if (payload.candidate) {
        if (!remoteReady) pending.push(payload.candidate);
        else await pc.addIceCandidate(payload.candidate).catch(() => {});
      }
    } catch (error) {
      note(String(error));
    }
  });
  while (!isOpen()) {
    if (offer && !description) {
      const peers = await room.list();
      if (!peers.some((peer) => peer.pubkey === to)) {
        note("waiting for the other tab");
        await pause(500);
        continue;
      }
      description = await pc.createOffer();
      await pc.setLocalDescription(description);
    }
    if (description) {
      room.send(to, JSON.stringify({ sdp: pc.localDescription }));
      for (const candidate of candidates) room.send(to, JSON.stringify({ candidate }));
      note(offer ? "offered" : "answered");
    } else {
      note("waiting for the offer");
    }
    await pause(1000);
  }
}

// Start a room without giving up on a slow socket. A busy page (shader compile, a weak
// phone, many tabs) can delay the socket's open past a few seconds; closing it then left
// game clients solo for 30 s. Now a slow start only reports "slow" and keeps waiting;
// only a real socket error rejects.
export function startRoom(room, { slowMs = 3000, onState = () => {} } = {}) {
  let settled = false;
  onState("connecting");
  const timer = setTimeout(() => { if (!settled) onState("slow"); }, slowMs);
  return room.start().then(
    () => { settled = true; clearTimeout(timer); onState("up"); return room; },
    (error) => { settled = true; clearTimeout(timer); onState("failed"); throw error; },
  );
}
