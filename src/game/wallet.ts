// A race wallet is created in this browser the first time the page opens.
// The key signs trades. The chip purse never leaves this browser.

const KEY = "facerace-wallet";

export type Wallet = {
  address: string;
  x: string;
  y: string;
  privateJwk: JsonWebKey;
  purse: number;
  nonce: number;
};

function bytesToB64(bytes: Uint8Array) {
  let out = "";
  for (const byte of bytes) out += String.fromCharCode(byte);
  return btoa(out);
}

function b64ToBytes(text: string) {
  const raw = atob(text);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function save(wallet: Wallet) {
  localStorage.setItem(KEY, JSON.stringify(wallet));
  return wallet;
}

export function shortAddress(address: string) {
  return address.slice(0, 6);
}

export async function openWallet(): Promise<Wallet> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Wallet;
      if (parsed.address && parsed.privateJwk && parsed.x && parsed.y) return parsed;
    }
  } catch {
    /* mint a fresh one */
  }
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const raw = await crypto.subtle.exportKey("raw", pair.publicKey);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", raw));
  const address = [...digest.slice(0, 8)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return save({
    address,
    x: publicJwk.x || "",
    y: publicJwk.y || "",
    privateJwk,
    purse: 40,
    nonce: 1,
  });
}

async function privateKey(wallet: Wallet) {
  return crypto.subtle.importKey("jwk", wallet.privateJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

export async function signText(wallet: Wallet, message: string) {
  const key = await privateKey(wallet);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(message));
  return bytesToB64(new Uint8Array(sig));
}

export async function verifyText(x: string, y: string, message: string, sig: string) {
  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: "EC", crv: "P-256", x, y },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
    return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, b64ToBytes(sig), new TextEncoder().encode(message));
  } catch {
    return false;
  }
}

export function writePurse(wallet: Wallet, purse: number) {
  const next = Math.round(purse * 100) / 100;
  if (wallet.purse === next) return wallet;
  return save({ ...wallet, purse: next });
}

export function credit(wallet: Wallet, amount: number) {
  return save({ ...wallet, purse: Math.round((wallet.purse + amount) * 100) / 100 });
}

export function debit(wallet: Wallet, amount: number) {
  if (wallet.purse + 1e-9 < amount) return null;
  return save({ ...wallet, purse: Math.round((wallet.purse - amount) * 100) / 100 });
}

export function nextNonce(wallet: Wallet) {
  const next = save({ ...wallet, nonce: wallet.nonce + 1 });
  return { wallet: next, nonce: next.nonce };
}
