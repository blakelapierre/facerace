// @ts-nocheck
// Player links stop at eight. With nine or fewer players that is everyone.
// Past that, each player keeps the four ids on either side of a ring sorted
// by pubkey. Circular distance is symmetric, so both ends of an edge agree,
// and a player who arrives late still has eight peers instead of zero.
export const PLAYER_DEGREE = 8;

export function ringNeighbors(ids, me, degree = PLAYER_DEGREE) {
  if (!me || degree < 1) return [];
  const all = [...new Set(ids.filter((id) => typeof id === "string" && id))].sort();
  const n = all.length;
  const at = all.indexOf(me);
  if (at < 0 || n < 2) return [];
  const steps = Math.min(Math.floor(degree / 2), n - 1);
  const want = new Set();
  for (let k = 1; k <= steps; k += 1) {
    want.add(all[(at + k) % n]);
    want.add(all[(at - k + n) % n]);
  }
  want.delete(me);
  return [...want].sort();
}
