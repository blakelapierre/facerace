import type { FaceImage } from "./faces";
import { duneHeight } from "./terrain";
import { course, halfWidth, leftNormal, pointAt, trackRibbon } from "./track";

type V3 = [number, number, number];

export type SceneObject =
  | { type: "sphere"; origin: V3; radius: number; color: number[]; reflectivity?: number; texture?: FaceImage }
  | { type: "shape"; kind: string; a: V3; b: V3; c?: V3; r?: number; color: number[]; reflectivity?: number; tile?: string }
  | { type: "box"; min: V3; max: V3; color: number[]; reflectivity?: number };

export type Picture = {
  camera: { origin: V3; dir: V3; up: V3; fov: number; aspect: number; planeDistance: number };
  miss: number[];
  sun: V3;
  objects: SceneObject[];
  fovea: { x: number; y: number; fovea: number; falloff: number; period: number; block: number; still: boolean };
  track?: { half: number; count: number; samples: Float32Array };
  rain?: number;
};

const CURB_A = [0.91, 0.64, 0.13, 1];
const GRASS = [0.24, 0.38, 0.2, 1];
const WALL = [0.42, 0.44, 0.4, 1];
const WHITE = [0.92, 0.9, 0.84, 1];

let staticScene: SceneObject[] | null = null;
let builtFor = "";

export function trackObjects(): SceneObject[] {
  const id = course().id;
  if (staticScene && builtFor === id) return staticScene;
  const objects: SceneObject[] = [];
  objects.push({
    type: "shape",
    kind: "plane",
    a: [0, 0, 0],
    b: [0, 0, 1],
    color: GRASS,
    tile: "grass",
    reflectivity: 0.02,
  });
  const half = halfWidth();
  const posts = 18;
  for (let i = 0; i < posts; i++) {
    const u = i / posts;
    const p = pointAt(u);
    const [lx, ly] = leftNormal(p);
    const ox = p.x - lx * (half + 1.35);
    const oy = p.y - ly * (half + 1.35);
    const z = duneHeight(ox, oy);
    objects.push({
      type: "shape",
      kind: "capsule",
      a: [ox, oy, z],
      b: [ox, oy, z + 1.15],
      r: 0.16,
      color: i % 2 === 0 ? WALL : CURB_A,
      reflectivity: 0.08,
    });
  }
  const gate = pointAt(0);
  const [glx, gly] = leftNormal(gate);
  for (const side of [-1, 1]) {
    const x = gate.x + glx * side * (half + 0.9);
    const y = gate.y + gly * side * (half + 0.9);
    const z = duneHeight(x, y);
    objects.push({
      type: "shape",
      kind: "capsule",
      a: [x, y, z],
      b: [x, y, z + 3.3],
      r: 0.14,
      color: WHITE,
      reflectivity: 0.1,
    });
  }
  const left = [gate.x + glx * half, gate.y + gly * half] as const;
  const right = [gate.x - glx * half, gate.y - gly * half] as const;
  const barZ = Math.max(duneHeight(left[0], left[1]), duneHeight(right[0], right[1])) + 3.15;
  objects.push({
    type: "shape",
    kind: "capsule",
    a: [left[0], left[1], barZ],
    b: [right[0], right[1], barZ],
    r: 0.12,
    color: CURB_A,
    reflectivity: 0.12,
    tile: "metal",
  });
  builtFor = id;
  staticScene = objects;
  return objects;
}

export type DrawBody = {
  x: number;
  y: number;
  z?: number;
  yaw: number;
  pitch?: number;
  roll?: number;
  flame?: number;
  color: [number, number, number];
  face: FaceImage | null;
  name: string;
};

function axes(yaw: number, pitch: number, roll: number) {
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

function kartParts(body: DrawBody, faces: SceneObject[], rest: SceneObject[]) {
  const { x, y, yaw, color } = body;
  const pose = axes(yaw, body.pitch ?? 0, body.roll ?? 0);
  const fx = pose.fwd[0];
  const fy = pose.fwd[1];
  const fz = pose.fwd[2];
  const rx = pose.right[0];
  const ry = pose.right[1];
  const rz = pose.right[2];
  const ux = pose.up[0];
  const uy = pose.up[1];
  const uz = pose.up[2];
  const paint = [color[0], color[1], color[2], 1];
  const wheelR = 0.22;
  const cz = body.z ?? duneHeight(x, y) + 0.46;
  const at = (lx: number, ly: number, lz: number): [number, number, number] => [
    x + rx * lx + fx * ly + ux * lz,
    y + ry * lx + fy * ly + uy * lz,
    cz + rz * lx + fz * ly + uz * lz,
  ];
  faces.push({
    type: "sphere",
    origin: at(-0.05, 0, 0.56),
    radius: 0.46,
    color: [1, 1, 1, 1],
    reflectivity: 0.04,
    ...(body.face ? { texture: body.face } : {}),
  });
  const tail = at(0, -0.55, 0);
  const nose = at(0, 0.85, 0.06);
  rest.push({
    type: "shape",
    kind: "capsule",
    a: tail,
    b: nose,
    r: 0.32,
    color: paint,
    reflectivity: 0.18,
    tile: "metal",
  });
  rest.push({
    type: "sphere",
    origin: at(0, 0.95, 0.02),
    radius: 0.26,
    color: paint,
    reflectivity: 0.2,
  });
  const wheels: [number, number][] = [
    [0.46, 0.5],
    [-0.46, 0.5],
    [0.46, -0.42],
    [-0.46, -0.42],
  ];
  for (const [s, f] of wheels) {
    const spot = at(s, f, -0.28);
    if (pose.up[2] > 0.25) spot[2] = Math.max(spot[2], duneHeight(spot[0], spot[1]) + wheelR);
    rest.push({
      type: "sphere",
      origin: spot,
      radius: wheelR,
      color: [0.08, 0.08, 0.09, 1],
      reflectivity: 0.06,
    });
  }
  if ((body.flame ?? 0) > 0.5) {
    rest.push({
      type: "sphere",
      origin: at(0, -0.9, 0.02),
      radius: 0.16,
      color: [1, 0.45, 0.08, 1],
      reflectivity: 0.02,
    });
  }
}

/** Afternoon arc. Meridian walks a 72-minute day; a race stays in the lit half so the ribbon still reads. */
export function raceSun(seconds: number): V3 {
  const phase = seconds * 0.12;
  return [0.42 + Math.sin(phase) * 0.18, 0.2 + Math.cos(phase * 0.5) * 0.06, 0.78 + Math.sin(phase * 0.7) * 0.06];
}

export function buildPicture(
  bodies: DrawBody[],
  camera: { x: number; y: number; z: number; dir: V3 },
  width: number,
  height: number,
  still: boolean,
  sun: V3 = [0.45, 0.22, 0.86],
  rain = 0,
): Picture {
  const faces: SceneObject[] = [];
  const rest: SceneObject[] = [];
  for (const body of bodies) kartParts(body, faces, rest);
  return {
    camera: {
      origin: [camera.x, camera.y, camera.z],
      dir: camera.dir,
      up: [0, 0, 1],
      fov: 68,
      aspect: Math.max(0.5, width / Math.max(1, height)),
      planeDistance: 1,
    },
    miss: [0.45, 0.62, 0.82, 1],
    sun,
    objects: [...faces, ...rest, ...trackObjects()],
    track: { half: halfWidth(), count: 160, samples: trackRibbon(160) },
    rain,
    fovea: {
      x: 0.5,
      y: 0.42,
      fovea: 0.55,
      falloff: 1.05,
      // The trace size is the resolution. A blocky fovea never got sharper while the kart moved.
      period: 1,
      block: 0,
      still,
    },
  };
}

export function chaseCamera(
  kart: { x: number; y: number; yaw: number; speed: number; z?: number },
  lookAhead = 7.5,
  orbit: { yaw: number; pitch: number } = { yaw: 0, pitch: 0 },
) {
  const yaw = kart.yaw - orbit.yaw;
  const fx = Math.sin(yaw);
  const fy = Math.cos(yaw);
  const back = 8.2;
  const tx = kart.x + fx * lookAhead;
  const ty = kart.y + fy * lookAhead;
  const cx = kart.x - fx * back;
  const cy = kart.y - fy * back;
  const ride = kart.z ?? duneHeight(kart.x, kart.y) + 0.46;
  const aimZ = Math.max(duneHeight(tx, ty) + 0.4, ride + 0.35) + orbit.pitch * 2.4;
  const cz = Math.max(duneHeight(cx, cy) + 1.15, ride + 2.15 - orbit.pitch * 0.35);
  const dx = tx - cx;
  const dy = ty - cy;
  const dz = aimZ - cz;
  const len = Math.hypot(dx, dy, dz) || 1;
  return { x: cx, y: cy, z: cz, dir: [dx / len, dy / len, dz / len] as V3 };
}
