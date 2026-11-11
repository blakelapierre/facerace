import { hashHeader, nextBits, REWARD, workMeets, type Header } from "./work";
import { cartIdFor, mechanicCost, txTagOf, verifyAsk, verifyTx, type ChainTx } from "./tx";
import { PURSE_SIZES, PURSE_STAKES, purseKey, purseSpec } from "./yard";

export type Block = Header & { hash: string; tx?: ChainTx | null };

const STORE = "facerace-chain-v2";
const PENDING_KEY = "facerace-pending";
const SIDE_KEY = "facerace-side";
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

export const FAUCET = 40;
export const DEV_POOL = "dev-pool";
export const BONUS_POOL = "bonus-purse";
export const MATERIALS = ["oil", "battery", "engine"] as const;
export type Material = (typeof MATERIALS)[number];

const STARTER: Record<Material, number> = { oil: 6, battery: 3, engine: 1 };

type Cart = {
  id: string;
  mechanic: string;
  owner: string;
  wings: boolean;
  rudder: boolean;
  wins: number;
  purseWins: number;
  races: number;
};
type Listing = { cartId: string; mechanic: string; price: number; seller: string };
type MatList = { id: string; token: Material; amount: number; price: number; seller: string };
type PurseBook = { epoch: number; seats: string[]; started: number };
type Job = { boss: string; wage: number; skill: number };
type Bag = Record<Material, number>;
type Books = {
  chips: Map<string, number>;
  nonce: Map<string, number>;
  carts: Cart[];
  listings: Listing[];
  purses: Map<string, PurseBook>;
  mats: Map<string, Bag>;
  jobs: Map<string, Job>;
  matLists: MatList[];
  amm: Record<Material, { chips: number; token: number }>;
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
  return {
    chips: new Map(),
    nonce: new Map(),
    carts: [],
    listings: [],
    purses: new Map(),
    mats: new Map(),
    jobs: new Map(),
    matLists: [],
    amm: {
      oil: { chips: 80, token: 40 },
      battery: { chips: 90, token: 18 },
      engine: { chips: 120, token: 8 },
    },
  };
}

function chipsOf(books: Books, address: string) {
  if (books.chips.has(address)) return books.chips.get(address)!;
  if (address === DEV_POOL || address === BONUS_POOL) return 0;
  return FAUCET;
}

function bagOf(books: Books, address: string) {
  let bag = books.mats.get(address);
  if (!bag) {
    bag = { ...STARTER };
    books.mats.set(address, bag);
  }
  return bag;
}

function isMaterial(id: string): id is Material {
  return id === "oil" || id === "battery" || id === "engine";
}

function jobOf(books: Books, id: string) {
  return books.jobs.get(id) ?? { boss: "", wage: mechanicCost(id), skill: 1 };
}

function bankFee(books: Books, amount: number, previous: string) {
  const buyout = previous ? Math.floor(amount * 0.25) : 0;
  const dev = Math.floor(amount * 0.4);
  const bonus = amount - buyout - dev;
  if (buyout > 0) books.chips.set(previous, chipsOf(books, previous) + buyout);
  if (dev > 0) books.chips.set(DEV_POOL, chipsOf(books, DEV_POOL) + dev);
  if (bonus > 0) books.chips.set(BONUS_POOL, chipsOf(books, BONUS_POOL) + bonus);
}

function noteCart(books: Books, id: string, owner: string, purse: boolean) {
  const cart = books.carts.find((item) => item.id === id && item.owner === owner);
  if (!cart) return;
  cart.wins += 1;
  if (purse) cart.purseWins += 1;
  const job = books.jobs.get(cart.mechanic);
  if (job) job.skill += 1;
}

function purseOf(books: Books, key: string) {
  let purse = books.purses.get(key);
  if (!purse) {
    purse = { epoch: 0, seats: [], started: 0 };
    books.purses.set(key, purse);
  }
  return purse;
}

function applyTx(books: Books, tx: ChainTx, asked: boolean, blockTime = 0): string {
  const nonce = books.nonce.get(tx.from) ?? 0;
  if (tx.nonce !== nonce + 1) return "Out of order.";
  if (tx.kind === "hire") {
    const cost = mechanicCost(tx.mechanic);
    if (!cost || tx.price !== cost || tx.cartId !== cartIdFor(tx.mechanic, tx.from, tx.nonce)) return "Bad mint.";
    if (chipsOf(books, tx.from) < cost) return "Not enough chips.";
    const crew = jobOf(books, tx.mechanic);
    if (tx.askNonce === 1 && crew.boss && crew.boss !== tx.from) return "Poach them first.";
    books.chips.set(tx.from, chipsOf(books, tx.from) - cost);
    bankFee(books, cost, "");
    books.carts.push({
      id: tx.cartId,
      mechanic: tx.mechanic,
      owner: tx.from,
      wings: false,
      rudder: false,
      wins: 0,
      purseWins: 0,
      races: 0,
    });
    if (!crew.boss || crew.boss === tx.from) books.jobs.set(tx.mechanic, { boss: tx.from, wage: cost, skill: crew.skill || 1 });
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
  } else if (tx.kind === "seat" || tx.kind === "claim") {
    const spec = purseSpec(tx.cartId);
    if (!spec) return "That purse is not open.";
    const purse = purseOf(books, tx.cartId);
    if (tx.askNonce !== purse.epoch) return "That purse already left.";
    if (tx.kind === "seat") {
      if (tx.price !== spec.stake) return "Wrong stake.";
      if (purse.started) return "That purse already left.";
      if (purse.seats.includes(tx.from)) return "You already have a seat.";
      if (chipsOf(books, tx.from) < tx.price) return "Not enough chips.";
      books.chips.set(tx.from, chipsOf(books, tx.from) - tx.price);
      purse.seats.push(tx.from);
      const raced = books.carts.find((item) => item.id === tx.mechanic && item.owner === tx.from);
      if (raced) raced.races += 1;
      if (purse.seats.length >= spec.size && blockTime > 0) purse.started = blockTime;
    } else {
      if (!purse.started || !purse.seats.includes(tx.from)) return "Nothing to claim.";
      if (tx.price !== spec.pot) return "Bad pot.";
      const pool = chipsOf(books, BONUS_POOL);
      const gift = Math.min(pool, Math.floor(spec.pot * 0.25));
      if (gift > 0) books.chips.set(BONUS_POOL, pool - gift);
      books.chips.set(tx.from, chipsOf(books, tx.from) + spec.pot + gift);
      noteCart(books, tx.mechanic, tx.from, true);
      books.purses.set(tx.cartId, { epoch: purse.epoch + 1, seats: [], started: 0 });
    }
  } else if (tx.kind === "send") {
    if (!tx.seller || tx.seller === tx.from) return "Name a wallet.";
    if (isMaterial(tx.mechanic)) {
      const count = tx.askNonce;
      if (count < 1) return "Name an amount.";
      const bag = bagOf(books, tx.from);
      if (bag[tx.mechanic] < count) return "Not enough.";
      bag[tx.mechanic] -= count;
      bagOf(books, tx.seller)[tx.mechanic] += count;
    } else {
      if (tx.price < 1) return "Name an amount.";
      if (chipsOf(books, tx.from) < tx.price) return "Not enough chips.";
      books.chips.set(tx.from, chipsOf(books, tx.from) - tx.price);
      books.chips.set(tx.seller, chipsOf(books, tx.seller) + tx.price);
    }
  } else if (tx.kind === "wing" || tx.kind === "rudder") {
    const cart = books.carts.find((item) => item.id === tx.cartId && item.owner === tx.from);
    if (!cart) return "That cart is not yours.";
    const token: Material = tx.kind === "wing" ? "oil" : "battery";
    const chips = tx.kind === "wing" ? 8 : 6;
    const units = tx.kind === "wing" ? 2 : 1;
    if (tx.price !== chips || tx.askNonce !== units) return "Wrong price.";
    if (tx.kind === "wing" ? cart.wings : cart.rudder) return "Already fitted.";
    if (chipsOf(books, tx.from) < chips) return "Not enough chips.";
    const bag = bagOf(books, tx.from);
    if (bag[token] < units) return "Not enough.";
    books.chips.set(tx.from, chipsOf(books, tx.from) - chips);
    bag[token] -= units;
    bankFee(books, chips, "");
    if (tx.kind === "wing") cart.wings = true;
    else cart.rudder = true;
  } else if (tx.kind === "poach") {
    if (!mechanicCost(tx.mechanic)) return "No such mechanic.";
    const crew = jobOf(books, tx.mechanic);
    const need = Math.max(crew.wage, mechanicCost(tx.mechanic)) + 4;
    if (tx.price < need) return "Pay more than their wage.";
    if (crew.boss === tx.from) return "They already work for you.";
    if (chipsOf(books, tx.from) < tx.price) return "Not enough chips.";
    const previous = crew.boss;
    books.chips.set(tx.from, chipsOf(books, tx.from) - tx.price);
    bankFee(books, tx.price, previous);
    books.jobs.set(tx.mechanic, { boss: tx.from, wage: tx.price, skill: crew.skill || 1 });
  } else if (tx.kind === "swap") {
    if (!isMaterial(tx.mechanic)) return "No such token.";
    const pool = books.amm[tx.mechanic];
    if (tx.cartId === "buy") {
      if (tx.price < 1 || chipsOf(books, tx.from) < tx.price) return "Not enough chips.";
      const out = Math.floor((pool.token * tx.price) / (pool.chips + tx.price));
      if (out < 1) return "Too small.";
      books.chips.set(tx.from, chipsOf(books, tx.from) - tx.price);
      pool.chips += tx.price;
      pool.token -= out;
      bagOf(books, tx.from)[tx.mechanic] += out;
    } else if (tx.cartId === "sell") {
      const units = tx.askNonce;
      if (units < 1 || bagOf(books, tx.from)[tx.mechanic] < units) return "Not enough.";
      const out = Math.floor((pool.chips * units) / (pool.token + units));
      if (out < 1) return "Too small.";
      bagOf(books, tx.from)[tx.mechanic] -= units;
      pool.token += units;
      pool.chips -= out;
      books.chips.set(tx.from, chipsOf(books, tx.from) + out);
    } else return "Name a side.";
  } else if (tx.kind === "listmat") {
    if (!isMaterial(tx.mechanic) || tx.askNonce < 1 || tx.price < 1) return "Name a listing.";
    const bag = bagOf(books, tx.from);
    if (bag[tx.mechanic] < tx.askNonce) return "Not enough.";
    bag[tx.mechanic] -= tx.askNonce;
    books.matLists.push({ id: `${tx.from}:${tx.nonce}`, token: tx.mechanic, amount: tx.askNonce, price: tx.price, seller: tx.from });
  } else if (tx.kind === "buymat") {
    const listed = books.matLists.find((item) => item.id === tx.cartId);
    if (!listed || listed.seller === tx.from) return "Nothing to buy.";
    const cost = listed.price * listed.amount;
    if (tx.price !== cost) return "The listing changed.";
    if (chipsOf(books, tx.from) < cost) return "Not enough chips.";
    const fee = Math.floor(cost * 0.1);
    books.chips.set(tx.from, chipsOf(books, tx.from) - cost);
    books.chips.set(listed.seller, chipsOf(books, listed.seller) + (cost - fee));
    bankFee(books, fee, "");
    bagOf(books, tx.from)[listed.token] += listed.amount;
    books.matLists = books.matLists.filter((item) => item.id !== listed.id);
  } else if (tx.kind === "dropmat") {
    const listed = books.matLists.find((item) => item.id === tx.cartId && item.seller === tx.from);
    if (!listed) return "No listing.";
    bagOf(books, tx.from)[listed.token] += listed.amount;
    books.matLists = books.matLists.filter((item) => item.id !== listed.id);
  } else if (tx.kind === "crown") {
    if (tx.price !== 0) return "A crown is free.";
    const cart = books.carts.find((item) => item.id === tx.cartId && item.owner === tx.from);
    if (!cart) return "That cart is not yours.";
    noteCart(books, tx.cartId, tx.from, false);
  } else return "Unknown transaction.";
  books.nonce.set(tx.from, tx.nonce);
  return "";
}

function replay(extra: ChainTx[] = []): Books {
  const books = blank();
  for (const block of chainBlocks()) {
    if (block.height > 0) books.chips.set(block.miner, chipsOf(books, block.miner) + REWARD);
    if (block.tx) applyTx(books, block.tx, Boolean(block.tx.ask), block.time);
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
  carts: { id: string; mechanic: string; wings: boolean; rudder: boolean; wins: number; purseWins: number; races: number }[];
  lists: { cartId: string; mechanic: string; price: number; seller: string }[];
  nonce: number;
  pending: ChainTx[];
  mats: Bag;
  jobs: { id: string; boss: string; wage: number; skill: number }[];
};

export function holdings(address: string): Holdings {
  boot();
  const confirmed = replay();
  const projected = replay(pending);
  return {
    chips: chipsOf(projected, address) + sideOf(address),
    carts: confirmed.carts.filter((item) => item.owner === address).map((item) => ({
      id: item.id,
      mechanic: item.mechanic,
      wings: item.wings,
      rudder: item.rudder,
      wins: item.wins,
      purseWins: item.purseWins,
      races: item.races,
    })),
    lists: confirmed.listings,
    nonce: projected.nonce.get(address) ?? confirmed.nonce.get(address) ?? 0,
    pending: pending.filter((tx) => tx.from === address),
    mats: { ...(projected.mats.get(address) ?? STARTER) },
    jobs: [...projected.jobs.entries()].map(([id, job]) => ({ id, ...job })),
  };
}

export type OpenPurse = {
  key: string;
  size: number;
  stakeId: "s" | "h";
  stake: number;
  epoch: number;
  seats: string[];
  started: number;
};

export function purseTable(): OpenPurse[] {
  boot();
  const books = replay(pending);
  const out: OpenPurse[] = [];
  for (const size of PURSE_SIZES) {
    for (const stake of PURSE_STAKES) {
      const key = purseKey(size, stake.id);
      const purse = books.purses.get(key) ?? { epoch: 0, seats: [], started: 0 };
      out.push({ key, size, stakeId: stake.id, stake: stake.stake, epoch: purse.epoch, seats: [...purse.seats], started: purse.started });
    }
  }
  return out;
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
    purses: new Map([...books.purses].map(([key, purse]) => [key, { epoch: purse.epoch, seats: [...purse.seats], started: purse.started }])),
    mats: new Map([...books.mats].map(([key, bag]) => [key, { ...bag }])),
    jobs: new Map([...books.jobs].map(([key, job]) => [key, { ...job }])),
    matLists: books.matLists.map((item) => ({ ...item })),
    amm: {
      oil: { ...books.amm.oil },
      battery: { ...books.amm.battery },
      engine: { ...books.amm.engine },
    },
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
    if (block.tx) applyTx(books, block.tx, Boolean(block.tx.ask), block.time);
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

export type ChainRow = { height: number; time: number; miner: string; kind: string; detail: string };

export function recentBlocks(limit = 8): ChainRow[] {
  boot();
  const rows: ChainRow[] = [];
  let cursor: Block | undefined = tip;
  const seen = new Set<string>();
  while (cursor && rows.length < limit && !seen.has(cursor.hash)) {
    seen.add(cursor.hash);
    const tx = cursor.tx;
    rows.push({
      height: cursor.height,
      time: cursor.time,
      miner: cursor.miner,
      kind: tx?.kind ?? "reward",
      detail: tx ? `${tx.kind} ${tx.mechanic || tx.cartId || ""} ${tx.price || ""}`.trim() : "block reward",
    });
    if (cursor.height === 0) break;
    cursor = byHash.get(cursor.prev);
  }
  return rows;
}

export function market() {
  boot();
  const books = replay(pending);
  return {
    dev: chipsOf(books, DEV_POOL),
    bonus: chipsOf(books, BONUS_POOL),
    amm: books.amm,
    mats: books.matLists,
  };
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
