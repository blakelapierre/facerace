// @ts-nocheck
// In-tab lighthouse: `?lighthouse=bc:<room>` makes room.js talk to a hub living in the top
// window (tools/scale/ hosts it) instead of a WebSocket server, so many same-origin iframes can
// find each other with no server at all (GitHub Pages). Peers still connect over real WebRTC.
// Speaks the same wire as tools/signal/server.js: announce, subscribe, list, signal; present, roster.

export function createLocalHub() {
  const peers = new Map(); // pubkey -> { socket, cell, role, catalog, proto }
  const subs = new Map(); // socket -> cell
  const entry = (key, p) => ({ pubkey: key, cell: p.cell, role: p.role, catalog: p.catalog, proto: p.proto });
  const inCell = (cell) => [...peers].filter(([, p]) => p.cell === cell).map(([k, p]) => entry(k, p));
  function push(cell, add, drop) {
    for (const [socket, wanted] of subs) if (wanted === cell) socket.deliver({ type: "roster", cell, add, drop });
  }
  function handle(socket, message) {
    if (!message || typeof message !== "object") return;
    if (message.type === "announce") {
      const key = String(message.pubkey || "");
      if (!key) return;
      const before = peers.get(key);
      const next = { socket, cell: String(message.cell || ""), role: message.role === "archive" ? "archive" : "player", catalog: String(message.catalog || ""), proto: Number(message.proto) || 1 };
      peers.set(key, next);
      socket.keys.add(key);
      if (before && before.cell !== next.cell) push(before.cell, [], [key]);
      if (!before || before.cell !== next.cell || before.role !== next.role || before.catalog !== next.catalog) push(next.cell, [entry(key, next)], []);
    } else if (message.type === "subscribe") {
      const cell = String(message.cell || "");
      subs.set(socket, cell);
      socket.deliver({ type: "present", cell, peers: inCell(cell), sub: true });
    } else if (message.type === "list") {
      const cell = String(message.cell || "");
      socket.deliver({ type: "present", cell, peers: inCell(cell) });
    } else if (message.type === "signal") {
      const target = peers.get(String(message.to || ""));
      if (target) target.socket.deliver({ type: "signal", from: String(message.from || ""), to: message.to, blob: String(message.blob || "") });
    }
  }
  function drop(socket) {
    subs.delete(socket);
    for (const key of socket.keys) {
      const p = peers.get(key);
      if (p && p.socket === socket) { peers.delete(key); push(p.cell, [], [key]); }
    }
  }
  // connect(onMessage) -> { send(text), close() }
  function connect(onMessage) {
    const socket = { keys: new Set(), open: true, deliver: (m) => { if (socket.open) setTimeout(() => socket.open && onMessage(JSON.stringify(m)), 0); } };
    return {
      send: (text) => { if (!socket.open) return; let m; try { m = JSON.parse(text); } catch { return; } handle(socket, m); },
      close: () => { if (!socket.open) return; socket.open = false; drop(socket); },
    };
  }
  return { connect, size: () => peers.size };
}

export const isLocalHubUrl = (url) => /^bc:/.test(String(url || ""));

// The hub for `bc:<room>`: the topmost same-origin window that hosts one, else this window.
export function findLocalHub(room, win = globalThis) {
  const chain = [];
  try { for (let w = win; w; w = w.parent === w ? null : w.parent) chain.push(w); } catch { /* cross-origin parent */ }
  for (const w of chain.reverse()) {
    try {
      if (w.meridianLocalHubs) return (w.meridianLocalHubs[room] ||= createLocalHub());
    } catch { /* cross-origin */ }
  }
  win.meridianLocalHubs = win.meridianLocalHubs || {};
  return (win.meridianLocalHubs[room] ||= createLocalHub());
}

// A WebSocket look-alike for room.js.
export function localSocket(url, win = globalThis) {
  const listeners = { open: new Set(), message: new Set(), error: new Set(), close: new Set() };
  const fire = (type, event) => { for (const fn of [...listeners[type]]) fn(event); };
  const hub = findLocalHub(String(url).slice(3) || "default", win);
  const sock = {
    readyState: 0,
    addEventListener: (type, fn) => listeners[type]?.add(fn),
    removeEventListener: (type, fn) => listeners[type]?.delete(fn),
    send: (text) => { if (sock.readyState === 1) link.send(text); },
    close: () => { if (sock.readyState > 1) return; sock.readyState = 3; link.close(); fire("close", {}); },
  };
  const link = hub.connect((data) => { if (sock.readyState === 1) fire("message", { data }); });
  setTimeout(() => { if (sock.readyState === 0) { sock.readyState = 1; fire("open", {}); } }, 0);
  return sock;
}
