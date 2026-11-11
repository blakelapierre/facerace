import { startRoom } from "@/vendor/meridian/net/room.js";
import { createTorrentRoom } from "@/vendor/meridian/net/signal-torrent.js";

export type ListedRoom = {
  id: string;
  code: string;
  course: string;
  host: string;
  live: boolean;
};

const BOARD = "facerace/board";

type Board = {
  announce: (card: { code: string; course: string; host: string; live: boolean }) => void;
  close: () => void;
};

function parseCatalog(raw: string): Omit<ListedRoom, "id"> | null {
  if (!raw.includes("|")) return null;
  const [code, course, host, state] = raw.split("|");
  if (!code || !course) return null;
  return {
    code: code.slice(0, 16),
    course: course.slice(0, 16),
    host: (host || "Racer").slice(0, 16),
    live: state === "live",
  };
}

/** The board is one torrent room. Hosts write their race into the catalog so anyone can find it. */
export async function openBoard(onRooms: (rooms: ListedRoom[], note: string) => void): Promise<Board> {
  const me = `fr-${crypto.randomUUID().slice(0, 8)}`;
  const room = createTorrentRoom({ me, cell: BOARD, role: "host", catalog: "", announceMs: 4000 }) as ReturnType<typeof createTorrentRoom> & {
    setCatalog?: (next: string) => void;
  };
  let stopped = false;
  let opened: { list: () => Promise<{ pubkey: string; catalog?: string }[]>; close: () => void };
  try {
    opened = await startRoom(room, { slowMs: 7000 });
  } catch {
    onRooms([], "Trackers are quiet — you can still race the field");
    return { announce() {}, close() {} };
  }
  const pull = async () => {
    if (stopped) return;
    try {
      const peers = await opened.list();
      const rooms: ListedRoom[] = [];
      for (const peer of peers) {
        if (peer.pubkey === me) continue;
        const card = parseCatalog(peer.catalog || "");
        if (card) rooms.push({ ...card, id: peer.pubkey });
      }
      onRooms(rooms, rooms.length ? "Rooms on the trackers" : "No rooms yet — open one");
    } catch {
      onRooms([], "Trackers are quiet — you can still race the field");
    }
  };
  const timer = setInterval(() => void pull(), 2000);
  void pull();
  return {
    announce(card) {
      room.setCatalog?.(`${card.code}|${card.course}|${card.host}|${card.live ? "live" : "open"}`);
    },
    close() {
      stopped = true;
      clearInterval(timer);
      try {
        opened.close();
      } catch {
        /* already shut */
      }
    },
  };
}

export function freshCode() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return out;
}
