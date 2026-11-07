// @ts-nocheck
import { cast, holdRayObjects, project, traceColor } from "./cast.js";

export function paintFrame(scene, width, height, buffer) {
  return holdRayObjects(scene.objects, () => paintHeld(scene, width, height, buffer, 0, height));
}

export function paintRows(scene, width, height, y0, y1, buffer) {
  return holdRayObjects(scene.objects, () => paintHeld(scene, width, height, buffer, y0, y1));
}

function paintHeld(scene, width, height, buffer, y0, y1) {
  const pixels = buffer ?? new Uint8ClampedArray(width * height * 4);
  const miss = scene.miss || [0, 0, 0, 1];
  const stop = Math.min(height, y1);
  for (let y = y0; y < stop; y++) {
    const v = (y + 0.5) / height;
    let i = y * width * 4;
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      const direction = project(u, v, scene.camera);
      const hit = cast(scene.camera.origin, direction, scene.objects, miss);
      const color = shade(scene, hit, miss, direction);
      pixels[i++] = color[0] * 255;
      pixels[i++] = color[1] * 255;
      pixels[i++] = color[2] * 255;
      pixels[i++] = color[3] * 255;
    }
  }
  return pixels;
}

function shade(scene, hit, miss, direction) {
  let color = hit.color || miss;
  if (scene.sun && hit.object && hit.point) {
    const origin = [
      hit.point[0] + scene.sun[0] * 0.08,
      hit.point[1] + scene.sun[1] * 0.08,
      hit.point[2] + scene.sun[2] * 0.08,
    ];
    const blocked = cast(origin, scene.sun, scene.objects, miss);
    if (blocked.object && blocked.t <= 80) {
      color = [color[0] * 0.45, color[1] * 0.45, color[2] * 0.45, color[3]];
    }
  }
  const reflectivity = Math.min(1, Math.max(0, hit.object?.reflectivity || 0));
  if (reflectivity <= 0 || !direction || !hit.point) return color;
  const normal = hit.normal
    ? hit.normal
    : hit.object.type === "sphere"
      ? [
        hit.point[0] - hit.object.origin[0],
        hit.point[1] - hit.object.origin[1],
        hit.point[2] - hit.object.origin[2],
      ]
      : [0, 0, 1];
  const len = Math.hypot(normal[0], normal[1], normal[2]) || 1;
  const unit = [normal[0] / len, normal[1] / len, normal[2] / len];
  const along = direction[0] * unit[0] + direction[1] * unit[1] + direction[2] * unit[2];
  const reflected = [
    direction[0] - 2 * along * unit[0],
    direction[1] - 2 * along * unit[1],
    direction[2] - 2 * along * unit[2],
  ];
  const bounced = traceColor(
    [
      hit.point[0] + unit[0] * 0.05,
      hit.point[1] + unit[1] * 0.05,
      hit.point[2] + unit[2] * 0.05,
    ],
    reflected,
    scene.objects,
    miss,
    3,
  );
  const keep = 1 - reflectivity;
  return [
    color[0] * keep + bounced[0] * reflectivity,
    color[1] * keep + bounced[1] * reflectivity,
    color[2] * keep + bounced[2] * reflectivity,
    color[3] ?? 1,
  ];
}
