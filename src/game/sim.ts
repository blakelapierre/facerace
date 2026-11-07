import { bumpSpheres } from "./contact";
import { duneHeight } from "./terrain";
import { courseCount, courseIndex, courseName, halfWidth, lapCount, leftNormal, nearestU, pointAt, setCourse } from "./track";

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
  /** The stadium has already handed off to the next course. */
  promoted: boolean;
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
const BODY = 0.95;

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
  const edge = halfWidth() + 0.45;
  if (Math.abs(lat) <= edge) return;
  const clamped = Math.sign(lat) * edge;
  kart.x = sample.x + lx * clamped;
  kart.y = sample.y + ly * clamped;
  kart.speed *= 0.9;
}

function aiSteer(kart: Kart) {
  const u = ((kart.travel % 1) + 1) % 1;
  const look = pointAt(u + 0.04 + kart.seed * 0.00001);
  const [lx, ly] = leftNormal(look);
  const lat = ((kart.seed % 5) - 2) * 0.55;
  const dx = look.x + lx * lat - kart.x;
  const dy = look.y + ly * lat - kart.y;
  const desired = Math.atan2(dx, dy);
  const diff = wrap(desired - kart.yaw);
  const steer = Math.max(-1, Math.min(1, -diff / 0.42));
  const slow = Math.abs(diff) > 0.7 ? 0.72 : 1;
  return { steer, throttle: kart.speed < kart.cruise * slow ? 1 : 0 };
}

/** One fixed step. A/D: steer +1 is player-left, which is −yaw in the Z-up basis. */
export function stepSim(sim: Sim, dt: number) {
  if (!sim.running) return;
  sim.time += dt;
  sim.tick += 1;
  const player = sim.karts[0]!;
  const playerSteer = readSteer(sim);
  const gas = throttle(sim);

  for (const kart of sim.karts) {
    if (kart.finishedAt != null) {
      kart.speed *= Math.pow(0.15, dt);
      kart.x += Math.sin(kart.yaw) * kart.speed * dt;
      kart.y += Math.cos(kart.yaw) * kart.speed * dt;
      continue;
    }
    const bot = kart.ai ? aiSteer(kart) : null;
    const steer = bot ? bot.steer : playerSteer;
    const drive = bot ? bot.throttle : gas;
    const reverse = kart.speed >= 0 ? 1 : -1;
    const speedFactor = Math.max(0.28, Math.min(1, Math.abs(kart.speed) / 8));
    kart.yaw -= steer * TURN * speedFactor * reverse * dt;
    if (drive > 0) kart.speed += 22 * dt;
    else if (drive < 0) kart.speed -= 30 * dt;
    else kart.speed -= Math.sign(kart.speed) * 6 * dt;
    const aheadX = kart.x + Math.sin(kart.yaw) * 2;
    const aheadY = kart.y + Math.cos(kart.yaw) * 2;
    const grade = (duneHeight(aheadX, aheadY) - duneHeight(kart.x, kart.y)) / 2;
    kart.speed -= grade * 16 * dt;
    if (kart.speed > MAX_SPEED) kart.speed = MAX_SPEED;
    if (kart.speed < -9) kart.speed = -9;
    if (Math.abs(kart.speed) < 0.08 && drive === 0) kart.speed = 0;
    kart.x += Math.sin(kart.yaw) * kart.speed * dt;
    kart.y += Math.cos(kart.yaw) * kart.speed * dt;
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
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      const reach = a.radius + b.radius;
      let closing = 0;
      if (dist < reach && dist > 1e-8) {
        const nx = dx / dist;
        const ny = dy / dist;
        const vax = Math.sin(a.yaw) * a.speed;
        const vay = Math.cos(a.yaw) * a.speed;
        const vbx = Math.sin(b.yaw) * b.speed;
        const vby = Math.cos(b.yaw) * b.speed;
        closing = -((vax - vbx) * nx + (vay - vby) * ny);
      }
      const p1: [number, number] = [a.x, a.y];
      const p2: [number, number] = [b.x, b.y];
      const v1: [number, number] = [Math.sin(a.yaw) * a.speed, Math.cos(a.yaw) * a.speed];
      const v2: [number, number] = [Math.sin(b.yaw) * b.speed, Math.cos(b.yaw) * b.speed];
      bumpSpheres(p1, p2, v1, v2, a.radius, b.radius, a.mass, b.mass, 60);
      a.x = p1[0];
      a.y = p1[1];
      b.x = p2[0];
      b.y = p2[1];
      const alongA = v1[0] * Math.sin(a.yaw) + v1[1] * Math.cos(a.yaw);
      const alongB = v2[0] * Math.sin(b.yaw) + v2[1] * Math.cos(b.yaw);
      a.speed = alongA;
      b.speed = alongB;
      if (closing > 1.2 && (a === player || b === player) && sim.tick - sim.bumpTick > 8) {
        sim.bumpTick = sim.tick;
        const amount = Math.min(1, closing / 16);
        sim.events.push({ kind: "bump", amount, x: player.x, y: player.y });
        sim.shake = Math.min(1, sim.shake + amount * 0.85);
      }
    }
  }

  if (player.finishedAt != null && !sim.promoted && courseIndex() < courseCount() - 1 && sim.time - player.finishedAt > 2.6) {
    sim.promoted = true;
    setCourse(courseIndex() + 1);
    for (let i = 0; i < sim.karts.length; i++) {
      const kart = sim.karts[i]!;
      const fresh = placeKart(i, kart.name);
      kart.x = fresh.x;
      kart.y = fresh.y;
      kart.yaw = fresh.yaw;
      kart.speed = 0;
      kart.travel = fresh.travel;
      kart.finishedAt = null;
    }
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
  sim.banner = player.finishedAt != null ? "Finished" : named ? courseName() : wrong ? "Wrong way" : "";
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
