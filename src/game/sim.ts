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
  pitch: number;
  roll: number;
  pitchVel: number;
  rollVel: number;
  /** Seconds spent upside down. A long one flips the kart back over. */
  invert: number;
  /** 1 is a full bottle. Boost spends it. Coasting fills it. */
  nox: number;
  flame: boolean;
  mark: { x: number; y: number } | null;
  wheels: Wheel[];
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
  /** 1 while the brake button is held. Space and a pulled-back phone also brake. */
  brake: number;
  /** 1 while the boost button is held. Shift and a phone tipped forward also boost. */
  boost: number;
  /** Phone pitch, −1..1. Negative is pulled back (brake). Positive is tipped forward (boost). */
  lean: number;
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
  /** Recent tire marks, oldest first. Shared with every painter. */
  skids: Skid[];
  /** Marks laid this step, for the net. Drained by the frame. */
  skidOut: Skid[];
};

export type Wheel = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  down: boolean;
};

export type Skid = { x: number; y: number; x2: number; y2: number };

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
const RIDE = 0.5;
const GRAVITY = 18;
const WHEEL_R = 0.2;
const RESTL = 0.36;
const HUBS: { x: number; y: number }[] = [
  { x: 0.46, y: 0.5 },
  { x: -0.46, y: 0.5 },
  { x: 0.46, y: -0.42 },
  { x: -0.46, y: -0.42 },
];

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

function basis(yaw: number, pitch: number, roll: number) {
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const fx = Math.sin(yaw);
  const fy = Math.cos(yaw);
  const fwd: [number, number, number] = [fx * cp, fy * cp, sp];
  const rx0 = Math.cos(yaw);
  const ry0 = -Math.sin(yaw);
  const ux = -fx * sp;
  const uy = -fy * sp;
  const uz = cp;
  return {
    fwd,
    right: [rx0 * cr + ux * sr, ry0 * cr + uy * sr, uz * sr] as [number, number, number],
    up: [ux * cr - rx0 * sr, uy * cr - ry0 * sr, uz * cr] as [number, number, number],
  };
}

function hangWheels(kart: Kart) {
  const pose = basis(kart.yaw, kart.pitch, kart.roll);
  kart.wheels = HUBS.map((hub) => {
    const x = kart.x + pose.right[0] * hub.x + pose.fwd[0] * hub.y;
    const y = kart.y + pose.right[1] * hub.x + pose.fwd[1] * hub.y;
    return { x, y, z: duneHeight(x, y) + WHEEL_R, vx: kart.vx, vy: kart.vy, vz: 0, down: true };
  });
  const z = kart.wheels.reduce((sum, wheel) => sum + wheel.z, 0) / kart.wheels.length + RESTL;
  kart.z = z;
}

function placeKart(i: number, name: string): Kart {
  const u = 0.016 + i * 0.016;
  const sample = pointAt(u);
  const [lx, ly] = leftNormal(sample);
  const lat = i % 2 === 0 ? -1.45 : 1.45;
  const kart: Kart = {
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
    pitch: 0,
    roll: 0,
    pitchVel: 0,
    rollVel: 0,
    invert: 0,
    nox: 1,
    flame: false,
    mark: null,
    wheels: [],
  };
  hangWheels(kart);
  return kart;
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
    brake: 0,
    boost: 0,
    lean: 0,
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
    skids: [],
    skidOut: [],
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

function readBrake(sim: Sim) {
  let brake = 0;
  if (down(sim, "Space") || sim.brake > 0) brake = 1;
  if (sim.hands === "tilt" && sim.lean < -0.22) brake = Math.max(brake, Math.min(1, (-sim.lean - 0.22) / 0.45));
  return brake;
}

function readBoost(sim: Sim) {
  if (down(sim, "ShiftLeft") || down(sim, "ShiftRight") || sim.boost > 0) return true;
  return sim.hands === "tilt" && sim.lean > 0.28;
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
  const brake = Math.abs(diff) > 1.05 ? 1 : 0;
  const boost = Math.abs(diff) < 0.2 && kart.speed + 0.8 < pace;
  return { steer, throttle: kart.speed < pace * slow ? 1 : 0.25, brake, boost };
}

function slopeAt(x: number, y: number) {
  const e = 0.45;
  const h = duneHeight(x, y);
  const hx = (duneHeight(x + e, y) - duneHeight(x - e, y)) / (2 * e);
  const hy = (duneHeight(x, y + e) - duneHeight(x, y - e)) / (2 * e);
  return { h: h + RIDE, hx, hy };
}

function ride(kart: Kart, steer: number, drive: number, brake: number, boost: boolean, built: Sim["cart"], dt: number, cap: number) {
  const faceX = Math.sin(kart.yaw);
  const faceY = Math.cos(kart.yaw);
  const rx = Math.cos(kart.yaw);
  const ry = -Math.sin(kart.yaw);
  let vx = kart.vx;
  let vy = kart.vy;
  let vz = kart.vz;
  const grounded = kart.wheels.reduce((n, wheel) => n + (wheel.down ? 1 : 0), 0);
  const traction = grounded / 4;
  const forward = vx * faceX + vy * faceY;
  const grip = Math.max(0.35, built?.grip ?? 1);
  const hold = (kart.ai ? Math.min(18, 11 + Math.max(0, cap - kart.cruise) * 0.4) : 11 * grip) * Math.max(0.15, traction);
  const spd = Math.hypot(vx, vy);
  const skidBrake = brake > 0.05 && traction > 0;

  if (traction > 0) {
    const lateral = vx * rx + vy * ry;
    const latAccel = Math.max(-hold, Math.min(hold, -lateral / Math.max(dt, 1e-4)));
    let driveAccel = 0;
    if (skidBrake) driveAccel = -Math.sign(forward || 1) * (24 + 30 * brake);
    else if (drive > 0) driveAccel = 16 * (built?.speed ?? 1);
    else if (drive < 0) driveAccel = -22;
    else driveAccel = -Math.sign(forward) * Math.min(7, Math.abs(forward) / Math.max(dt, 1e-4));
    if (boost && !skidBrake) driveAccel += 26;
    const mid = slopeAt(kart.x, kart.y);
    const nx = -mid.hx;
    const ny = -mid.hy;
    const inv = 1 / Math.hypot(nx, ny, 1);
    const drag = 0.16 + brake * 0.4;
    vx += (faceX * driveAccel + rx * latAccel + nx * inv * GRAVITY * inv - vx * drag) * dt;
    vy += (faceY * driveAccel + ry * latAccel + ny * inv * GRAVITY * inv - vy * drag) * dt;
    const capNow = cap + (boost && !skidBrake ? 10 : 0);
    const fwdNow = vx * faceX + vy * faceY;
    if (fwdNow > capNow) {
      vx -= faceX * (fwdNow - capNow);
      vy -= faceY * (fwdNow - capNow);
    } else if (fwdNow < -9) {
      vx -= faceX * (fwdNow + 9);
      vy -= faceY * (fwdNow + 9);
    }
    if (skidBrake && forward * (vx * faceX + vy * faceY) < 0) {
      const stop = vx * faceX + vy * faceY;
      vx -= faceX * stop;
      vy -= faceY * stop;
    }
  }

  const reverse = forward >= -0.4 ? 1 : -1;
  const speedFactor = Math.max(0.22, Math.min(1, spd / 7));
  if (traction > 0) kart.yaw -= steer * TURN * (built?.turn ?? 1) * speedFactor * reverse * (brake > 0.5 ? 1.2 : 1) * dt;
  else kart.yaw -= steer * 0.55 * dt;

  vz -= GRAVITY * dt;
  kart.x += vx * dt;
  kart.y += vy * dt;
  kart.z += vz * dt;

  const pose = basis(kart.yaw, kart.pitch, kart.roll);
  let lifts = 0;
  const planted: { lx: number; ly: number; z: number; down: boolean }[] = [];
  for (let i = 0; i < HUBS.length; i++) {
    const hubL = HUBS[i]!;
    const hub = {
      x: kart.x + pose.right[0] * hubL.x + pose.fwd[0] * hubL.y + pose.up[0] * -0.02,
      y: kart.y + pose.right[1] * hubL.x + pose.fwd[1] * hubL.y + pose.up[1] * -0.02,
      z: kart.z + pose.right[2] * hubL.x + pose.fwd[2] * hubL.y + pose.up[2] * -0.02,
    };
    const wheel = kart.wheels[i]!;
    wheel.x += (hub.x - wheel.x) * Math.min(1, dt * 10);
    wheel.y += (hub.y - wheel.y) * Math.min(1, dt * 10);
    let wx = wheel.vx;
    let wy = wheel.vy;
    let wz = wheel.vz;
    wx += (vx - wx) * Math.min(1, dt * 6);
    wy += (vy - wy) * Math.min(1, dt * 6);
    const dx = wheel.x - hub.x;
    const dy = wheel.y - hub.y;
    const dz = wheel.z - hub.z;
    const dist = Math.hypot(dx, dy, dz) || 1e-4;
    const nx = dx / dist;
    const ny = dy / dist;
    const nz = dz / dist;
    const rel = (wx - vx) * nx + (wy - vy) * ny + (wz - vz) * nz;
    let force = 0;
    if (dist < RESTL) {
      force = (RESTL - dist) * 240 - rel * 30;
      if (force < 0) force = 0;
    } else if (dist > RESTL + 0.22) {
      force = -(dist - (RESTL + 0.22)) * 70 - rel * 12;
    }
    const wheelMass = 0.22;
    wx += (nx * force) / wheelMass * dt;
    wy += (ny * force) / wheelMass * dt;
    wz += (nz * force) / wheelMass * dt;
    vx -= (nx * force) / 1.15 * dt;
    vy -= (ny * force) / 1.15 * dt;
    vz -= (nz * force) / 1.15 * dt;
    wz -= GRAVITY * dt;
    wheel.x += wx * dt;
    wheel.y += wy * dt;
    wheel.z += wz * dt;
    const ground = duneHeight(wheel.x, wheel.y);
    const slope = slopeAt(wheel.x, wheel.y);
    if (wheel.z <= ground + WHEEL_R) {
      wheel.z = ground + WHEEL_R;
      const gnx = -slope.hx;
      const gny = -slope.hy;
      const ginv = 1 / Math.hypot(gnx, gny, 1);
      const gvx = gnx * ginv;
      const gvy = gny * ginv;
      const gvz = ginv;
      const vn = wx * gvx + wy * gvy + wz * gvz;
      if (vn < 0) {
        wx -= gvx * vn;
        wy -= gvy * vn;
        wz -= gvz * vn;
      }
      wheel.down = true;
      lifts += 1;
    } else wheel.down = false;
    wheel.vx = wx;
    wheel.vy = wy;
    wheel.vz = wz;
    planted.push({ lx: hubL.x, ly: hubL.y, z: wheel.z, down: wheel.down });
  }

  let targetPitch = 0;
  let targetRoll = 0;
  const front = planted.filter((spot) => spot.ly > 0 && spot.down);
  const rear = planted.filter((spot) => spot.ly < 0 && spot.down);
  const left = planted.filter((spot) => spot.lx < 0 && spot.down);
  const right = planted.filter((spot) => spot.lx > 0 && spot.down);
  if (front.length && rear.length) {
    const frontZ = front.reduce((sum, spot) => sum + spot.z, 0) / front.length;
    const rearZ = rear.reduce((sum, spot) => sum + spot.z, 0) / rear.length;
    targetPitch = Math.atan2(frontZ - rearZ, 0.92);
  }
  if (left.length && right.length) {
    const leftZ = left.reduce((sum, spot) => sum + spot.z, 0) / left.length;
    const rightZ = right.reduce((sum, spot) => sum + spot.z, 0) / right.length;
    targetRoll = Math.atan2(rightZ - leftZ, 0.92);
  }
  if (lifts >= 2) {
    kart.pitchVel += ((targetPitch - kart.pitch) * 16 - kart.pitchVel * 5.5) * dt;
    kart.rollVel += ((targetRoll - kart.roll) * 16 - kart.rollVel * 5.5) * dt;
  } else {
    kart.pitchVel += ((0 - kart.pitch) * 2.2 - kart.pitchVel * 1.4) * dt;
    kart.rollVel += ((0 - kart.roll) * 2.2 - kart.rollVel * 1.4) * dt;
  }
  kart.pitch = Math.max(-1.15, Math.min(1.15, kart.pitch + kart.pitchVel * dt));
  kart.roll = Math.max(-1.25, Math.min(1.25, kart.roll + kart.rollVel * dt));

  const bodyH = duneHeight(kart.x, kart.y);
  const upZ = Math.cos(kart.pitch) * Math.cos(kart.roll);
  if (upZ < 0.2) {
    kart.invert += dt;
    if (kart.invert > 0.85) {
      kart.rollVel -= wrap(kart.roll) * 9 * dt;
      kart.pitchVel -= wrap(kart.pitch) * 9 * dt;
      vz = Math.max(vz, 2.5);
      if (kart.invert > 1.45) {
        kart.pitch = 0;
        kart.roll = 0;
        kart.pitchVel = 0;
        kart.rollVel = 0;
        kart.z = Math.max(kart.z, bodyH + 0.9);
        vz = Math.max(vz, 3);
        kart.invert = 0;
        hangWheels(kart);
      }
    }
  } else kart.invert = Math.max(0, kart.invert - dt * 2);

  if (upZ >= 0.2 && kart.z < bodyH + 0.28) {
    kart.z = bodyH + 0.28;
    if (vz < 0) vz *= 0.2;
  }
  if (lifts === 0) kart.air = true;
  else if (lifts >= 3 && kart.z <= bodyH + 0.85) kart.air = false;
  else kart.air = lifts < 2;

  const ahead = slopeAt(kart.x + faceX * 1.4, kart.y + faceY * 1.4);
  const behind = slopeAt(kart.x - faceX * 1.4, kart.y - faceY * 1.4);
  const aVert = ((ahead.hx - behind.hx) * vx + (ahead.hy - behind.hy) * vy) / 2.8;
  if (aVert < -GRAVITY && spd > 11 && lifts >= 2) {
    kart.air = true;
    vz = Math.max(vz, Math.min(7, -aVert * 0.08));
  }

  if (waterAt(kart.x, kart.y) != null) {
    vx *= Math.pow(0.25, dt);
    vy *= Math.pow(0.25, dt);
  }

  kart.vx = vx;
  kart.vy = vy;
  kart.vz = vz;
  kart.speed = vx * faceX + vy * faceY;
  kart.flame = boost && !skidBrake && traction > 0;
  return traction > 0 && (skidBrake && spd > 5 || (Math.abs(steer) > 0.55 && spd > 9) || (drive > 0.7 && spd > 2 && spd < 12));
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
  const floor = duneHeight(kart.x, kart.y) + 0.2;
  if (kart.z < floor) {
    kart.z = floor;
    if (kart.vz < 0) kart.vz = 0;
  }
}

function laySkid(sim: Sim, kart: Kart, active: boolean) {
  if (!active) {
    kart.mark = null;
    return;
  }
  const rears = kart.wheels.filter((_, index) => HUBS[index]!.y < 0);
  if (!rears.length) return;
  const x = rears.reduce((sum, wheel) => sum + wheel.x, 0) / rears.length;
  const y = rears.reduce((sum, wheel) => sum + wheel.y, 0) / rears.length;
  if (!kart.mark) {
    kart.mark = { x, y };
    return;
  }
  if (Math.hypot(x - kart.mark.x, y - kart.mark.y) < 0.75) return;
  const mark: Skid = { x: kart.mark.x, y: kart.mark.y, x2: x, y2: y };
  sim.skids.push(mark);
  sim.skidOut.push(mark);
  if (sim.skids.length > 28) sim.skids.shift();
  kart.mark = { x, y };
}

function touchWheel(wheel: Wheel, body: Bumper) {
  const p1: [number, number, number] = [wheel.x, wheel.y, wheel.z];
  const p2: [number, number, number] = [body.x, body.y, body.z];
  const v1: [number, number, number] = [wheel.vx, wheel.vy, wheel.vz];
  const v2: [number, number, number] = [body.vx, body.vy, body.vz];
  bumpBodies(p1, p2, v1, v2, WHEEL_R, body.radius, 0.22, body.mass, 60);
  wheel.x = p1[0];
  wheel.y = p1[1];
  wheel.z = p1[2];
  wheel.vx = v1[0];
  wheel.vy = v1[1];
  wheel.vz = v1[2];
  body.x = p2[0];
  body.y = p2[1];
  body.z = p2[2];
  body.vx = v2[0];
  body.vy = v2[1];
  body.vz = v2[2];
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
  kart.pitch = 0;
  kart.roll = 0;
  kart.pitchVel = 0;
  kart.rollVel = 0;
  kart.invert = 0;
  kart.nox = 1;
  kart.flame = false;
  kart.mark = null;
  kart.wheels = fresh.wheels.map((wheel) => ({ ...wheel }));
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
  const playerBrake = readBrake(sim);
  const playerBoost = readBoost(sim);

  for (const kart of sim.karts) {
    const bot = kart.ai && kart.finishedAt == null ? aiSteer(kart, sim.level) : null;
    const steer = kart.finishedAt != null ? 0 : bot ? bot.steer : playerSteer;
    const drive = kart.finishedAt != null ? 0 : bot ? bot.throttle : gas;
    const brake = kart.finishedAt != null ? 0 : bot ? bot.brake : playerBrake;
    const wantsBoost = kart.finishedAt == null && (bot ? bot.boost : playerBoost) && kart.nox > 0.04;
    if (wantsBoost) kart.nox = Math.max(0, kart.nox - dt * 0.34);
    else kart.nox = Math.min(1, kart.nox + dt * 0.12);
    const built = kart === player ? sim.cart : null;
    const cap = kart.ai ? Math.min(33, kart.cruise + (sim.level - 1) * 2.2) : MAX_SPEED * (built?.speed ?? 1);
    const skidding = ride(kart, steer, drive, brake, wantsBoost, built, dt, cap);
    laySkid(sim, kart, skidding);
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
      for (const wheel of a.wheels) touchWheel(wheel, b);
      for (const wheel of b.wheels) touchWheel(wheel, a);
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
      for (const wheel of kart.wheels) touchWheel(wheel, ghost);
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
      sim.skids = [];
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
  sim.skids = [];
  sim.skidOut = [];
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
  you.pitch = 0;
  you.roll = 0;
  you.pitchVel = 0;
  you.rollVel = 0;
  you.invert = 0;
  you.nox = 1;
  you.flame = false;
  you.mark = null;
  you.wheels = fresh.wheels.map((wheel) => ({ ...wheel }));
  you.travel = fresh.travel;
  you.finishedAt = null;
  sim.karts = [you];
  sim.time = 0;
  sim.lapSeen = 0;
  sim.bannerUntil = 0;
  sim.wrongWay = false;
  sim.promoted = true;
  sim.level = 1;
  sim.skids = [];
  sim.skidOut = [];
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
