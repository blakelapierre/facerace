import { fromHex, leadingZeros, sha256Block, toHex } from "./sha256";

export const REWARD = 5;

export type Header = {
  height: number;
  prev: string;
  time: number;
  miner: string;
  nonce: number;
  bits: number;
  /** First four bytes of the transaction body hash. Zero is a coinbase block. */
  txTag: number;
};

export function prepareHeader(buf: Uint8Array, prev: Uint8Array, time: number, height: number, miner: Uint8Array, txTag = 0) {
  buf.fill(0);
  buf.set(prev.subarray(0, 32), 0);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  view.setUint32(32, time >>> 0, false);
  view.setUint32(36, height >>> 0, false);
  buf.set(miner.subarray(0, 8), 40);
  view.setUint32(52, txTag >>> 0, false);
  buf[56] = 0x80;
  view.setUint32(60, 448, false);
}

export function writeNonce(buf: Uint8Array, nonce: number) {
  new DataView(buf.buffer, buf.byteOffset, buf.byteLength).setUint32(48, nonce >>> 0, false);
}

export function hashHeader(header: Header) {
  const buf = new Uint8Array(64);
  prepareHeader(buf, fromHex(header.prev.padStart(64, "0")), header.time, header.height, fromHex(header.miner.padStart(16, "0")), header.txTag || 0);
  writeNonce(buf, header.nonce);
  return toHex(sha256Block(buf));
}

export function workMeets(hash: string, bits: number) {
  return leadingZeros(fromHex(hash)) >= bits;
}

export function nextBits(parent: { height: number; time: number; bits: number }, time: number) {
  if (parent.height === 0) return 20;
  const gap = Math.max(1, time - parent.time);
  if (gap < 8 && parent.bits < 26) return parent.bits + 1;
  if (gap > 45 && parent.bits > 12) return parent.bits - 1;
  return parent.bits;
}
