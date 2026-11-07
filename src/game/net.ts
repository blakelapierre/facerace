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
  yaw: number;
  face: FaceImage | null;
  color: [number, number, number];
};

type Link = {
  id: string;
  pc: RTCPeerConnection;
  ctrl: RTCDataChannel;
  snap: RTCDataChannel;
  motion: ReturnType<typeof createSendState>;
  view: { state: { tick?: number } | null };
  dropped: boolean;
  name: string;
  faceUrl: string;
  faceSent: string;
};

export type RacePose = {
  x: number;
  y: number;
  yaw: number;
  speed: number;
  yawRate: number;
  name: string;
  faceUrl: string;
};

export type RaceNet = {
  tick: (pose: RacePose, simTime: number) => void;
  racers: () => RemoteRacer[];
  close: () => void;
  peers: () => number;
};

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
  const me = `fr-${crypto.randomUUID().slice(0, 8)}`;
  const cell = `facerace/${roomCode.trim().toLowerCase() || "pit"}`;
  const links = new Map<string, Link>();
  const opening = new Set<string>();
  const faces = new Map<string, FaceImage | null>();
  let closed = false;
  let poseTick = 0;

  const room = createTorrentRoom({
    me,
    cell,
    role: "player",
    catalog: "facerace/1",
  });

  const empty: RaceNet = {
    tick: () => {},
    racers: () => [],
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
    };
    links.set(to, link);
    ctrl.onopen = () => {
      try {
        ctrl.send(helloMessage("facerace/1", 1.2, 400));
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
        const msg = JSON.parse(text) as { t?: string; name?: string; face?: string };
        if (msg.t === "face") {
          if (typeof msg.name === "string" && msg.name) link.name = msg.name.slice(0, 16);
          if (typeof msg.face === "string" && msg.face.startsWith("data:image") && msg.face !== link.faceUrl) {
            link.faceUrl = msg.face;
            void faceFromUrl(msg.face).then((img) => {
              if (img) faces.set(to, img);
            });
          }
        }
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
        const pose = shown(link.view, poseTick, now);
        if (!pose) continue;
        settle(link.view, 1 / 30);
        out.push({
          id: link.id,
          name: link.name,
          x: pose.p[0],
          y: pose.p[1],
          yaw: pose.yaw,
          face: faces.get(link.id) ?? null,
          color: hashColor(link.id),
        });
      }
      return out;
    },
    tick: (pose, simTime) => {
      poseTick = Math.floor(simTime * 30);
      const v: [number, number, number] = [Math.sin(pose.yaw) * pose.speed, Math.cos(pose.yaw) * pose.speed, 0];
      const now = {
        tick: poseTick,
        p: [pose.x, pose.y, 0.4],
        v,
        a: [0, 0, 0],
        yaw: pose.yaw,
        yawRate: pose.yawRate,
        pitch: 0,
        floor: 0,
        mode: modeOf(v, false),
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
            link.ctrl.send(JSON.stringify({ t: "face", name: pose.name, face: pose.faceUrl }));
            link.faceSent = pose.faceUrl;
          } catch {
            /* reliable channel will retry next pose */
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
