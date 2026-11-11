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
  [-180, 55],
  [-240, -30],
  [-200, -150],
  [-70, -145],
]);

const caldera = splineCourse([
  [-85, -55],
  [-120, -2],
  [-148, -20],
  [-170, -38],
  [-186, -68],
  [-168, -98],
  [-120, -100],
  [-90, -78],
]);

const summit = splineCourse([
  [-40, 64],
  [22, 90],
  [48, 140],
  [8, 182],
  [-22, 178],
  [-58, 172],
  [-96, 140],
  [-104, 100],
  [-70, 70],
]);

const cinder = splineCourse([
  [-70, -20],
  [-95, 30],
  [-155, 35],
  [-220, -10],
  [-230, -70],
  [-175, -120],
  [-100, -110],
  [-60, -70],
]);

const lake = splineCourse([
  [118, 70],
  [130, 110],
  [90, 150],
  [30, 145],
  [12, 100],
  [28, 58],
  [78, 48],
  [112, 52],
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
  {
    id: "lake",
    name: "Lake",
    laps: 2,
    halfW: 7.2,
    length: lake.length,
    pointAt: lake.pointAt,
  },
  {
    id: "cinder",
    name: "Cinder",
    laps: 2,
    halfW: 7.4,
    length: cinder.length,
    pointAt: cinder.pointAt,
  },
  {
    id: "caldera",
    name: "Caldera",
    laps: 2,
    halfW: 6.4,
    length: caldera.length,
    pointAt: caldera.pointAt,
  },
  {
    id: "summit",
    name: "Summit",
    laps: 2,
    halfW: 6.6,
    length: summit.length,
    pointAt: summit.pointAt,
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

export function setCourseById(id: string) {
  const found = COURSES.findIndex((item) => item.id === id);
  setCourse(found < 0 ? 0 : found);
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

/** Four stations a lap, set halfway between the old eighths so none sits on the grid. */
export const GATES = 4;

export function gateU(index: number) {
  const g = ((index % GATES) + GATES) % GATES;
  return (g + 0.5) / GATES;
}

/** Checkpoint base, just off the asphalt so the racing line stays clear. */
export function gateAnchor(index: number) {
  const g = ((index % GATES) + GATES) % GATES;
  const p = pointAt(gateU(g));
  const [lx, ly] = leftNormal(p);
  const side = g % 2 === 0 ? 1 : -1;
  const off = halfWidth() + 1.85;
  return { x: p.x + lx * side * off, y: p.y + ly * side * off };
}

/** Lean of an inflatable pillar. The same numbers drive the picture and the marker. */
export function gateSway(index: number, time: number) {
  const g = ((index % GATES) + GATES) % GATES;
  const gust = 0.65 + 0.35 * Math.sin(time * 1.7 + g * 1.3);
  return { wx: Math.sin(time * 0.37) * gust, wy: Math.cos(time * 0.29 + 1.2) * gust };
}

export type RailSeg = { x: number; y: number; x2: number; y2: number };

const RAIL_MAX = 16;

/** Outside rails on sharp bends. Both sides only on a hairpin, so an oval is not boxed in. */
export function guardRails(): RailSeg[] {
  const n = 80;
  const len = course().length;
  const px: number[] = [];
  const py: number[] = [];
  const nx: number[] = [];
  const ny: number[] = [];
  const yaw: number[] = [];
  for (let i = 0; i < n; i++) {
    const s = pointAt(i / n);
    const [lx, ly] = leftNormal(s);
    px.push(s.x);
    py.push(s.y);
    nx.push(lx);
    ny.push(ly);
    yaw.push(s.yaw);
  }
  const kappa: number[] = [];
  const side: number[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    let dy = yaw[j]! - yaw[i]!;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const ds = Math.hypot(px[j]! - px[i]!, py[j]! - py[i]!) || len / n;
    kappa.push(Math.abs(dy) / ds);
    side.push(dy >= 0 ? 1 : -1);
  }
  const sharp = 0.032;
  const hairpin = 0.072;
  type Run = { idx: number[]; maxK: number; side: number };
  const runs: Run[] = [];
  let cur: number[] = [];
  const take = (idx: number[]): Run | null => {
    if (!idx.length) return null;
    let maxK = 0;
    let at = 1;
    for (const i of idx) {
      if (kappa[i]! >= maxK) {
        maxK = kappa[i]!;
        at = side[i]!;
      }
    }
    return { idx, maxK, side: at };
  };
  const flush = () => {
    const run = take(cur);
    if (run) runs.push(run);
    cur = [];
  };
  for (let i = 0; i < n; i++) {
    if (kappa[i]! >= sharp) cur.push(i);
    else flush();
  }
  if (cur.length && runs.length && runs[0]!.idx[0] === 0 && cur[cur.length - 1] === n - 1) {
    const first = runs.shift()!;
    const run = take(cur.concat(first.idx));
    if (run) runs.unshift(run);
    cur = [];
  } else flush();

  const off = halfWidth() + 3.1;
  type Poly = { pts: { x: number; y: number }[]; score: number; apex: number };
  const polys: Poly[] = [];
  const place = (run: Run, sign: number) => {
    const pts: { x: number; y: number }[] = [];
    const first = run.idx[0]!;
    const prev = (first - 1 + n) % n;
    if (!run.idx.includes(prev)) {
      pts.push({ x: px[prev]! + nx[prev]! * off * sign, y: py[prev]! + ny[prev]! * off * sign });
    }
    let apex = 0;
    for (const i of run.idx) {
      if (i === run.idx.reduce((best, k) => (kappa[k]! > kappa[best]! ? k : best), run.idx[0]!)) apex = pts.length;
      pts.push({ x: px[i]! + nx[i]! * off * sign, y: py[i]! + ny[i]! * off * sign });
    }
    const last = run.idx[run.idx.length - 1]!;
    const next = (last + 1) % n;
    if (!run.idx.includes(next)) {
      pts.push({ x: px[next]! + nx[next]! * off * sign, y: py[next]! + ny[next]! * off * sign });
    }
    polys.push({ pts, score: run.maxK * run.idx.length, apex });
  };
  for (const run of runs) {
    place(run, run.side);
    if (run.maxK >= hairpin) place(run, -run.side);
  }
  if (!polys.length) return [];
  polys.sort((a, b) => b.score - a.score);
  let keep = polys.length;
  while (keep > 1 && keep * 2 > RAIL_MAX) keep -= 1;
  const kept = polys.slice(0, keep);
  const budget = new Array<number>(kept.length).fill(2);
  let left = RAIL_MAX - kept.length * 2;
  const weight = kept.map((poly) => Math.max(1, poly.pts.length));
  const totalW = weight.reduce((sum, w) => sum + w, 0);
  const shares = weight.map((w) => Math.floor((left * w) / totalW));
  for (let i = 0; i < kept.length; i++) budget[i] = (budget[i] ?? 2) + (shares[i] ?? 0);
  left -= shares.reduce((sum, n) => sum + n, 0);
  for (let i = 0; left > 0; i++) {
    budget[i % kept.length] = (budget[i % kept.length] ?? 2) + 1;
    left -= 1;
  }

  const segs: RailSeg[] = [];
  for (let p = 0; p < kept.length; p++) {
    const pts = kept[p]!.pts;
    const pieces = budget[p] ?? 2;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1]! + Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y));
    const total = cum[cum.length - 1] || 1;
    const maxChord = 13;
    const cover = Math.min(total, pieces * maxChord);
    const apexAt = cum[Math.min(kept[p]!.apex, cum.length - 1)] ?? total * 0.5;
    let start = apexAt - cover * 0.5;
    if (start < 0) start = 0;
    if (start + cover > total) start = Math.max(0, total - cover);
    const atDist = (dist: number) => {
      const d = Math.max(0, Math.min(total, dist));
      let i = 1;
      while (i < cum.length - 1 && cum[i]! < d) i += 1;
      const span = (cum[i] ?? total) - (cum[i - 1] ?? 0) || 1;
      const f = (d - (cum[i - 1] ?? 0)) / span;
      const a = pts[i - 1]!;
      const b = pts[i] ?? a;
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    };
    for (let s = 0; s < pieces; s++) {
      const a = atDist(start + (s / pieces) * cover);
      const b = atDist(start + ((s + 1) / pieces) * cover);
      if (Math.hypot(b.x - a.x, b.y - a.y) < 1.2) continue;
      segs.push({ x: a.x, y: a.y, x2: b.x, y2: b.y });
    }
  }
  const road = halfWidth() + 1.45;
  const cleared: RailSeg[] = [];
  for (const seg of segs) {
    let x = seg.x;
    let y = seg.y;
    let x2 = seg.x2;
    let y2 = seg.y2;
    let ok = true;
    for (let n = 0; n < 3 && ok; n++) {
      let minAbs = Infinity;
      let px = 0;
      let py = 0;
      const lats: number[] = [];
      for (const f of [0, 0.5, 1]) {
        const qx = x + (x2 - x) * f;
        const qy = y + (y2 - y) * f;
        const s = pointAt(nearestU(qx, qy));
        const [lx, ly] = leftNormal(s);
        const lat = (qx - s.x) * lx + (qy - s.y) * ly;
        lats.push(lat);
        const abs = Math.abs(lat);
        if (abs < minAbs) {
          minAbs = abs;
          const sign = lat >= 0 ? 1 : -1;
          px = lx * sign;
          py = ly * sign;
        }
      }
      if (lats[0]! * lats[2]! <= 0) {
        ok = false;
        break;
      }
      if (minAbs >= road) break;
      const push = road - minAbs + 0.08;
      x += px * push;
      y += py * push;
      x2 += px * push;
      y2 += py * push;
    }
    if (ok) cleared.push({ x, y, x2, y2 });
  }
  return cleared.slice(0, RAIL_MAX);
}
