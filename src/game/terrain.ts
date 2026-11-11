// Meridian ground: the rolling dunes, plus the north mountain, the lake basin, and the
// southwest cinder cone (life.js / land.js / volcano.js). The painter uses the same
// numbers, so the karts sit on the picture.

const HILL = 5.4;

export const MOUNTAIN = { x: -40, y: 160, radius: 104, height: 36 };
export const LAKE = { x: 70, y: 96, radius: 14, level: 2.2, depth: 1.6 };
export const VOLCANO = { x: -155, y: -55, radius: 72, height: 30, crater: 14 };

function baseDune(x: number, y: number) {
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

function cone(x: number, y: number, cx: number, cy: number, radius: number, height: number) {
  const d = Math.hypot(x - cx, y - cy);
  const wobble = 0.92 + 0.08 * Math.sin(x * 0.05 + cy) * Math.cos(y * 0.04);
  const u = d / (radius * wobble);
  if (u >= 1) return 0;
  const s = 1 - u;
  return height * s * s * (3 - 2 * s);
}

/** Water surface over the lake, or null on dry ground. */
export function waterAt(x: number, y: number) {
  const r = Math.hypot(x - LAKE.x, y - LAKE.y);
  const rl = LAKE.radius * (0.94 + 0.06 * Math.sin(x * 0.21));
  if (r >= rl) return null;
  return LAKE.level;
}

export function duneHeight(x: number, y: number) {
  let h = baseDune(x, y);
  h += cone(x, y, MOUNTAIN.x, MOUNTAIN.y, MOUNTAIN.radius, MOUNTAIN.height);
  h += cone(x, y, VOLCANO.x, VOLCANO.y, VOLCANO.radius, VOLCANO.height);
  const crater = Math.hypot(x - VOLCANO.x, y - VOLCANO.y);
  if (crater < VOLCANO.crater) h -= (1 - crater / VOLCANO.crater) * 12;
  const wet = waterAt(x, y);
  if (wet != null) {
    const r = Math.hypot(x - LAKE.x, y - LAKE.y);
    const rl = LAKE.radius * (0.94 + 0.06 * Math.sin(x * 0.21));
    const q = r / Math.max(rl, 0.01);
    h = wet - 0.12 - LAKE.depth * (1 - q * q);
  }
  return Math.max(-2, h);
}

/** 0..1. A dry spell, then a shower, on an 80 second clock. */
export function rainAt(seconds: number) {
  const u = (((seconds % 80) + 80) % 80) / 80;
  if (u < 0.48 || u > 0.8) return 0;
  return Math.sin(((u - 0.48) / 0.32) * Math.PI);
}

export const ROAD_LIFT = 0.16;

export function roadZ(x: number, y: number) {
  return duneHeight(x, y) + ROAD_LIFT;
}
