import { credit, debit, nextNonce, signText, verifyText, type Wallet } from "./wallet";

export type Mechanic = {
  id: string;
  name: string;
  line: string;
  cost: number;
  speed: number;
  turn: number;
  grip: number;
  color: [number, number, number];
};

export type BuiltCart = {
  id: string;
  mechanic: string;
};

export type Yard = {
  carts: BuiltCart[];
  selected: string;
};

export type Heat = {
  id: string;
  name: string;
  stake: number;
  purse: number;
};

export const MECHANICS: Mechanic[] = [
  { id: "ada", name: "Ada", line: "Long gearing", cost: 12, speed: 1.16, turn: 0.92, grip: 0.88, color: [0.91, 0.64, 0.13] },
  { id: "bram", name: "Bram", line: "Sticky tires", cost: 12, speed: 0.94, turn: 1.2, grip: 1.18, color: [0.29, 0.55, 0.42] },
  { id: "nox", name: "Nox", line: "Light frame", cost: 16, speed: 1.08, turn: 1.08, grip: 1.04, color: [0.84, 0.27, 0.2] },
];

export const STOCK: Mechanic = {
  id: "stock",
  name: "Stock",
  line: "The pit kart",
  cost: 0,
  speed: 1,
  turn: 1,
  grip: 1,
  color: [0.91, 0.64, 0.13],
};

export const HEATS: Heat[] = [
  { id: "dusk", name: "Dusk", stake: 5, purse: 12 },
  { id: "night", name: "Night", stake: 10, purse: 26 },
];

const YARD_KEY = "facerace-yard";

export function mechanicById(id: string) {
  return id === "stock" ? STOCK : (MECHANICS.find((item) => item.id === id) ?? STOCK);
}

export function loadYard(): Yard {
  try {
    const raw = localStorage.getItem(YARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Yard;
      if (Array.isArray(parsed.carts)) {
        const carts = parsed.carts.filter((cart) => cart.id === "stock" || MECHANICS.some((item) => item.id === cart.mechanic));
        if (!carts.some((cart) => cart.id === "stock")) carts.unshift({ id: "stock", mechanic: "stock" });
        const selected = carts.some((cart) => cart.id === parsed.selected) ? parsed.selected : "stock";
        return { carts, selected };
      }
    }
  } catch {
    /* fresh yard */
  }
  return { carts: [{ id: "stock", mechanic: "stock" }], selected: "stock" };
}

function saveYard(yard: Yard) {
  localStorage.setItem(YARD_KEY, JSON.stringify(yard));
  return yard;
}

export function writeYard(yard: Yard) {
  return saveYard(yard);
}

export function selectCart(yard: Yard, id: string) {
  if (!yard.carts.some((cart) => cart.id === id)) return yard;
  return saveYard({ ...yard, selected: id });
}

export function hire(wallet: Wallet, yard: Yard, mechanicId: string) {
  const mechanic = MECHANICS.find((item) => item.id === mechanicId);
  if (!mechanic) return { wallet, yard, error: "That mechanic is out." };
  const next = debit(wallet, mechanic.cost);
  if (!next) return { wallet, yard, error: "Not enough chips." };
  const cart = { id: `${mechanic.id}-${next.nonce}`, mechanic: mechanic.id };
  const bumped = nextNonce(next).wallet;
  return { wallet: bumped, yard: saveYard({ ...yard, carts: [...yard.carts, cart], selected: cart.id }), error: "" };
}

export function specOf(yard: Yard) {
  const cart = yard.carts.find((item) => item.id === yard.selected) ?? yard.carts[0]!;
  return mechanicById(cart.mechanic);
}

export type Offer = {
  cartId: string;
  mechanic: string;
  price: number;
  seller: string;
  nonce: number;
  x: string;
  y: string;
  sig: string;
};

const OFFER_KEY = "facerace-offers";

export function loadOffers(): Offer[] {
  try {
    const raw = JSON.parse(localStorage.getItem(OFFER_KEY) || "[]") as Offer[];
    if (Array.isArray(raw)) return raw.filter((item) => item?.cartId && item.sig && item.seller);
  } catch {
    /* fresh book */
  }
  return [];
}

function saveOffers(offers: Offer[]) {
  localStorage.setItem(OFFER_KEY, JSON.stringify(offers.slice(-12)));
  return offers;
}

export function writeOffers(offers: Offer[]) {
  return saveOffers(offers);
}

export function putOffer(offers: Offer[], offer: Offer) {
  return saveOffers([...offers.filter((item) => item.cartId !== offer.cartId), offer]);
}

export function pullOffer(offers: Offer[], cartId: string) {
  return saveOffers(offers.filter((item) => item.cartId !== cartId));
}

export function pullMechanic(offers: Offer[], mechanic: string) {
  const index = offers.findIndex((item) => item.mechanic === mechanic);
  if (index < 0) return offers;
  return saveOffers(offers.filter((_, i) => i !== index));
}

export async function signListing(wallet: Wallet, mechanic: string, price: number, cartId: string) {
  const { wallet: next, nonce } = nextNonce(wallet);
  const message = `sell|${next.address}|${nonce}|${mechanic}|${cartId}|${price}`;
  const sig = await signText(next, message);
  return { wallet: next, message, sig, nonce };
}

export async function listingIsReal(mechanic: string, price: number, address: string, nonce: number, cartId: string, x: string, y: string, sig: string) {
  return verifyText(x, y, `sell|${address}|${nonce}|${mechanic}|${cartId}|${price}`, sig);
}

export function giveCart(yard: Yard, mechanic: string) {
  const cart = { id: `${mechanic}-${Date.now().toString(36)}`, mechanic };
  return saveYard({ ...yard, carts: [...yard.carts, cart], selected: cart.id });
}

export function dropCart(yard: Yard, mechanic: string) {
  const index = yard.carts.findIndex((cart) => cart.mechanic === mechanic && cart.id !== "stock");
  if (index < 0) return yard;
  const carts = yard.carts.filter((_, i) => i !== index);
  const selected = carts.some((cart) => cart.id === yard.selected) ? yard.selected : "stock";
  return saveYard({ carts, selected });
}

const PAID = "facerace-pays";

export function alreadyPaid(id: string) {
  try {
    const raw = JSON.parse(localStorage.getItem(PAID) || "[]") as string[];
    return raw.includes(id);
  } catch {
    return false;
  }
}

export function rememberPay(id: string) {
  const raw = JSON.parse(localStorage.getItem(PAID) || "[]") as string[];
  raw.push(id);
  localStorage.setItem(PAID, JSON.stringify(raw.slice(-40)));
}

export async function signPay(wallet: Wallet, seller: string, amount: number, mechanic: string) {
  const { wallet: next, nonce } = nextNonce(wallet);
  const message = `pay:${seller}:${amount}:${next.address}:${nonce}:${mechanic}`;
  const sig = await signText(next, message);
  return { wallet: next, sig, nonce };
}

export async function payIsReal(seller: string, amount: number, buyer: string, nonce: number, mechanic: string, x: string, y: string, sig: string) {
  return verifyText(x, y, `pay:${seller}:${amount}:${buyer}:${nonce}:${mechanic}`, sig);
}

export function stakeHeat(wallet: Wallet, heat: Heat) {
  const next = debit(wallet, heat.stake);
  return next;
}

export function payHeat(wallet: Wallet, amount: number) {
  return credit(wallet, amount);
}
