import { bumpBodies } from "./contact";
import { duneHeight, waterAt } from "./terrain";
import { courseCount, courseIndex, courseName, halfWidth, lapCount, leftNormal, nearestU, pointAt, setCourse, setCourseById } from "./track";

export type Kart = {
  id: string;
  name: string;
  x: number;
  y: number;
  yaw: number;
  speed: number;
  travel: number;
  finishedAt: number | null;
  ai: boolean;
  mass: number;
  radius: number;
  color: [number, number, number];
  seed: number;
  cruise: number;
  /** Chassis height. The picture and the net both read this. */
  z: number;
  vx: number;
  vy: number;
  vz: number;
  /** True while gravity, not the road, owns the vertical. */
  air: boolean;
};

export type Sim = {
  karts: Kart[];
  running: boolean;
  time: number;
  tick: number;
  keys: Set<string>;
  touch: Set<string>;
  steer: number;
  /** Joystick sideways, −1..1. Positive is player-left. Replaces tilt while pushed. */
  stick: number;
  /** Phone tilt, −1..1. Positive is player-left. Used in motion mode. */
  tilt: number;
  /** Joystick gas, −1..1. Positive is forward. Used in stick mode. */
  gas: number;
  /** Held Go / Back pedals in motion mode. */
  pedal: number;
  /** Touch scheme. Motion uses tilt plus pedals. Stick uses the joystick and ignores the phone. */
  hands: "tilt" | "stick";
  banner: string;
  bestMs: number | null;
  /** One-shot moments for the listener. Drained by the frame loop. */
  events: { kind: string; amount: number; x: number; y: number }[];
  shake: number;
  lapSeen: number;
  bumpTick: number;
  scrapeTick: number;
  wrongTick: number;
  wrongWay: boolean;
  /** Seconds the course name stays on the banner after a change. */
  bannerUntil: number;
  /** True once a purse or a hosted room should stay on its course. Solo stays false and loops. */
  promoted: boolean;
  /** Solo heats. Each full tour of the courses raises it, and the bots with it. */
  level: number;
  /** Built cart. Stock is null. */
  cart: { speed: number; turn: number; grip: number; color: [number, number, number] } | null;
};

const COLORS: [number, number, number][] = [
  [0.91, 0.64, 0.13],
  [0.84, 0.27, 0.2],
  [0.29, 0.55, 0.42],
  [0.75, 0.78, 0.72],
  [0.45, 0.32, 0.22],
  [0.2, 0.35, 0.48],
];

const NAMES = ["You", "Vesper", "Nox", "Ione", "Bram", "Sol"];
const TURN = 2.35;
const MAX_SPEED = 26;
const BODY = 0.82;
const RIDE = 0.46;
const GRAVITY = 18;

export type Bumper = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  mass: number;
};

function wrap(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

function placeKart(i: number, name: string): Kart {
  const u = 0.016 + i * 0.016;
  const sample = pointAt(u);
  const [lx, ly] = leftNormal(sample);
  const lat = i % 2 === 0 ? -1.45 : 1.45;
  return {
    id: `kart-${i}`,
    name,
    x: sample.x + lx * lat,
    y: sample.y + ly * lat,
    yaw: sample.yaw,
    speed: 0,
    travel: u,
    finishedAt: null,
    ai: i !== 0,
    mass: 1,
    radius: BODY,
    color: COLORS[i % COLORS.length]!,
    seed: 1000 + i * 97,
    cruise: 15.5 + ((i * 3) % 5) * 0.85,
    z: duneHeight(sample.x + lx * lat, sample.y + ly * lat) + RIDE,
    vx: 0,
    vy: 0,
    vz: 0,
    air: false,
  };
}

export function createSim(playerName = "You"): Sim {
  let best: number | null = null;
  try {
    const raw = localStorage.getItem("facerace-best-ms");
    if (raw) best = Number(raw) || null;
  } catch {
    best = null;
  }
  const names = NAMES.slice();
  names[0] = playerName.trim().slice(0, 16) || "You";
  return {
    karts: names.map((name, i) => placeKart(i, name)),
    running: false,
    time: 0,
    tick: 0,
    keys: new Set(),
    touch: new Set(),
    steer: 0,
    stick: 0,
    tilt: 0,
    gas: 0,
    pedal: 0,
    hands: "stick",
    banner: "",
    bestMs: best,
    events: [],
    shake: 0,
    lapSeen: 0,
    bumpTick: -100,
    scrapeTick: -100,
    wrongTick: -100,
    wrongWay: false,
    bannerUntil: 0,
    promoted: false,
    level: 1,
    cart: null,
  };
}

function down(sim: Sim, code: string) {
  return sim.keys.has(code) || sim.touch.has(code);
}

function readSteer(sim: Sim) {
  let steer = sim.steer;
  if (down(sim, "KeyA") || down(sim, "ArrowLeft")) steer += 1;
  if (down(sim, "KeyD") || down(sim, "ArrowRight")) steer -= 1;
  if (sim.hands === "stick") steer += Math.abs(sim.stick) > 0.08 ? sim.stick : 0;
  else steer += sim.tilt;
  if (steer > 1) return 1;
  if (steer < -1) return -1;
  return steer;
}

function throttle(sim: Sim) {
  let t = sim.hands === "tilt" ? sim.pedal : sim.gas;
  if (down(sim, "KeyW") || down(sim, "ArrowUp")) t += 1;
  if (down(sim, "KeyS") || down(sim, "ArrowDown")) t -= 1;
  if (t > 1) return 1;
  if (t < -1) return -1;
  return t;
}

function advanceTravel(kart: Kart) {
  if (kart.finishedAt != null) return;
  const nu = nearestU(kart.x, kart.y);
  const prev = ((kart.travel % 1) + 1) % 1;
  let du = nu - prev;
  if (du > 0.5) du -= 1;
  if (du < -0.5) du += 1;
  if (Math.abs(du) > 0.25) return;
  kart.travel += du;
  if (kart.travel < 0) kart.travel = 0;
}

function contain(kart: Kart) {
  const u = ((kart.travel % 1) + 1) % 1;
  const sample = pointAt(u);
  const [lx, ly] = leftNormal(sample);
  const lat = (kart.x - sample.x) * lx + (kart.y - sample.y) * ly;
  const edge = halfWidth() + (kart.air ? 7 : 0.45);
  if (Math.abs(lat) <= edge) return;
  const clamped = Math.sign(lat) * edge;
  kart.x = sample.x + lx * clamped;
  kart.y = sample.y + ly * clamped;
  const fx = Math.sin(kart.yaw);
  const fy = Math.cos(kart.yaw);
  const forward = kart.vx * fx + kart.vy * fy;
  kart.vx = fx * forward * 0.9;
  kart.vy = fy * forward * 0.9;
  kart.speed = forward * 0.9;
}

function aiSteer(kart: Kart, level: number) {
  const u = ((kart.travel % 1) + 1) % 1;
  const lookAhead = Math.max(0.018, 0.04 - (level - 1) * 0.003);
  const look = pointAt(u + lookAhead + kart.seed * 0.00001);
  const [lx, ly] = leftNormal(look);
  const lat = ((kart.seed % 5) - 2) * Math.max(0.12, 0.55 - (level - 1) * 0.07);
  const dx = look.x + lx * lat - kart.x;
  const dy = look.y + ly * lat - kart.y;
  const desired = Math.atan2(dx, dy);
  const diff = wrap(desired - kart.yaw);
  const steer = Math.max(-1, Math.min(1, -diff / 0.42));
  const slow = Math.abs(diff) > 0.9 ? 0.85 : 1;
  const pace = Math.min(33, kart.cruise + (level - 1) * 2.2);
  return { steer, throttle: kart.speed < pace * slow ? 1 : 0.25 };
}

function slopeAt(x: number, y: number) {
  const e = 0.45;
  const h = duneHeight(x, y);
  const hx = (duneHeight(x + e, y) - duneHeight(x - e, y)) / (2 * e);
  const hy = (duneHeight(x, y + e) - duneHeight(x, y - e)) / (2 * e);
  return { h: h + RIDE, hx, hy };
}

function ride(kart: Kart, steer: number, drive: number, built: Sim["cart"], dt: number, cap: number) {
  const fx = Math.sin(kart.yaw);
  const fy = Math.cos(kart.yaw);
  const rx = fy;
  const ry = -fx;
  let vx = kart.vx;
  let vy = kart.vy;
  let vz = kart.vz;
  const here = slopeAt(kart.x, kart.y);
  const forward = vx * fx + vy * fy;
  const grip = Math.max(0.35, built?.grip ?? 1);
  const hold = kart.ai ? Math.min(18, 11 + Math.max(0, cap - kart.cruise) * 0.4) : 11 * grip;
  const onGround = !kart.air && kart.z <= here.h + 0.12;
  const spd = Math.hypot(vx, vy);

  if (onGround) {
    const lateral = vx * rx + vy * ry;
    const latAccel = Math.max(-hold, Math.min(hold, -lateral / Math.max(dt, 1e-4)));
    let driveAccel = 0;
    if (drive > 0) driveAccel = 16 * (built?.speed ?? 1);
    else if (drive < 0) driveAccel = -26;
    else driveAccel = -Math.sign(forward) * Math.min(7, Math.abs(forward) / Math.max(dt, 1e-4));
    const nx = -here.hx;
    const ny = -here.hy;
    const inv = 1 / Math.hypot(nx, ny, 1);
    const gdot = -GRAVITY * inv;
    vx += (fx * driveAccel + rx * latAccel - nx * inv * gdot - vx * 0.22) * dt;
    vy += (fy * driveAccel + ry * latAccel - ny * inv * gdot - vy * 0.22) * dt;
    const fwdNow = vx * fx + vy * fy;
    if (fwdNow > cap) {
      vx -= fx * (fwdNow - cap);
      vy -= fy * (fwdNow - cap);
    } else if (fwdNow < -9) {
      vx -= fx * (fwdNow + 9);
      vy -= fy * (fwdNow + 9);
    }
    vz = here.hx * vx + here.hy * vy;
  } else {
    vz -= GRAVITY * dt;
    const hspd = Math.hypot(vx, vy);
    if (hspd > 34) {
      const scale = 34 / hspd;
      vx *= scale;
      vy *= scale;
    }
  }

  const reverse = forward >= -0.4 ? 1 : -1;
  const speedFactor = Math.max(0.22, Math.min(1, spd / 7));
  if (onGround) kart.yaw -= steer * TURN * (built?.turn ?? 1) * speedFactor * reverse * dt;
  else kart.yaw -= steer * 0.65 * dt;

  kart.x += vx * dt;
  kart.y += vy * dt;
  kart.z += vz * dt;
  if (waterAt(kart.x, kart.y) != null) {
    vx *= Math.pow(0.2, dt);
    vy *= Math.pow(0.2, dt);
  }

  const next = slopeAt(kart.x, kart.y);
  const prevRising = here.hx * vx + here.hy * vy;
  const nextRising = next.hx * vx + next.hy * vy;
  if (kart.z <= next.h) {
    const impact = nextRising - vz;
    kart.z = next.h;
    if (impact > 8) {
      vz = nextRising + Math.min(6, impact * 0.2);
      kart.air = true;
    } else {
      vz = nextRising;
      kart.air = false;
    }
  } else if (onGround) {
    const aVert = (nextRising - prevRising) / Math.max(dt, 1e-4);
    if (aVert < -GRAVITY && spd > 10) {
      kart.air = true;
      vz = Math.max(vz, prevRising);
    } else {
      kart.z = next.h;
      vz = nextRising;
      kart.air = false;
    }
  } else {
    kart.air = true;
  }
  if (kart.air && kart.z <= next.h + 0.04 && vz <= nextRising + 1.2) {
    const aVert = (nextRising - prevRising) / Math.max(dt, 1e-4);
    if (aVert > -GRAVITY) {
      kart.z = next.h;
      vz = nextRising;
      kart.air = false;
    }
  }

  kart.vx = vx;
  kart.vy = vy;
  kart.vz = vz;
  kart.speed = vx * Math.sin(kart.yaw) + vy * Math.cos(kart.yaw);
}

function touch(
  a: Kart,
  b: { x: number; y: number; z: number; vx: number; vy: number; vz: number; radius: number; mass: number },
) {
  const p1: [number, number, number] = [a.x, a.y, a.z];
  const p2: [number, number, number] = [b.x, b.y, b.z];
  const v1: [number, number, number] = [a.vx, a.vy, a.vz];
  const v2: [number, number, number] = [b.vx, b.vy, b.vz];
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dist = Math.hypot(dx, dy);
  let closing = 0;
  if (dist < a.radius + b.radius && dist > 1e-8) {
    const nx = dx / dist;
    const ny = dy / dist;
    closing = -((v1[0] - v2[0]) * nx + (v1[1] - v2[1]) * ny);
  }
  bumpBodies(p1, p2, v1, v2, a.radius, b.radius, a.mass, b.mass, 60);
  if (closing > 2.5) {
    const pop = Math.min(3.2, closing * 0.16);
    v1[2] += pop;
    v2[2] += pop;
  }
  a.x = p1[0];
  a.y = p1[1];
  a.z = p1[2];
  a.vx = v1[0];
  a.vy = v1[1];
  a.vz = v1[2];
  b.x = p2[0];
  b.y = p2[1];
  b.z = p2[2];
  b.vx = v2[0];
  b.vy = v2[1];
  b.vz = v2[2];
  a.speed = a.vx * Math.sin(a.yaw) + a.vy * Math.cos(a.yaw);
  return closing;
}

function plant(kart: Kart) {
  const floor = slopeAt(kart.x, kart.y).h;
  if (kart.z < floor) {
    kart.z = floor;
    if (kart.vz < 1.5) {
      kart.vz = 0;
      kart.air = false;
    } else kart.air = true;
  }
}

function resetKart(kart: Kart, i: number) {
  const fresh = placeKart(i, kart.name);
  kart.x = fresh.x;
  kart.y = fresh.y;
  kart.z = fresh.z;
  kart.yaw = fresh.yaw;
  kart.speed = 0;
  kart.vx = 0;
  kart.vy = 0;
  kart.vz = 0;
  kart.air = false;
  kart.travel = fresh.travel;
  kart.finishedAt = null;
}

/** One fixed step. Steer +1 is player-left, which is −yaw in the Z-up basis. */
export function stepSim(sim: Sim, dt: number, peers: Bumper[] = []) {
  if (!sim.running) return;
  sim.time += dt;
  sim.tick += 1;
  const player = sim.karts[0]!;
  const playerSteer = readSteer(sim);
  const gas = throttle(sim);

  for (const kart of sim.karts) {
    const bot = kart.ai && kart.finishedAt == null ? aiSteer(kart, sim.level) : null;
    const steer = kart.finishedAt != null ? 0 : bot ? bot.steer : playerSteer;
    const drive = kart.finishedAt != null ? 0 : bot ? bot.throttle : gas;
    const built = kart === player ? sim.cart : null;
    const cap = kart.ai ? Math.min(33, kart.cruise + (sim.level - 1) * 2.2) : MAX_SPEED * (built?.speed ?? 1);
    ride(kart, steer, drive, built, dt, cap);
    advanceTravel(kart);
    contain(kart);
    if (kart === player && kart.finishedAt == null) {
      const uNow = ((kart.travel % 1) + 1) % 1;
      const sampleNow = pointAt(uNow);
      const [nlx, nly] = leftNormal(sampleNow);
      const latNow = (kart.x - sampleNow.x) * nlx + (kart.y - sampleNow.y) * nly;
      if (Math.abs(latNow) > halfWidth() - 0.15 && Math.abs(kart.speed) > 4 && sim.tick - sim.scrapeTick > 18) {
        sim.scrapeTick = sim.tick;
        sim.events.push({ kind: "scrape", amount: Math.min(1, Math.abs(kart.speed) / 20), x: kart.x, y: kart.y });
        sim.shake = Math.min(1, sim.shake + 0.28);
      }
      const lap = Math.floor(kart.travel);
      if (lap > sim.lapSeen && lap < lapCount()) {
        sim.events.push({ kind: "lap", amount: 1, x: kart.x, y: kart.y });
      }
      sim.lapSeen = Math.max(sim.lapSeen, lap);
    }
    if (kart.travel >= lapCount() && kart.finishedAt == null) {
      kart.finishedAt = sim.time;
      kart.speed *= 0.5;
      kart.vx *= 0.5;
      kart.vy *= 0.5;
      if (kart === player) {
        sim.banner = "Finished";
        sim.events.push({ kind: "finish", amount: 1, x: kart.x, y: kart.y });
        sim.shake = Math.min(1, sim.shake + 0.35);
        if (sim.bestMs == null || sim.time * 1000 < sim.bestMs) {
          sim.bestMs = sim.time * 1000;
          try {
            localStorage.setItem("facerace-best-ms", String(sim.bestMs));
          } catch {
            /* private mode */
          }
        }
      }
    }
  }

  if (sim.events.length > 16) sim.events.splice(0, sim.events.length - 16);

  for (let i = 0; i < sim.karts.length; i++) {
    for (let j = i + 1; j < sim.karts.length; j++) {
      const a = sim.karts[i]!;
      const b = sim.karts[j]!;
      const closing = touch(a, b);
      if (closing > 1.2 && (a === player || b === player) && sim.tick - sim.bumpTick > 8) {
        sim.bumpTick = sim.tick;
        const amount = Math.min(1, closing / 16);
        sim.events.push({ kind: "bump", amount, x: player.x, y: player.y });
        sim.shake = Math.min(1, sim.shake + amount * 0.85);
      }
    }
  }
  for (const kart of sim.karts) {
    for (const peer of peers) {
      const ghost: Bumper = { ...peer };
      const closing = touch(kart, ghost);
      if (closing > 1.2 && kart === player && sim.tick - sim.bumpTick > 8) {
        sim.bumpTick = sim.tick;
        const amount = Math.min(1, closing / 16);
        sim.events.push({ kind: "bump", amount, x: player.x, y: player.y });
        sim.shake = Math.min(1, sim.shake + amount * 0.85);
      }
    }
    plant(kart);
  }

  if (player.finishedAt != null && !sim.promoted && sim.time - player.finishedAt > 2.6) {
    if (courseIndex() >= courseCount() - 1) {
      sim.level = Math.min(12, sim.level + 1);
      setCourse(0);
    } else {
      setCourse(courseIndex() + 1);
    }
    for (let i = 0; i < sim.karts.length; i++) resetKart(sim.karts[i]!, i);
    sim.time = 0;
    sim.lapSeen = 0;
    sim.bannerUntil = 4.5;
    sim.wrongWay = false;
    sim.events.push({ kind: "horn", amount: 1, x: player.x, y: player.y });
  }

  const u = ((player.travel % 1) + 1) % 1;
  const sample = pointAt(u);
  const heading = wrap(player.yaw - sample.yaw);
  const wrong = player.finishedAt == null && Math.abs(heading) > 2.2;
  if (wrong && !sim.wrongWay && sim.tick - sim.wrongTick > 90) {
    sim.wrongTick = sim.tick;
    sim.events.push({ kind: "wrong", amount: 1, x: player.x, y: player.y });
  }
  sim.wrongWay = wrong;
  const named = sim.time < sim.bannerUntil;
  const heat = sim.level > 1 ? `${courseName()} · heat ${sim.level}` : courseName();
  if (!sim.banner.startsWith("Won")) {
    sim.banner = player.finishedAt != null ? "Finished" : named || sim.level > 1 ? (wrong ? "Wrong way" : heat) : wrong ? "Wrong way" : "";
  }
}

export function parkOn(sim: Sim, courseId: string) {
  if (sim.karts.length < NAMES.length) {
    const name = sim.karts[0]?.name || "You";
    sim.karts = NAMES.map((label, i) => placeKart(i, i === 0 ? name : label));
  }
  setCourseById(courseId);
  for (let i = 0; i < sim.karts.length; i++) resetKart(sim.karts[i]!, i);
  sim.time = 0;
  sim.lapSeen = 0;
  sim.bannerUntil = 4.5;
  sim.wrongWay = false;
  sim.promoted = false;
  sim.level = 1;
  sim.running = false;
  sim.banner = courseName();
}

/** A purse or a full room: one human kart, no computer field. */
export function parkHuman(sim: Sim, courseId: string, name: string, slot: number) {
  setCourseById(courseId);
  const you = sim.karts[0] ?? placeKart(0, name);
  const fresh = placeKart(Math.max(0, Math.min(11, slot)), name);
  you.name = name;
  you.ai = false;
  you.x = fresh.x;
  you.y = fresh.y;
  you.z = fresh.z;
  you.yaw = fresh.yaw;
  you.speed = 0;
  you.vx = 0;
  you.vy = 0;
  you.vz = 0;
  you.air = false;
  you.travel = fresh.travel;
  you.finishedAt = null;
  sim.karts = [you];
  sim.time = 0;
  sim.lapSeen = 0;
  sim.bannerUntil = 0;
  sim.wrongWay = false;
  sim.promoted = true;
  sim.level = 1;
  sim.running = false;
  sim.banner = "Hold for the flag";
}

export function lapOf(kart: Kart) {
  if (kart.finishedAt != null) return lapCount();
  return Math.min(lapCount(), Math.floor(kart.travel) + 1);
}

export function placeOf(sim: Sim, kart: Kart) {
  const rank = (k: Kart) => (k.finishedAt != null ? 100 + (100000 - k.finishedAt) : k.travel);
  const sorted = [...sim.karts].sort((a, b) => rank(b) - rank(a));
  return sorted.findIndex((k) => k === kart) + 1;
}

export function installProbe(sim: Sim) {
  window.__controlsTest = {
    getYaw: () => -sim.karts[0]!.yaw,
    getSpeed: () => sim.karts[0]!.speed,
    setKeys: (codes: string[]) => {
      sim.keys = new Set(codes);
    },
    setSteer: (v: number) => {
      sim.steer = v;
    },
  };
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
  }
}
