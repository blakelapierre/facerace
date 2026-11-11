import type { FaceImage } from "./faces";
import type { Kart } from "./sim";
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
  yaw: number;
  color: [number, number, number];
  face: FaceImage | null;
  name: string;
};

function kartParts(body: DrawBody, faces: SceneObject[], rest: SceneObject[]) {
  const { x, y, yaw, color } = body;
  const fx = Math.sin(yaw);
  const fy = Math.cos(yaw);
  const rx = Math.cos(yaw);
  const ry = -Math.sin(yaw);
  const paint = [color[0], color[1], color[2], 1];
  const wheelR = 0.22;
  const ground = duneHeight(x, y);
  faces.push({
    type: "sphere",
    origin: [x - rx * 0.05, y - ry * 0.05, ground + 1.02],
    radius: 0.46,
    color: [1, 1, 1, 1],
    reflectivity: 0.04,
    ...(body.face ? { texture: body.face } : {}),
  });
  rest.push({
    type: "shape",
    kind: "capsule",
    a: [x - fx * 0.55, y - fy * 0.55, ground + 0.46],
    b: [x + fx * 0.85, y + fy * 0.85, ground + 0.52],
    r: 0.32,
    color: paint,
    reflectivity: 0.18,
    tile: "metal",
  });
  rest.push({
    type: "sphere",
    origin: [x + fx * 0.95, y + fy * 0.95, ground + 0.48],
    radius: 0.26,
    color: paint,
    reflectivity: 0.2,
  });
  const wheels: [number, number][] = [
    [0.55, 0.48],
    [0.55, -0.48],
    [-0.5, 0.48],
    [-0.5, -0.48],
  ];
  for (const [f, s] of wheels) {
    const wx = x + fx * f + rx * s;
    const wy = y + fy * f + ry * s;
    rest.push({
      type: "sphere",
      origin: [wx, wy, duneHeight(wx, wy) + wheelR],
      radius: wheelR,
      color: [0.08, 0.08, 0.09, 1],
      reflectivity: 0.06,
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
  kart: Pick<Kart, "x" | "y" | "yaw" | "speed">,
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
  const ground = duneHeight(kart.x, kart.y);
  const aimZ = duneHeight(tx, ty) + 1.15 + orbit.pitch * 2.4;
  const cz = Math.max(duneHeight(cx, cy) + 1.2, ground + 2.35 - orbit.pitch * 0.35);
  const dx = tx - cx;
  const dy = ty - cy;
  const dz = aimZ - cz;
  const len = Math.hypot(dx, dy, dz) || 1;
  return { x: cx, y: cy, z: cz, dir: [dx / len, dy / len, dz / len] as V3 };
}
