import { sha256 } from "./sha256";
import { signText, verifyText, type Wallet } from "./wallet";
import { MECHANICS } from "./yard";

export type TxKind = "hire" | "list" | "buy" | "drop";

export type ChainTx = {
  kind: TxKind;
  from: string;
  nonce: number;
  mechanic: string;
  cartId: string;
  seller: string;
  price: number;
  ask: string;
  askNonce: number;
  sx: string;
  sy: string;
  x: string;
  y: string;
  sig: string;
};

export function cartIdFor(mechanic: string, from: string, nonce: number) {
  return `${mechanic}-${from.slice(0, 6)}-${nonce}`;
}

export function txBody(tx: Pick<ChainTx, "kind" | "from" | "nonce" | "mechanic" | "cartId" | "seller" | "price" | "askNonce">) {
  return [tx.kind, tx.from, tx.nonce, tx.mechanic, tx.cartId, tx.seller, tx.price, tx.askNonce].join("|");
}

export function askBody(seller: string, nonce: number, mechanic: string, cartId: string, price: number) {
  return `sell|${seller}|${nonce}|${mechanic}|${cartId}|${price}`;
}

export function txTagOf(tx: ChainTx | null | undefined) {
  if (!tx) return 0;
  const digest = sha256(new TextEncoder().encode(txBody(tx)));
  return new DataView(digest.buffer, digest.byteOffset, digest.byteLength).getUint32(0, false);
}

export async function signTx(wallet: Wallet, draft: Omit<ChainTx, "from" | "x" | "y" | "sig">) {
  const tx = { ...draft, from: wallet.address, x: wallet.x, y: wallet.y, sig: "" };
  tx.sig = await signText(wallet, txBody(tx));
  return tx;
}

export function verifyTx(tx: ChainTx) {
  return verifyText(tx.x, tx.y, txBody(tx), tx.sig);
}

export function verifyAsk(tx: ChainTx) {
  if (!tx.ask) return false;
  return verifyText(tx.sx, tx.sy, askBody(tx.seller, tx.askNonce, tx.mechanic, tx.cartId, tx.price), tx.ask);
}

export function mechanicCost(id: string) {
  return MECHANICS.find((item) => item.id === id)?.cost ?? 0;
}
