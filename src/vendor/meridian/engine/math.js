// @ts-nocheck
export function add(r, u, v) {
  r[0] = u[0] + v[0];
  r[1] = u[1] + v[1];
  r[2] = u[2] + v[2];
  return r;
}

export function sub(r, u, v) {
  r[0] = u[0] - v[0];
  r[1] = u[1] - v[1];
  r[2] = u[2] - v[2];
  return r;
}

export function scale(r, v, s) {
  r[0] = v[0] * s;
  r[1] = v[1] * s;
  r[2] = v[2] * s;
  return r;
}

export function dot(u, v) {
  return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

export function cross(r, u, v) {
  const x = u[1] * v[2] - u[2] * v[1];
  const y = u[2] * v[0] - u[0] * v[2];
  const z = u[0] * v[1] - u[1] * v[0];
  r[0] = x;
  r[1] = y;
  r[2] = z;
  return r;
}

export function length(v) {
  return Math.hypot(v[0], v[1], v[2]);
}

export function clone3(v) {
  return [v[0], v[1], v[2]];
}
