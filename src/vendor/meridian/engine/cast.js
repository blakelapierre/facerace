// @ts-nocheck
import { cross, dot, length } from "./math.js";
import { holdRayObjects, rayShapeRoot, raySphereRoot, shapeIsIndexed, visitRayTree, visitShapeTree } from "./octree.js";

export { holdRayObjects };

export function sphereRayIntersection(origin, direction, center, radius) {
  const ocx = center[0] - origin[0];
  const ocy = center[1] - origin[1];
  const ocz = center[2] - origin[2];
  const a = direction[0] * direction[0] + direction[1] * direction[1] + direction[2] * direction[2];
  if (a === 0) return null;
  const b = direction[0] * ocx + direction[1] * ocy + direction[2] * ocz;
  const c = ocx * ocx + ocy * ocy + ocz * ocz - radius * radius;
  const delta = b * b - a * c;
  if (delta < 0) return null;
  const root = Math.sqrt(delta);
  let t = (b - root) / a;
  if (t < 0) t = (b + root) / a;
  if (t < 0) return null;
  return {
    t,
    point: [
      origin[0] + direction[0] * t,
      origin[1] + direction[1] * t,
      origin[2] + direction[2] * t,
    ],
  };
}

function normalize(vector) {
  const n = length(vector) || 1;
  return [vector[0] / n, vector[1] / n, vector[2] / n];
}

export function cameraBasis(camera) {
  const forward = normalize(camera.dir);
  let up = camera.up ? camera.up.slice() : [0, 0, 1];
  const along = dot(up, forward);
  const lifted = [up[0] - forward[0] * along, up[1] - forward[1] * along, up[2] - forward[2] * along];
  if (length(lifted) < 1e-6) {
    const fallback = Math.abs(forward[2]) > 0.9 ? [0, 1, 0] : [0, 0, 1];
    const lean = dot(fallback, forward);
    up = normalize([
      fallback[0] - forward[0] * lean,
      fallback[1] - forward[1] * lean,
      fallback[2] - forward[2] * lean,
    ]);
  } else {
    up = normalize(lifted);
  }
  const right = [0, 0, 0];
  cross(right, forward, up);
  return { forward, right, up };
}

export function worldToScreen(point, camera) {
  const { forward, right, up } = cameraBasis(camera);
  const dx = point[0] - camera.origin[0];
  const dy = point[1] - camera.origin[1];
  const dz = point[2] - camera.origin[2];
  const depth = dx * forward[0] + dy * forward[1] + dz * forward[2];
  if (depth <= 0.05) return null;
  const half = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.planeDistance;
  const rx = dx * right[0] + dy * right[1] + dz * right[2];
  const uy = dx * up[0] + dy * up[1] + dz * up[2];
  const scale = camera.planeDistance / depth;
  return {
    x: (rx * scale / (camera.aspect * half) + 1) / 2,
    y: (1 - uy * scale / half) / 2,
  };
}

export function project(x, y, camera) {
  const half = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.planeDistance;
  const px = (x * 2 - 1) * camera.aspect * half;
  const py = (1 - y * 2) * half;
  const { forward, right, up } = cameraBasis(camera);
  const depth = camera.planeDistance;
  return [
    right[0] * px + up[0] * py + forward[0] * depth,
    right[1] * px + up[1] * py + forward[1] * depth,
    right[2] * px + up[2] * py + forward[2] * depth,
  ];
}

export function intersect(origin, direction, object) {
  if (object.type === "sphere") {
    const hit = sphereRayIntersection(origin, direction, object.origin, object.radius);
    if (!hit) return null;
    return { ...hit, object, color: object.color };
  }
  if (object.type === "box") return boxRayIntersection(origin, direction, object);
  if (object.type === "crust") return crustMarch(origin, direction, object.field);
  if (object.type === "shape") return shapeHit(origin, direction, object);
  return null;
}

export function boxRayIntersection(origin, direction, box) {
  let tMin = 0;
  let tMax = Infinity;
  const min = box.min;
  const max = box.max;
  for (let axis = 0; axis < 3; axis++) {
    const o = origin[axis];
    const d = direction[axis];
    if (Math.abs(d) < 1e-12) {
      if (o < min[axis] || o >= max[axis]) return null;
      continue;
    }
    let t1 = (min[axis] - o) / d;
    let t2 = (max[axis] - o) / d;
    if (t1 > t2) {
      const swap = t1;
      t1 = t2;
      t2 = swap;
    }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }
  if (tMax < 0) return null;
  const t = tMin >= 0 ? tMin : tMax;
  if (t < 0) return null;
  return {
    t,
    point: [
      origin[0] + direction[0] * t,
      origin[1] + direction[1] * t,
      origin[2] + direction[2] * t,
    ],
    object: box,
    color: box.color,
  };
}

export function crustMarch(origin, direction, field, maxDistance = 400) {
  let t = 0;
  for (let i = 0; i < 64; i++) {
    const p = [
      origin[0] + direction[0] * t,
      origin[1] + direction[1] * t,
      origin[2] + direction[2] * t,
    ];
    const sample = field.sampleMeters(p);
    if (sample <= 0) {
      return {
        t,
        point: p,
        object: { type: "crust" },
        color: p[2] < -0.3 ? [0.16, 0.13, 0.1, 1] : (field.color || [0.55, 0.48, 0.32, 1]),
      };
    }
    t += Math.max(sample, 0.05);
    if (t > maxDistance) return null;
  }
  return null;
}

function vsub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vadd(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function vscale(a, s) {
  return [a[0] * s, a[1] * s, a[2] * s];
}

function vdot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function vunit(a) {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
}

function vcross(u, v) {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
}

function shapeRecord(shape, t, point, normal) {
  return {
    t,
    point,
    normal: vunit(normal),
    object: shape,
    color: shape.color,
  };
}

function rayPlane(origin, direction, point, normal) {
  const denom = vdot(direction, normal);
  if (Math.abs(denom) < 1e-8) return null;
  const t = vdot(vsub(point, origin), normal) / denom;
  if (t < 0) return null;
  return { t, point: vadd(origin, vscale(direction, t)), normal: denom > 0 ? vscale(normal, -1) : normal.slice() };
}

function rayDisk(origin, direction, center, normal, radius) {
  const hit = rayPlane(origin, direction, center, normal);
  if (!hit) return null;
  const d = vsub(hit.point, center);
  if (vdot(d, d) > radius * radius) return null;
  return hit;
}

function raySolid(origin, direction, center, half) {
  let tmin = -1e30;
  let tmax = 1e30;
  let axis = 0;
  let sign = 1;
  for (let a = 0; a < 3; a++) {
    if (Math.abs(direction[a]) < 1e-8) {
      if (origin[a] < center[a] - half[a] || origin[a] > center[a] + half[a]) return null;
      continue;
    }
    const inv = 1 / direction[a];
    let t1 = (center[a] - half[a] - origin[a]) * inv;
    let t2 = (center[a] + half[a] - origin[a]) * inv;
    let s1 = -1;
    if (t1 > t2) {
      const swap = t1;
      t1 = t2;
      t2 = swap;
      s1 = 1;
    }
    if (t1 > tmin) {
      tmin = t1;
      axis = a;
      sign = s1;
    }
    if (t2 < tmax) tmax = t2;
    if (tmax < tmin) return null;
  }
  const t = tmin > 0 ? tmin : tmax;
  if (t < 0) return null;
  const normal = [0, 0, 0];
  normal[axis] = sign;
  if (vdot(normal, direction) > 0) normal[axis] = -normal[axis];
  return { t, point: vadd(origin, vscale(direction, t)), normal };
}

function sphereAt(origin, direction, center, radius) {
  const oc = vsub(origin, center);
  const b = vdot(direction, oc);
  const c0 = vdot(oc, oc) - radius * radius;
  const h = b * b - vdot(direction, direction) * c0;
  if (h < 0) return null;
  const s = Math.sqrt(h);
  const a = vdot(direction, direction) || 1;
  let t = (-b - s) / a;
  if (t < 0) t = (-b + s) / a;
  if (t < 0) return null;
  const point = vadd(origin, vscale(direction, t));
  return { t, point, normal: vsub(point, center) };
}

function rayRound(origin, direction, pa, pb, radius, capped) {
  const ba = vsub(pb, pa);
  const oc = vsub(origin, pa);
  const baba = vdot(ba, ba);
  const bard = vdot(ba, direction);
  const baoc = vdot(ba, oc);
  const k2 = baba - bard * bard;
  const k1 = baba * vdot(oc, direction) - baoc * bard;
  const k0 = baba * vdot(oc, oc) - baoc * baoc - radius * radius * baba;
  let best = null;
  const take = (hit) => {
    if (!hit || hit.t < 0) return;
    if (!best || hit.t < best.t) best = hit;
  };
  const h = k1 * k1 - k2 * k0;
  if (h >= 0 && Math.abs(k2) > 1e-8) {
    const s = Math.sqrt(h);
    const ts = [(-k1 - s) / k2, (-k1 + s) / k2];
    for (let i = 0; i < ts.length; i++) {
      const t = ts[i];
      const y = baoc + t * bard;
      if (t < 0 || y <= 0 || y >= baba) continue;
      const point = vadd(origin, vscale(direction, t));
      const normal = vsub(vadd(oc, vscale(direction, t)), vscale(ba, y / baba));
      take({ t, point, normal });
    }
  }
  if (!capped) {
    take(sphereAt(origin, direction, pa, radius));
    take(sphereAt(origin, direction, pb, radius));
  } else if (baba > 1e-8) {
    const axis = vunit(ba);
    take(rayDisk(origin, direction, pa, vscale(axis, -1), radius));
    take(rayDisk(origin, direction, pb, axis, radius));
  }
  return best;
}

function rayTri(origin, direction, a, b, c) {
  const e1 = vsub(b, a);
  const e2 = vsub(c, a);
  const pvec = vcross(direction, e2);
  const det = vdot(e1, pvec);
  if (Math.abs(det) < 1e-8) return null;
  const inv = 1 / det;
  const tvec = vsub(origin, a);
  const u = vdot(tvec, pvec) * inv;
  if (u < 0 || u > 1) return null;
  const qvec = vcross(tvec, e1);
  const v = vdot(direction, qvec) * inv;
  if (v < 0 || u + v > 1) return null;
  const t = vdot(e2, qvec) * inv;
  if (t < 0) return null;
  let normal = vunit(vcross(e1, e2));
  if (vdot(normal, direction) > 0) normal = vscale(normal, -1);
  return { t, point: vadd(origin, vscale(direction, t)), normal };
}

export function shapeHit(origin, direction, shape) {
  const kind = shape.kind;
  let hit = null;
  if (kind === "plane") hit = rayPlane(origin, direction, shape.a, shape.b);
  else if (kind === "disk") hit = rayDisk(origin, direction, shape.a, shape.b, shape.r);
  else if (kind === "box") hit = raySolid(origin, direction, shape.a, shape.b);
  else if (kind === "capsule") hit = rayRound(origin, direction, shape.a, shape.b, shape.r, false);
  else if (kind === "cylinder") hit = rayRound(origin, direction, shape.a, shape.b, shape.r, true);
  else if (kind === "triangle") hit = rayTri(origin, direction, shape.a, shape.b, shape.c);
  if (!hit) return null;
  return shapeRecord(shape, hit.t, hit.point, hit.normal);
}

export function cast(origin, direction, objects, miss = [0, 0, 0, 1]) {
  let best = null;
  const root = raySphereRoot(objects);
  if (root >= 0) {
    best = visitRayTree(origin, direction, root, (object) => {
      const hit = sphereRayIntersection(origin, direction, object.origin, object.radius);
      if (!hit) return null;
      return { ...hit, object, color: object.color };
    });
  }
  const shapeRoot = rayShapeRoot(objects);
  if (shapeRoot >= 0) {
    const shaped = visitShapeTree(origin, direction, shapeRoot, (object) => shapeHit(origin, direction, object));
    if (shaped && (!best || shaped.t < best.t)) best = shaped;
  }
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    if (root >= 0 && object.type === "sphere") continue;
    if (shapeRoot >= 0 && shapeIsIndexed(object)) continue;
    const hit = intersect(origin, direction, object);
    if (!hit) continue;
    if (!best || hit.t < best.t) best = hit;
  }
  if (!best) return { t: Infinity, color: miss, object: null, point: null };
  return best;
}

export const REFLECTION_STEPS = 4;
const REFLECT_BIAS = 0.05;

function hitNormal(hit) {
  if (hit.normal) return hit.normal;
  const object = hit.object;
  if (!object || !hit.point) return [0, 0, 1];
  if (object.type === "sphere") {
    return normalize([
      hit.point[0] - object.origin[0],
      hit.point[1] - object.origin[1],
      hit.point[2] - object.origin[2],
    ]);
  }
  if (object.type === "box") {
    const center = [
      (object.min[0] + object.max[0]) * 0.5,
      (object.min[1] + object.max[1]) * 0.5,
      (object.min[2] + object.max[2]) * 0.5,
    ];
    const extent = [
      Math.max(object.max[0] - object.min[0], 0.001) * 0.5,
      Math.max(object.max[1] - object.min[1], 0.001) * 0.5,
      Math.max(object.max[2] - object.min[2], 0.001) * 0.5,
    ];
    const q = [
      (hit.point[0] - center[0]) / extent[0],
      (hit.point[1] - center[1]) / extent[1],
      (hit.point[2] - center[2]) / extent[2],
    ];
    const ax = Math.abs(q[0]);
    const ay = Math.abs(q[1]);
    const az = Math.abs(q[2]);
    if (ax > ay && ax > az) return [Math.sign(q[0]) || 1, 0, 0];
    if (ay > az) return [0, Math.sign(q[1]) || 1, 0];
    return [0, 0, Math.sign(q[2]) || 1];
  }
  return [0, 0, 1];
}

function reflectDirection(direction, normal) {
  const along = dot(direction, normal);
  return normalize([
    direction[0] - 2 * along * normal[0],
    direction[1] - 2 * along * normal[1],
    direction[2] - 2 * along * normal[2],
  ]);
}

export function traceColor(origin, direction, objects, miss = [0, 0, 0, 1], stepsLeft = REFLECTION_STEPS) {
  const hit = cast(origin, direction, objects, miss);
  const color = hit.color || miss;
  const reflectivity = stepsLeft > 0 ? Math.min(1, Math.max(0, hit.object?.reflectivity || 0)) : 0;
  if (!hit.object || reflectivity <= 0) return color;
  const normal = hitNormal(hit);
  const bounced = traceColor(
    [
      hit.point[0] + normal[0] * REFLECT_BIAS,
      hit.point[1] + normal[1] * REFLECT_BIAS,
      hit.point[2] + normal[2] * REFLECT_BIAS,
    ],
    reflectDirection(direction, normal),
    objects,
    miss,
    stepsLeft - 1,
  );
  const keep = 1 - reflectivity;
  return [
    color[0] * keep + bounced[0] * reflectivity,
    color[1] * keep + bounced[1] * reflectivity,
    color[2] * keep + bounced[2] * reflectivity,
    color[3] ?? 1,
  ];
}

export function bodiesToObjects(bodies) {
  return bodies.map((body) => ({
    type: "sphere",
    origin: body.position,
    radius: body.size,
    color: [
      body.color[0] / 255,
      body.color[1] / 255,
      body.color[2] / 255,
      body.color[3] > 1 ? body.color[3] / 255 : body.color[3],
    ],
    reflectivity: body.reflectivity || 0,
    body,
  }));
}
