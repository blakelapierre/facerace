import { hashHeader, nextBits, REWARD, workMeets, type Header } from "./work";
import { cartIdFor, mechanicCost, txTagOf, verifyAsk, verifyTx, type ChainTx } from "./tx";

export type Block = Header & { hash: string; tx?: ChainTx | null };

const STORE = "facerace-chain-v2";
const PENDING_KEY = "facerace-pending";
const SIDE_KEY = "facerace-side";
export const FAUCET = 40;

const genesis: Block = {
  height: 0,
  prev: "0000000000000000000000000000000000000000000000000000000000000000",
  time: 1731283200,
  miner: "6661636500000000",
  nonce: 0,
  bits: 16,
  txTag: 0,
  hash: "",
};
genesis.hash = hashHeader(genesis);

type Cart = { id: string; mechanic: string; owner: string };
type Listing = { cartId: string; mechanic: string; price: number; seller: string };
type Books = {
  chips: Map<string, number>;
  nonce: Map<string, number>;
  carts: Cart[];
  listings: Listing[];
};

const byHash = new Map<string, Block>();
let tip = genesis;
let orphans: Block[] = [];
let ready = false;
let pending: ChainTx[] = [];
const listeners = new Set<() => void>();

function boot() {
  if (ready) return;
  ready = true;
  byHash.set(genesis.hash, genesis);
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const saved = JSON.parse(raw) as Block[];
      for (const block of saved) consider(block);
    }
  } catch {
    /* keep genesis */
  }
  try {
    const raw = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]") as ChainTx[];
    if (Array.isArray(raw)) pending = raw.filter((item) => item?.sig && item.from);
  } catch {
    pending = [];
  }
}

function persist() {
  try {
    const chain: Block[] = [];
    let cursor: Block | undefined = tip;
    const seen = new Set<string>();
    while (cursor && !seen.has(cursor.hash)) {
      seen.add(cursor.hash);
      chain.push(cursor);
      if (cursor.height === 0) break;
      cursor = byHash.get(cursor.prev);
    }
    localStorage.setItem(STORE, JSON.stringify(chain.reverse().slice(-400)));
  } catch {
    /* private mode */
  }
}

function savePending() {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending.slice(-20)));
  } catch {
    /* ignore */
  }
}

function tell() {
  for (const listener of listeners) listener();
}

export function watchChain(listener: () => void) {
  boot();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function chainBlocks() {
  const chain: Block[] = [];
  let cursor: Block | undefined = tip;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.hash)) {
    seen.add(cursor.hash);
    chain.push(cursor);
    if (cursor.height === 0) break;
    cursor = byHash.get(cursor.prev);
  }
  return chain.reverse();
}

function blank(): Books {
  return { chips: new Map(), nonce: new Map(), carts: [], listings: [] };
}

function chipsOf(books: Books, address: string) {
  return books.chips.get(address) ?? FAUCET;
}

function applyTx(books: Books, tx: ChainTx, asked: boolean): string {
  const nonce = books.nonce.get(tx.from) ?? 0;
  if (tx.nonce !== nonce + 1) return "Out of order.";
  if (tx.kind === "hire") {
    const cost = mechanicCost(tx.mechanic);
    if (!cost || tx.price !== cost || tx.cartId !== cartIdFor(tx.mechanic, tx.from, tx.nonce)) return "Bad mint.";
    if (chipsOf(books, tx.from) < cost) return "Not enough chips.";
    books.chips.set(tx.from, chipsOf(books, tx.from) - cost);
    books.carts.push({ id: tx.cartId, mechanic: tx.mechanic, owner: tx.from });
  } else if (tx.kind === "list") {
    const cart = books.carts.find((item) => item.id === tx.cartId && item.owner === tx.from);
    if (!cart || books.listings.some((item) => item.cartId === tx.cartId)) return "That cart is not yours to list.";
    if (tx.price <= 0) return "Name a price.";
    books.listings.push({ cartId: tx.cartId, mechanic: cart.mechanic, price: tx.price, seller: tx.from });
  } else if (tx.kind === "buy") {
    const cart = books.carts.find((item) => item.id === tx.cartId && item.owner === tx.seller);
    const listed = books.listings.find((item) => item.cartId === tx.cartId);
    if (!cart || tx.from === tx.seller) return "Nothing to buy.";
    if (listed) {
      if (listed.price !== tx.price || listed.seller !== tx.seller) return "The chain listing changed.";
    } else if (!asked) return "The seller has not signed that price.";
    if (chipsOf(books, tx.from) < tx.price) return "Not enough chips.";
    books.chips.set(tx.from, chipsOf(books, tx.from) - tx.price);
    books.chips.set(tx.seller, chipsOf(books, tx.seller) + tx.price);
    cart.owner = tx.from;
    books.listings = books.listings.filter((item) => item.cartId !== tx.cartId);
  } else if (tx.kind === "drop") {
    if (!books.listings.some((item) => item.cartId === tx.cartId && item.seller === tx.from)) return "No chain listing.";
    books.listings = books.listings.filter((item) => item.cartId !== tx.cartId);
  } else return "Unknown transaction.";
  books.nonce.set(tx.from, tx.nonce);
  return "";
}

function replay(extra: ChainTx[] = []): Books {
  const books = blank();
  for (const block of chainBlocks()) {
    if (block.height > 0) books.chips.set(block.miner, chipsOf(books, block.miner) + REWARD);
    if (block.tx) applyTx(books, block.tx, Boolean(block.tx.ask));
  }
  for (const tx of extra) applyTx(books, tx, Boolean(tx.ask));
  return books;
}

function txFits(tx: ChainTx, books: Books) {
  return applyTx(structuredCloneBooks(books), tx, Boolean(tx.ask) || books.listings.some((item) => item.cartId === tx.cartId)) === "";
}

export function sideOf(address: string) {
  try {
    const raw = JSON.parse(localStorage.getItem(SIDE_KEY) || "{}") as Record<string, number>;
    return Number(raw[address]) || 0;
  } catch {
    return 0;
  }
}

export function addSide(address: string, delta: number) {
  const raw = JSON.parse(localStorage.getItem(SIDE_KEY) || "{}") as Record<string, number>;
  raw[address] = Math.round(((Number(raw[address]) || 0) + delta) * 100) / 100;
  localStorage.setItem(SIDE_KEY, JSON.stringify(raw));
}

export type Holdings = {
  chips: number;
  carts: { id: string; mechanic: string }[];
  lists: { cartId: string; mechanic: string; price: number; seller: string }[];
  nonce: number;
  pending: ChainTx[];
};

export function holdings(address: string): Holdings {
  boot();
  const confirmed = replay();
  const projected = replay(pending);
  return {
    chips: chipsOf(projected, address) + sideOf(address),
    carts: confirmed.carts.filter((item) => item.owner === address).map((item) => ({ id: item.id, mechanic: item.mechanic })),
    lists: confirmed.listings,
    nonce: projected.nonce.get(address) ?? confirmed.nonce.get(address) ?? 0,
    pending: pending.filter((tx) => tx.from === address),
  };
}

export function chainLists() {
  boot();
  return replay().listings;
}

export async function submitTx(tx: ChainTx) {
  boot();
  if (!(await verifyTx(tx))) return "Bad signature.";
  if (tx.kind === "buy" && !replay().listings.some((item) => item.cartId === tx.cartId)) {
    if (!(await verifyAsk(tx))) return "The seller did not sign that price.";
  }
  const err = applyTx(replay(pending), tx, Boolean(tx.ask) || replay().listings.some((item) => item.cartId === tx.cartId));
  if (err) return err;
  pending = pending.filter((item) => !(item.from === tx.from && item.nonce === tx.nonce));
  pending.push(tx);
  savePending();
  tell();
  return "";
}

export function nextTx(): ChainTx | null {
  boot();
  const books = replay();
  for (const tx of pending) {
    if (txFits(tx, books)) return tx;
  }
  return null;
}

function structuredCloneBooks(books: Books): Books {
  return {
    chips: new Map(books.chips),
    nonce: new Map(books.nonce),
    carts: books.carts.map((item) => ({ ...item })),
    listings: books.listings.map((item) => ({ ...item })),
  };
}

function link(block: Block) {
  byHash.set(block.hash, block);
  if (block.height > tip.height) tip = block;
  const kids = orphans.filter((item) => item.prev === block.hash);
  orphans = orphans.filter((item) => item.prev !== block.hash);
  for (const kid of kids) {
    if (kid.height === block.height + 1 && kid.time >= block.time && kid.bits === nextBits(block, kid.time) && kid.txTag === txTagOf(kid.tx)) link(kid);
  }
}

export function consider(block: Block): "added" | "known" | "orphan" | "bad" {
  boot();
  if (!block || typeof block.hash !== "string" || block.hash.length !== 64) return "bad";
  if (byHash.has(block.hash)) return "known";
  const tx = block.tx ?? null;
  const tagged = { ...block, txTag: block.txTag || 0 };
  if (tagged.hash !== hashHeader(tagged) || !workMeets(tagged.hash, tagged.bits)) return "bad";
  if ((tagged.txTag || 0) !== txTagOf(tx)) return "bad";
  if (tagged.height === 0) return tagged.hash === genesis.hash ? "known" : "bad";
  const parent = byHash.get(tagged.prev);
  if (!parent) {
    orphans.push(tagged);
    if (orphans.length > 30) orphans.shift();
    return "orphan";
  }
  if (tagged.height !== parent.height + 1 || tagged.time < parent.time) return "bad";
  if (tagged.bits !== nextBits(parent, tagged.time)) return "bad";
  if (tx) {
    const atParent = replayUntil(parent.hash);
    if (!txFits(tx, atParent)) return "bad";
  }
  link(tagged);
  if (tx) pending = pending.filter((item) => !(item.from === tx.from && item.nonce === tx.nonce));
  const books = replay();
  const keep: ChainTx[] = [];
  for (const item of pending) {
    if (txFits(item, books)) {
      keep.push(item);
      applyTx(books, item, Boolean(item.ask) || books.listings.some((listing) => listing.cartId === item.cartId));
    }
  }
  pending = keep;
  savePending();
  persist();
  tell();
  return "added";
}

function replayUntil(hash: string) {
  const books = blank();
  for (const block of chainBlocks()) {
    if (block.height > 0) books.chips.set(block.miner, chipsOf(books, block.miner) + REWARD);
    if (block.tx) applyTx(books, block.tx, Boolean(block.tx.ask));
    if (block.hash === hash) break;
  }
  return books;
}

export async function acceptBlock(block: Block) {
  const tx = block.tx;
  if (tx) {
    if (!(await verifyTx(tx))) return "bad" as const;
    if (tx.kind === "buy" && tx.ask && !(await verifyAsk(tx))) return "bad" as const;
  }
  return consider(block);
}

export function chainTip() {
  boot();
  return tip;
}

export function blocksAfter(height: number) {
  boot();
  const chain: Block[] = [];
  let cursor: Block | undefined = tip;
  const seen = new Set<string>();
  while (cursor && cursor.height > height && !seen.has(cursor.hash)) {
    seen.add(cursor.hash);
    chain.push({ ...cursor });
    if (cursor.height === 0) break;
    cursor = byHash.get(cursor.prev);
  }
  return chain.reverse().slice(-8);
}

export function minedBy(address: string) {
  boot();
  let total = 0;
  let cursor: Block | undefined = tip;
  const seen = new Set<string>();
  while (cursor && cursor.height > 0 && !seen.has(cursor.hash)) {
    seen.add(cursor.hash);
    if (cursor.miner === address) total += REWARD;
    cursor = byHash.get(cursor.prev);
  }
  return total;
}

export { REWARD };
