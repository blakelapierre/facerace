// Sphere contact from nbody-raycaster (latest main): exchange momentum on
// overlap instead of merging the smaller body. `ticks` is the integrator's
// ticksPerStep; the returned gravity accumulators match that pen, and
// `kick()` turns one step of them into a velocity change.

const RESTITUTION = 0.72;

function contactForce(m1: number, m2: number, pen: number, vn: number, ticks: number) {
  if (!(pen > 0) || !(m1 > 0) || !(ticks > 0)) return 0;
  const mu = m2 > 0 ? (m1 * m2) / (m1 + m2) : m1;
  if (!(mu > 0)) return 0;
  let impulse = 0;
  if (vn < 0) impulse = -(1 + RESTITUTION) * vn * mu;
  else {
    const need = Math.min(0.75, (pen * ticks) / 40);
    if (vn < need) impulse = (need - vn) * mu;
  }
  return impulse * ticks;
}

/** Apply one contact step. Velocities are mutated. Positions are not. */
export function bumpSpheres(
  p1: [number, number],
  p2: [number, number],
  v1: [number, number],
  v2: [number, number],
  r1: number,
  r2: number,
  m1 = 1,
  m2 = 1,
  ticks = 60,
) {
  let dx = p1[0] - p2[0];
  let dy = p1[1] - p2[1];
  let dist = Math.hypot(dx, dy);
  const reach = r1 + r2;
  if (!(dist < reach)) return;
  let nx: number;
  let ny: number;
  if (!(dist > 1e-8)) {
    nx = 0;
    ny = 1;
    dist = 0;
  } else {
    nx = dx / dist;
    ny = dy / dist;
  }
  const vn = (v1[0] - v2[0]) * nx + (v1[1] - v2[1]) * ny;
  const force = contactForce(m1, m2, reach - dist, vn, ticks);
  if (!(force > 0)) return;
  const i1 = force / m1 / ticks;
  const i2 = force / m2 / ticks;
  v1[0] += nx * i1;
  v1[1] += ny * i1;
  v2[0] -= nx * i2;
  v2[1] -= ny * i2;
  const push = (reach - dist) * 0.5 + 1e-4;
  p1[0] += nx * push;
  p1[1] += ny * push;
  p2[0] -= nx * push;
  p2[1] -= ny * push;
}
