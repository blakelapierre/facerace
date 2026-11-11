import { ringNeighbors } from "@/vendor/meridian/net/mesh.js";
import {
  ackMessage,
  createSendState,
  createView,
  isMotion,
  modeOf,
  noteAck,
  readAck,
  receive,
  sendNow,
  settle,
  shouldSend,
  shown,
} from "@/vendor/meridian/net/motion.js";
import { connectPeer, startRoom } from "@/vendor/meridian/net/room.js";
import { createTorrentRoom } from "@/vendor/meridian/net/signal-torrent.js";
import { helloMessage, readHello } from "@/vendor/meridian/net/wire.js";
import { faceFromUrl, type FaceImage } from "./faces";

export type RemoteRacer = {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  face: FaceImage | null;
  color: [number, number, number];
  travel: number;
  done: boolean;
  pitch: number;
  roll: number;
};

type Link = {
  id: string;
  pc: RTCPeerConnection;
  ctrl: RTCDataChannel;
  snap: RTCDataChannel;
  motion: ReturnType<typeof createSendState>;
  view: { state: { tick?: number; p?: number[]; v?: number[]; yaw?: number } | null };
  dropped: boolean;
  name: string;
  faceUrl: string;
  faceSent: string;
  travel: number;
  done: boolean;
  pitch: number;
  roll: number;
  whoAt: number;
};

export type RacePose = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  speed: number;
  yawRate: number;
  air?: boolean;
  pitch?: number;
  roll?: number;
  name: string;
  faceUrl: string;
  travel?: number;
  done?: boolean;
};

export type RoomPerson = {
  id: string;
  name: string;
  face: FaceImage | null;
  travel: number;
  done: boolean;
};

export type RaceNet = {
  id: () => string;
  tick: (pose: RacePose, simTime: number) => void;
  racers: () => RemoteRacer[];
  people: () => RoomPerson[];
  setIdentity: (name: string, faceUrl: string) => void;
  say: (text: string) => void;
  onSay: (fn: (from: string, text: string) => void) => () => void;
  onSkid: (fn: (mark: { x: number; y: number; x2: number; y2: number }) => void) => () => void;
  close: () => void;
  peers: () => number;
};

function selfId() {
  const key = "facerace-peer";
  try {
    const had = sessionStorage.getItem(key);
    if (had && /^fr-[0-9a-z-]{8,}$/i.test(had)) return had;
    const id = `fr-${crypto.randomUUID()}`;
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return `fr-${crypto.randomUUID()}`;
  }
}

function hashColor(id: string): [number, number, number] {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  const r = 0.35 + ((h >>> 0) % 180) / 255;
  const g = 0.3 + ((h >>> 8) % 160) / 255;
  const b = 0.25 + ((h >>> 16) % 140) / 255;
  return [r, g, b];
}

export async function createRaceNet(
  roomCode: string,
  onStatus: (line: string) => void,
): Promise<RaceNet> {
  const me = selfId();
  const cell = `facerace/${roomCode.trim().toLowerCase() || "pit"}`;
  const links = new Map<string, Link>();
  const opening = new Set<string>();
  const faces = new Map<string, FaceImage | null>();
  const sayers = new Set<(from: string, text: string) => void>();
  const skidders = new Set<(mark: { x: number; y: number; x2: number; y2: number }) => void>();
  let closed = false;
  let poseTick = 0;
  let identity = { name: "Racer", faceUrl: "" };

  const room = createTorrentRoom({
    me,
    cell,
    role: "player",
    catalog: "facerace/1",
  });

  const empty: RaceNet = {
    id: () => me,
    tick: () => {},
    racers: () => [],
    people: () => [],
    setIdentity: (name, faceUrl) => {
      identity = { name, faceUrl };
    },
    say: () => {},
    onSay: () => () => {},
    onSkid: () => () => {},
    peers: () => 0,
    close: () => {
      closed = true;
    },
  };

  let live: { list: () => Promise<{ pubkey: string }[]>; onMessage: (fn: (message: { type?: string }) => void) => void; close: () => void };
  try {
    onStatus("Finding the room…");
    live = await startRoom(room, {
      slowMs: 8000,
      onState: (state?: string) => {
        if (state === "up") onStatus("Room open");
        if (state === "slow") onStatus("Trackers are slow");
      },
    });
  } catch {
    onStatus("Trackers quiet — racing the field alone");
    try {
      room.close();
    } catch {
      /* already shut */
    }
    return empty;
  }
  if (closed) {
    live.close();
    return empty;
  }
  onStatus("Room open");

  async function openLink(to: string, offer: boolean) {
    if (closed || to === me || links.has(to) || opening.has(to)) return;
    opening.add(to);
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    const mk = (label: string, id: number, ordered: boolean) => {
      const channel = pc.createDataChannel(label, {
        negotiated: true,
        id,
        ordered,
        ...(ordered ? {} : { maxRetransmits: 0 }),
      });
      channel.binaryType = "arraybuffer";
      return channel;
    };
    const ctrl = mk("ctrl", 0, true);
    const snap = mk("snap", 2, false);
    const link: Link = {
      id: to,
      pc,
      ctrl,
      snap,
      motion: createSendState(),
      view: createView() as Link["view"],
      dropped: false,
      name: to.slice(0, 6),
      faceUrl: "",
      faceSent: "",
      travel: 0,
      done: false,
      pitch: 0,
      roll: 0,
      whoAt: 0,
    };
    links.set(to, link);
    ctrl.onopen = () => {
      try {
        ctrl.send(helloMessage("facerace/1", 1.2, 400));
        ctrl.send(JSON.stringify({ t: "who", name: identity.name, face: identity.faceUrl }));
      } catch {
        /* hello retries with the face packet */
      }
    };
    ctrl.onmessage = (event) => {
      const text = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data);
      const ack = readAck(text);
      if (ack) {
        noteAck(link.motion, ack.tick);
        return;
      }
      const hello = readHello(text);
      if (hello) return;
      try {
        const msg = JSON.parse(text) as { t?: string; name?: string; face?: string; travel?: number; done?: boolean };
        if (msg.t === "who" || msg.t === "face") {
          if (typeof msg.name === "string" && msg.name) link.name = msg.name.slice(0, 16);
          if (typeof msg.face === "string" && msg.face.startsWith("data:image") && msg.face !== link.faceUrl) {
            link.faceUrl = msg.face;
            void faceFromUrl(msg.face).then((img) => {
              if (img) faces.set(to, img);
            });
          }
          return;
        }
        if (msg.t === "prog") {
          link.travel = Number(msg.travel) || 0;
          link.done = Boolean(msg.done);
          return;
        }
        if (msg.t === "lean") {
          const lean = msg as { p?: number; r?: number };
          if (Number.isFinite(lean.p)) link.pitch = Number(lean.p);
          if (Number.isFinite(lean.r)) link.roll = Number(lean.r);
          return;
        }
        if (msg.t === "skid") {
          const mark = msg as { x?: number; y?: number; x2?: number; y2?: number };
          if ([mark.x, mark.y, mark.x2, mark.y2].every((n) => Number.isFinite(n))) {
            for (const hear of skidders) hear({ x: Number(mark.x), y: Number(mark.y), x2: Number(mark.x2), y2: Number(mark.y2) });
          }
          return;
        }
        for (const hear of sayers) hear(to, text);
      } catch {
        /* ignore chatter */
      }
    };
    snap.onmessage = (event) => {
      const raw = new Uint8Array(event.data as ArrayBuffer);
      if (!isMotion(raw)) return;
      try {
        if (receive(link.view, raw, poseTick, 0, performance.now())) {
          const got = link.view.state?.tick;
          if (got !== undefined && ctrl.readyState === "open") {
            try {
              ctrl.send(ackMessage(got));
            } catch {
              /* next pose repeats */
            }
          }
        }
      } catch {
        /* drop a bad pose */
      }
    };
    try {
      await connectPeer({
        pc,
        room: live,
        me,
        to,
        offer,
        isOpen: () => link.dropped || closed || snap.readyState === "open" || ctrl.readyState === "open",
        status: (line: string) => onStatus(line),
      });
    } catch {
      link.dropped = true;
      links.delete(to);
    } finally {
      opening.delete(to);
    }
  }

  live.onMessage((message: { type?: string; add?: { pubkey: string }[] }) => {
    if (message.type !== "roster" && message.type !== "present") return;
    void live.list().then((peers: { pubkey: string }[]) => {
      const ids = peers.map((peer) => peer.pubkey);
      const want = new Set(ringNeighbors([...ids, me], me, 8));
      for (const id of want) void openLink(id, me < id);
    });
  });

  void live.list().then((peers: { pubkey: string }[]) => {
    for (const peer of peers) void openLink(peer.pubkey, me < peer.pubkey);
  });

  return {
    peers: () => links.size,
    racers: () => {
      const out: RemoteRacer[] = [];
      const now = performance.now();
      for (const link of links.values()) {
        const pose = shown(link.view, poseTick, now) as { p: number[]; v?: number[]; yaw: number; pitch?: number } | null;
        if (!pose) continue;
        settle(link.view, 1 / 30);
        out.push({
          id: link.id,
          name: link.name,
          x: pose.p[0],
          y: pose.p[1],
          z: pose.p[2],
          vx: pose.v?.[0] ?? 0,
          vy: pose.v?.[1] ?? 0,
          vz: pose.v?.[2] ?? 0,
          yaw: pose.yaw,
          face: faces.get(link.id) ?? null,
          color: hashColor(link.id),
          travel: link.travel,
          done: link.done,
          pitch: link.pitch || pose.pitch || 0,
          roll: link.roll,
        });
      }
      return out;
    },
    people: () =>
      [...links.values()]
        .filter((link) => !link.dropped && (link.ctrl.readyState === "open" || link.snap.readyState === "open"))
        .map((link) => ({
          id: link.id,
          name: link.name,
          face: faces.get(link.id) ?? null,
          travel: link.travel,
          done: link.done,
        })),
    id: () => me,
    setIdentity: (name, faceUrl) => {
      identity = { name: name.slice(0, 16) || "Racer", faceUrl };
      for (const link of links.values()) {
        if (link.ctrl.readyState !== "open") continue;
        try {
          link.ctrl.send(JSON.stringify({ t: "who", name: identity.name, face: identity.faceUrl }));
        } catch {
          /* next tick */
        }
      }
    },
    say: (text) => {
      for (const link of links.values()) {
        if (link.ctrl.readyState !== "open") continue;
        try {
          link.ctrl.send(text);
        } catch {
          /* channel closing */
        }
      }
      for (const hear of sayers) hear(me, text);
    },
    onSay: (fn) => {
      sayers.add(fn);
      return () => sayers.delete(fn);
    },
    onSkid: (fn) => {
      skidders.add(fn);
      return () => skidders.delete(fn);
    },
    tick: (pose, simTime) => {
      poseTick = Math.floor(simTime * 30);
      const airborne = Boolean(pose.air);
      const v: [number, number, number] = [pose.vx, pose.vy, pose.vz];
      const now = {
        tick: poseTick,
        p: [pose.x, pose.y, pose.z] as [number, number, number],
        v,
        a: [0, 0, airborne ? -18 : 0] as [number, number, number],
        yaw: pose.yaw,
        yawRate: pose.yawRate,
        pitch: pose.pitch || 0,
        floor: airborne ? pose.z - 4 : pose.z,
        mode: modeOf(v, airborne),
        wallMs: performance.now(),
      };
      for (const link of links.values()) {
        if (link.snap.readyState !== "open") continue;
        if (!shouldSend(link.motion, now, 0)) continue;
        try {
          link.snap.send(sendNow(link.motion, now, 0));
        } catch {
          /* channel closing */
        }
        if (link.ctrl.readyState === "open" && pose.faceUrl && link.faceSent !== pose.faceUrl) {
          try {
            link.ctrl.send(JSON.stringify({ t: "who", name: pose.name, face: pose.faceUrl }));
            link.faceSent = pose.faceUrl;
          } catch {
            /* reliable channel will retry next pose */
          }
        }
        if (link.ctrl.readyState === "open" && performance.now() - link.whoAt > 100) {
          link.whoAt = performance.now();
          try {
            link.ctrl.send(JSON.stringify({ t: "prog", travel: pose.travel || 0, done: Boolean(pose.done) }));
            link.ctrl.send(JSON.stringify({ t: "lean", p: pose.pitch || 0, r: pose.roll || 0 }));
          } catch {
            /* next pose */
          }
        }
      }
    },
    close: () => {
      closed = true;
      for (const link of links.values()) {
        link.dropped = true;
        try {
          link.pc.close();
        } catch {
          /* already gone */
        }
      }
      links.clear();
      try {
        live.close();
      } catch {
        /* already gone */
      }
    },
  };
}
