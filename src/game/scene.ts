import type { FaceImage } from "./faces";
import type { Kart } from "./sim";
import { HALF_W, LAP_LEN, RADIUS, STRAIGHT, leftNormal, pointAt } from "./track";

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
};

const ASPHALT = [0.2, 0.21, 0.22, 1];
const CURB_A = [0.91, 0.64, 0.13, 1];
const CURB_B = [0.93, 0.9, 0.84, 1];
const GRASS = [0.24, 0.38, 0.2, 1];
const INFIELD = [0.16, 0.28, 0.16, 1];
const WALL = [0.42, 0.44, 0.4, 1];
const WHITE = [0.92, 0.9, 0.84, 1];

function tri(a: V3, b: V3, c: V3, color: number[]): SceneObject {
  return { type: "shape", kind: "triangle", a, b, c, color, reflectivity: 0.02 };
}

function ribbon(u0: number, u1: number, inner: number, outer: number, z: number, color: number[]): SceneObject[] {
  const p0 = pointAt(u0);
  const p1 = pointAt(u1);
  const [l0x, l0y] = leftNormal(p0);
  const [l1x, l1y] = leftNormal(p1);
  const a: V3 = [p0.x + l0x * inner, p0.y + l0y * inner, z];
  const b: V3 = [p0.x + l0x * outer, p0.y + l0y * outer, z];
  const c: V3 = [p1.x + l1x * outer, p1.y + l1y * outer, z];
  const d: V3 = [p1.x + l1x * inner, p1.y + l1y * inner, z];
  return [tri(a, b, c, color), tri(a, c, d, color)];
}

let staticScene: SceneObject[] | null = null;

export function trackObjects(): SceneObject[] {
  if (staticScene) return staticScene;
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
  objects.push({
    type: "shape",
    kind: "disk",
    a: [0, 0, 0.02],
    b: [0, 0, 1],
    r: RADIUS - HALF_W + 0.4,
    color: INFIELD,
    tile: "grass",
    reflectivity: 0.02,
  });
  const half = HALF_W;
  const z0 = 0;
  const z1 = 0.07;
  objects.push({
    type: "box",
    min: [-STRAIGHT / 2, -RADIUS - half, z0],
    max: [STRAIGHT / 2, -RADIUS + half, z1],
    color: ASPHALT,
    reflectivity: 0.04,
  });
  objects.push({
    type: "box",
    min: [-STRAIGHT / 2, RADIUS - half, z0],
    max: [STRAIGHT / 2, RADIUS + half, z1],
    color: ASPHALT,
    reflectivity: 0.04,
  });
  const segs = 18;
  const arcU = (Math.PI * RADIUS) / LAP_LEN;
  const straightU = STRAIGHT / LAP_LEN;
  const halfStraightU = straightU * 0.5;
  const right0 = halfStraightU;
  const left0 = halfStraightU + arcU + straightU;
  const road: [number, number][] = [];
  for (const start of [right0, left0]) {
    for (let i = 0; i < segs; i++) road.push([start + (arcU * i) / segs, start + (arcU * (i + 1)) / segs]);
  }
  for (const [u0, u1] of road) objects.push(...ribbon(u0, u1, half, -half, 0.045, ASPHALT));
  const curbSpans: [number, number][] = [...road];
  const pieces = 8;
  for (let i = 0; i < pieces; i++) {
    const f0 = (halfStraightU * i) / pieces;
    const f1 = (halfStraightU * (i + 1)) / pieces;
    curbSpans.push([f0, f1], [1 - halfStraightU + f0, 1 - halfStraightU + f1]);
    const top = halfStraightU + arcU;
    curbSpans.push([top + (straightU * i) / pieces, top + (straightU * (i + 1)) / pieces]);
  }
  curbSpans.forEach(([u0, u1], i) => {
    const curb = i % 2 === 0 ? CURB_A : CURB_B;
    objects.push(...ribbon(u0, u1, half, half + 0.55, 0.05, curb));
    objects.push(...ribbon(u0, u1, -half - 0.55, -half, 0.05, curb));
  });
  const posts = 28;
  for (let i = 0; i < posts; i++) {
    const u = i / posts;
    const p = pointAt(u);
    const [lx, ly] = leftNormal(p);
    const ox = p.x - lx * (half + 0.7);
    const oy = p.y - ly * (half + 0.7);
    objects.push({
      type: "shape",
      kind: "capsule",
      a: [ox, oy, 0],
      b: [ox, oy, 1.25],
      r: 0.22,
      color: i % 2 === 0 ? WALL : CURB_A,
      reflectivity: 0.08,
    });
  }
  objects.push({
    type: "box",
    min: [-0.35, -RADIUS - half, 0.08],
    max: [0.35, -RADIUS + half, 0.12],
    color: WHITE,
    reflectivity: 0.05,
  });
  for (const side of [-1, 1]) {
    const y = -RADIUS + side * (half + 0.2);
    objects.push({
      type: "shape",
      kind: "capsule",
      a: [0, y, 0],
      b: [0, y, 3.4],
      r: 0.16,
      color: WHITE,
      reflectivity: 0.1,
    });
  }
  objects.push({
    type: "shape",
    kind: "capsule",
    a: [0, -RADIUS - half, 3.2],
    b: [0, -RADIUS + half, 3.2],
    r: 0.14,
    color: CURB_A,
    reflectivity: 0.12,
    tile: "metal",
  });
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
  faces.push({
    type: "sphere",
    origin: [x - rx * 0.05, y - ry * 0.05, 1.12],
    radius: 0.46,
    color: [1, 1, 1, 1],
    reflectivity: 0.04,
    ...(body.face ? { texture: body.face } : {}),
  });
  rest.push({
    type: "shape",
    kind: "capsule",
    a: [x - fx * 0.55, y - fy * 0.55, 0.42],
    b: [x + fx * 0.85, y + fy * 0.85, 0.48],
    r: 0.38,
    color: paint,
    reflectivity: 0.18,
    tile: "metal",
  });
  rest.push({
    type: "sphere",
    origin: [x + fx * 0.95, y + fy * 0.95, 0.42],
    radius: 0.28,
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
    rest.push({
      type: "sphere",
      origin: [x + fx * f + rx * s, y + fy * f + ry * s, 0.22],
      radius: 0.2,
      color: [0.08, 0.08, 0.09, 1],
      reflectivity: 0.06,
    });
  }
}

export function buildPicture(
  bodies: DrawBody[],
  camera: { x: number; y: number; z: number; dir: V3 },
  width: number,
  height: number,
  still: boolean,
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
    sun: [0.45, 0.22, 0.86],
    objects: [...faces, ...rest, ...trackObjects()],
    fovea: { x: 0.5, y: 0.42, fovea: 0.55, falloff: 0.9, period: 1, block: 0, still },
  };
}

export function chaseCamera(kart: Pick<Kart, "x" | "y" | "yaw" | "speed">, lookAhead = 7.5) {
  const fx = Math.sin(kart.yaw);
  const fy = Math.cos(kart.yaw);
  const back = 8.2;
  const eye = 3.15;
  const tx = kart.x + fx * lookAhead;
  const ty = kart.y + fy * lookAhead;
  const cx = kart.x - fx * back;
  const cy = kart.y - fy * back;
  const cz = eye + Math.abs(kart.speed) * 0.02;
  const dx = tx - cx;
  const dy = ty - cy;
  const dz = 1.05 - cz;
  const len = Math.hypot(dx, dy, dz) || 1;
  return { x: cx, y: cy, z: cz, dir: [dx / len, dy / len, dz / len] as V3 };
}
