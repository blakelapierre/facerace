// Stadium circuit. u = 0 is the start/finish, mid-bottom straight, driving +X.
// Meridian / nbody basis: Z up, yaw 0 faces +Y, forward = (sin yaw, cos yaw).

export const STRAIGHT = 52;
export const RADIUS = 18;
export const HALF_W = 4.8;
export const LAPS = 3;

const ARC = Math.PI * RADIUS;
export const LAP_LEN = STRAIGHT * 2 + ARC * 2;

export type Sample = { x: number; y: number; tx: number; ty: number; yaw: number };

function raw(distance: number): Sample {
  let d = ((distance % LAP_LEN) + LAP_LEN) % LAP_LEN;
  let x: number;
  let y: number;
  let tx: number;
  let ty: number;
  if (d < STRAIGHT) {
    x = -STRAIGHT / 2 + d;
    y = -RADIUS;
    tx = 1;
    ty = 0;
  } else if ((d -= STRAIGHT) < ARC) {
    const a = -Math.PI / 2 + d / RADIUS;
    x = STRAIGHT / 2 + Math.cos(a) * RADIUS;
    y = Math.sin(a) * RADIUS;
    tx = -Math.sin(a);
    ty = Math.cos(a);
  } else if ((d -= ARC) < STRAIGHT) {
    x = STRAIGHT / 2 - d;
    y = RADIUS;
    tx = -1;
    ty = 0;
  } else {
    d -= STRAIGHT;
    const a = Math.PI / 2 + d / RADIUS;
    x = -STRAIGHT / 2 + Math.cos(a) * RADIUS;
    y = Math.sin(a) * RADIUS;
    tx = -Math.sin(a);
    ty = Math.cos(a);
  }
  const yaw = Math.atan2(tx, ty);
  return { x, y, tx, ty, yaw };
}

/** u in [0, 1). Zero is the middle of the bottom straight. */
export function pointAt(u: number): Sample {
  const wrapped = ((u % 1) + 1) % 1;
  return raw(wrapped * LAP_LEN + STRAIGHT / 2);
}

export function leftNormal(s: Sample): [number, number] {
  return [-s.ty, s.tx];
}

export function nearestU(x: number, y: number): number {
  const N = 96;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < N; i++) {
    const u = i / N;
    const p = pointAt(u);
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = u;
    }
  }
  let u = best;
  let step = 0.5 / N;
  for (let k = 0; k < 10; k++) {
    const a = pointAt(u - step);
    const b = pointAt(u + step);
    const da = (a.x - x) ** 2 + (a.y - y) ** 2;
    const db = (b.x - x) ** 2 + (b.y - y) ** 2;
    u += da < db ? -step : step;
    step *= 0.5;
  }
  return ((u % 1) + 1) % 1;
}

export function yawOf(u: number) {
  return pointAt(u).yaw;
}
