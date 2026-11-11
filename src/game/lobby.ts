import { startRoom } from "@/vendor/meridian/net/room.js";
import { createTorrentRoom } from "@/vendor/meridian/net/signal-torrent.js";

export type ListedRoom = {
  id: string;
  code: string;
  course: string;
  host: string;
  live: boolean;
  gun: number;
};

export type MarketListing = {
  id: string;
  mechanic: string;
  price: number;
  seller: string;
  nonce: number;
  cartId: string;
  x: string;
  y: string;
  sig: string;
};

export type MarketPay = {
  id: string;
  seller: string;
  amount: number;
  buyer: string;
  nonce: number;
  mechanic: string;
  x: string;
  y: string;
  sig: string;
};

const BOARD = "facerace/board";

type Board = {
  announce: (card: { code: string; course: string; host: string; live: boolean; gun?: number }) => void;
  post: (catalog: string) => void;
  close: () => void;
};

function parseCatalog(raw: string): Omit<ListedRoom, "id"> | null {
  if (!raw.includes("|") || raw.startsWith("s|") || raw.startsWith("p|")) return null;
  const [code, course, host, state, gun] = raw.split("|");
  if (!code || !course) return null;
  return {
    code: code.slice(0, 16),
    course: course.slice(0, 16),
    host: (host || "Racer").slice(0, 16),
    live: state === "live",
    gun: Number(gun) || 0,
  };
}

function parseListing(raw: string, id: string): MarketListing | null {
  if (!raw.startsWith("s|")) return null;
  const [, mechanic, price, seller, nonce, cartId, x, y, sig] = raw.split("|");
  if (!mechanic || !seller || !cartId || !x || !y || !sig) return null;
  return { id, mechanic, price: Number(price) || 0, seller, nonce: Number(nonce) || 0, cartId, x, y, sig };
}

function parsePay(raw: string): MarketPay | null {
  if (!raw.startsWith("p|")) return null;
  const [, seller, amount, buyer, nonce, mechanic, x, y, sig] = raw.split("|");
  if (!seller || !buyer || !mechanic || !x || !y || !sig) return null;
  return {
    id: `${buyer}:${nonce}`,
    seller,
    amount: Number(amount) || 0,
    buyer,
    nonce: Number(nonce) || 0,
    mechanic,
    x,
    y,
    sig,
  };
}

/** The board is one torrent room. Hosts write their race into the catalog so anyone can find it. */
export async function openBoard(
  onRooms: (rooms: ListedRoom[], note: string) => void,
  onMarket?: (listings: MarketListing[], pays: MarketPay[]) => void,
): Promise<Board> {
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
    return { announce() {}, post() {}, close() {} };
  }
  const pull = async () => {
    if (stopped) return;
    try {
      const peers = await opened.list();
      const rooms: ListedRoom[] = [];
      const listings: MarketListing[] = [];
      const pays: MarketPay[] = [];
      for (const peer of peers) {
        if (peer.pubkey === me) continue;
        const raw = peer.catalog || "";
        const card = parseCatalog(raw);
        if (card) rooms.push({ ...card, id: peer.pubkey });
        const listing = parseListing(raw, peer.pubkey);
        if (listing) listings.push(listing);
        const pay = parsePay(raw);
        if (pay) pays.push(pay);
      }
      onRooms(rooms, rooms.length ? "Rooms on the trackers" : "No rooms yet — open one");
      onMarket?.(listings, pays);
    } catch {
      onRooms([], "Trackers are quiet — you can still race the field");
    }
  };
  const timer = setInterval(() => void pull(), 2000);
  void pull();
  return {
    announce(card) {
      room.setCatalog?.(`${card.code}|${card.course}|${card.host}|${card.live ? "live" : "open"}${card.gun ? `|${Math.round(card.gun)}` : ""}`);
    },
    post(catalog) {
      room.setCatalog?.(catalog);
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
