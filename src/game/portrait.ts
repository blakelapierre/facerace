type Sphere = { x: number; y: number; z: number; r: number; color: [number, number, number] };

function hit(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, sphere: Sphere) {
  const lx = ox - sphere.x;
  const ly = oy - sphere.y;
  const lz = oz - sphere.z;
  const b = lx * dx + ly * dy + lz * dz;
  const c = lx * lx + ly * ly + lz * lz - sphere.r * sphere.r;
  const disc = b * b - c;
  if (disc < 0) return 0;
  const t = -b - Math.sqrt(disc);
  return t > 0.02 ? t : 0;
}

/** A tiny sphere picture of a mechanic or a kart. */
export function paintPortrait(
  ctx: CanvasRenderingContext2D,
  kind: "mechanic" | "kart",
  tint: [number, number, number],
  time: number,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const image = ctx.createImageData(w, h);
  const data = image.data;
  const yaw = kind === "kart" ? time * 0.7 : 0.4 + Math.sin(time * 0.6) * 0.15;
  const bob = Math.sin(time * 2.2) * 0.08;
  const arm = Math.sin(time * 3) * 0.35;
  const fx = Math.sin(yaw);
  const fy = Math.cos(yaw);
  const rx = Math.cos(yaw);
  const ry = -Math.sin(yaw);
  const place = (x: number, y: number, z: number, r: number, color: [number, number, number]): Sphere => ({
    x: rx * x + fx * y,
    y: ry * x + fy * y,
    z: z + bob,
    r,
    color,
  });
  const spheres: Sphere[] =
    kind === "mechanic"
      ? [
          place(0, 0, 0.15, 0.34, tint),
          place(0, 0, 0.72, 0.24, [0.93, 0.76, 0.62]),
          place(-0.38, arm, 0.35, 0.1, tint),
          place(0.38, -arm, 0.35, 0.1, tint),
          place(-0.12, 0, -0.28, 0.08, [0.15, 0.12, 0.1]),
          place(0.12, 0, -0.28, 0.08, [0.15, 0.12, 0.1]),
        ]
      : [
          place(0, 0, 0.05, 0.28, tint),
          place(0, 0.42, 0.08, 0.16, tint),
          place(0, -0.05, 0.38, 0.18, [0.9, 0.74, 0.6]),
          place(0.28, 0.28, -0.12, 0.1, [0.08, 0.08, 0.09]),
          place(-0.28, 0.28, -0.12, 0.1, [0.08, 0.08, 0.09]),
          place(0.28, -0.24, -0.12, 0.1, [0.08, 0.08, 0.09]),
          place(-0.28, -0.24, -0.12, 0.1, [0.08, 0.08, 0.09]),
        ];
  const sun = [0.35, 0.25, 0.9];
  const sl = Math.hypot(...sun) || 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ndcX = (x / w) * 2 - 1;
      const ndcY = 1 - (y / h) * 2;
      let dx = ndcX * 0.85;
      let dy = 0.95;
      let dz = ndcY * 0.7 + 0.05;
      const len = Math.hypot(dx, dy, dz) || 1;
      dx /= len;
      dy /= len;
      dz /= len;
      const ox = 0;
      const oy = -2.1;
      const oz = 0.7;
      let best = 8;
      let color = y < h * 0.62 ? [0.55, 0.72, 0.86] : [0.45, 0.36, 0.22];
      for (const sphere of spheres) {
        const t = hit(ox, oy, oz, dx, dy, dz, sphere);
        if (t <= 0 || t >= best) continue;
        best = t;
        const nx = ox + dx * t - sphere.x;
        const ny = oy + dy * t - sphere.y;
        const nz = oz + dz * t - sphere.z;
        const nl = Math.hypot(nx, ny, nz) || 1;
        const light = 0.35 + 0.7 * Math.max(0, (nx / nl) * sun[0] + (ny / nl) * sun[1] + (nz / nl) * (sun[2] / sl));
        color = [sphere.color[0] * light, sphere.color[1] * light, sphere.color[2] * light];
      }
      const i = (y * w + x) * 4;
      data[i] = Math.max(0, Math.min(255, color[0] * 255));
      data[i + 1] = Math.max(0, Math.min(255, color[1] * 255));
      data[i + 2] = Math.max(0, Math.min(255, color[2] * 255));
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}
