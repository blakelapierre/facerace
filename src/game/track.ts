// Courses. u = 0 is the start, driving along the tangent.
// Meridian / nbody basis: Z up, yaw 0 faces +Y, forward = (sin yaw, cos yaw).

export const STRAIGHT = 52;
export const RADIUS = 18;

const STADIUM_HALF = 8;
const RIDGE_HALF = 8.2;

export type Sample = { x: number; y: number; tx: number; ty: number; yaw: number };

export type Course = {
  id: string;
  name: string;
  laps: number;
  halfW: number;
  length: number;
  pointAt: (u: number) => Sample;
};

const ARC = Math.PI * RADIUS;
const STADIUM_LEN = STRAIGHT * 2 + ARC * 2;

function stadiumRaw(distance: number): Sample {
  let d = ((distance % STADIUM_LEN) + STADIUM_LEN) % STADIUM_LEN;
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
  return { x, y, tx, ty, yaw: Math.atan2(tx, ty) };
}

function splineCourse(controls: [number, number][]): { length: number; pointAt: (u: number) => Sample } {
  const m = controls.length;
  const at = (t: number): [number, number] => {
    const wrapped = ((t % m) + m) % m;
    const i = Math.floor(wrapped);
    const f = wrapped - i;
    const p0 = controls[(i - 1 + m) % m]!;
    const p1 = controls[i % m]!;
    const p2 = controls[(i + 1) % m]!;
    const p3 = controls[(i + 2) % m]!;
    const t2 = f * f;
    const t3 = t2 * f;
    return [
      0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * f + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
      0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * f + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
    ];
  };
  const steps = 256;
  const cum = new Float64Array(steps + 1);
  let prev = at(0);
  for (let i = 1; i <= steps; i++) {
    const p = at((i / steps) * m);
    cum[i] = cum[i - 1]! + Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
  }
  const length = cum[steps]!;
  const pointAt = (u: number): Sample => {
    const target = (((u % 1) + 1) % 1) * length;
    let lo = 0;
    let hi = steps;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid]! < target) lo = mid + 1;
      else hi = mid;
    }
    const i1 = Math.max(1, lo);
    const i0 = i1 - 1;
    const span = cum[i1]! - cum[i0]! || 1;
    const f = (target - cum[i0]!) / span;
    const t = ((i0 + f) / steps) * m;
    const p = at(t);
    const ahead = at(t + 0.015);
    let tx = ahead[0] - p[0];
    let ty = ahead[1] - p[1];
    const norm = Math.hypot(tx, ty) || 1;
    tx /= norm;
    ty /= norm;
    return { x: p[0], y: p[1], tx, ty, yaw: Math.atan2(tx, ty) };
  };
  return { length, pointAt };
}

const ridge = splineCourse([
  [-40, -120],
  [70, -130],
  [155, -50],
  [165, 40],
  [90, 115],
  [-10, 140],
  [-110, 70],
  [-165, -10],
  [-110, -90],
]);

export const COURSES: Course[] = [
  {
    id: "stadium",
    name: "Stadium",
    laps: 3,
    halfW: STADIUM_HALF,
    length: STADIUM_LEN,
    pointAt: (u) => stadiumRaw((((u % 1) + 1) % 1) * STADIUM_LEN + STRAIGHT / 2),
  },
  {
    id: "ridge",
    name: "Ridge",
    laps: 2,
    halfW: RIDGE_HALF,
    length: ridge.length,
    pointAt: ridge.pointAt,
  },
];

let active = 0;

export function courseIndex() {
  return active;
}

export function courseCount() {
  return COURSES.length;
}

export function course() {
  return COURSES[active]!;
}

export function setCourse(index: number) {
  active = ((index % COURSES.length) + COURSES.length) % COURSES.length;
  ribbonCache.clear();
}

export function pointAt(u: number): Sample {
  return course().pointAt(u);
}

export function halfWidth() {
  return course().halfW;
}

export function lapCount() {
  return course().laps;
}

export function courseName() {
  return course().name;
}

export function leftNormal(s: Sample): [number, number] {
  return [-s.ty, s.tx];
}

export function nearestU(x: number, y: number): number {
  const n = 96;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const p = pointAt(u);
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = u;
    }
  }
  let u = best;
  let step = 0.5 / n;
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

const ribbonCache = new Map<string, Float32Array>();

/** Closed centerline, packed x, y, tx, ty. The painter shades this onto the dune. */
export function trackRibbon(count = 160) {
  const key = `${course().id}:${count}`;
  const cached = ribbonCache.get(key);
  if (cached) return cached;
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const p = pointAt(i / count);
    data[i * 4] = p.x;
    data[i * 4 + 1] = p.y;
    data[i * 4 + 2] = p.tx;
    data[i * 4 + 3] = p.ty;
  }
  ribbonCache.set(key, data);
  return data;
}
