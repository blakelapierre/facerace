import { hashHeader, nextBits, REWARD, workMeets, type Header } from "./work";

export type Block = Header & { hash: string };

const STORE = "facerace-chain-v1";

const genesis: Block = {
  height: 0,
  prev: "0000000000000000000000000000000000000000000000000000000000000000",
  time: 1731283200,
  miner: "6661636500000000",
  nonce: 0,
  bits: 20,
  hash: "",
};
genesis.hash = hashHeader(genesis);

const byHash = new Map<string, Block>();
let tip = genesis;
let orphans: Block[] = [];
let ready = false;

function boot() {
  if (ready) return;
  ready = true;
  byHash.set(genesis.hash, genesis);
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return;
    const saved = JSON.parse(raw) as Block[];
    for (const block of saved) consider(block);
  } catch {
    /* keep genesis */
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
    /* private mode or a non-browser check */
  }
}

function link(block: Block) {
  byHash.set(block.hash, block);
  if (block.height > tip.height) tip = block;
  const kids = orphans.filter((item) => item.prev === block.hash);
  orphans = orphans.filter((item) => item.prev !== block.hash);
  for (const kid of kids) {
    const parent = block;
    if (kid.height === parent.height + 1 && kid.time >= parent.time && kid.bits === nextBits(parent, kid.time)) link(kid);
  }
}

export function consider(block: Block): "added" | "known" | "orphan" | "bad" {
  boot();
  if (!block || typeof block.hash !== "string" || block.hash.length !== 64) return "bad";
  if (byHash.has(block.hash)) return "known";
  if (block.hash !== hashHeader(block) || !workMeets(block.hash, block.bits)) return "bad";
  if (block.height === 0) return block.hash === genesis.hash ? "known" : "bad";
  const parent = byHash.get(block.prev);
  if (!parent) {
    orphans.push(block);
    if (orphans.length > 30) orphans.shift();
    return "orphan";
  }
  if (block.height !== parent.height + 1 || block.time < parent.time) return "bad";
  if (block.bits !== nextBits(parent, block.time)) return "bad";
  link(block);
  persist();
  return "added";
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
