// Same dune the Meridian painter marches in gpu.js. Keep the numbers identical
// or the ribbon and the karts will miss the picture.

const HILL = 5.4;

export function duneHeight(x: number, y: number) {
  const roll = 0.5 * Math.sin(x * 0.15) + 0.5 * Math.cos(y * 0.13);
  const wash = 0.5 * Math.sin((x + y) * 0.17 + 1.3) + 0.5;
  const n = Math.max(0, Math.min(1, 0.55 * roll + 0.45 * wash));
  const broad = 0.5 + 0.5 * Math.sin(x * 0.021 + 0.6) * Math.cos(y * 0.018);
  let h = n * n * HILL * (0.78 + 0.22 * broad);
  const marsh = Math.exp(-(((x - 36) ** 2) + ((y + 96) ** 2)) / 2200);
  h *= 1 - marsh * 0.55;
  const ridge = Math.exp(-((x + 24) ** 2) / 520) * Math.max(0, Math.cos(y * 0.02));
  return Math.max(0, Math.min(HILL, h + ridge * 1.6));
}

/** Asphalt sits just above the dune so the ribbon reads on top of the slope. */
export const ROAD_LIFT = 0.16;

export function roadZ(x: number, y: number) {
  return duneHeight(x, y) + ROAD_LIFT;
}
