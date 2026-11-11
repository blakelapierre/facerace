import { halfWidth, setCourseById, trackRibbon } from "./track";

type Frame = {
  bodies: { x: number; y: number; color: [number, number, number] }[];
  camera: { x: number; y: number; z: number; dir: [number, number, number] };
  sun: [number, number, number];
  course?: string;
};

const VERT = `#version 300 es
in vec2 a;
out vec2 vUv;
void main() {
  vUv = a * 0.5 + 0.5;
  gl_Position = vec4(a, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec3 uCam;
uniform vec3 uFwd;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uSun;
uniform float uFov;
uniform float uAspect;
uniform float uRoad;
uniform vec4 uTrack[48];
uniform vec4 uPos[8];
uniform vec3 uTint[8];
uniform int uKarts;

float heightAt(vec2 p) {
  float roll = 0.5 * sin(p.x * 0.15) + 0.5 * cos(p.y * 0.13);
  float wash = 0.5 * sin((p.x + p.y) * 0.17 + 1.3) + 0.5;
  float n = clamp(0.55 * roll + 0.45 * wash, 0.0, 1.0);
  float broad = 0.5 + 0.5 * sin(p.x * 0.021 + 0.6) * cos(p.y * 0.018);
  float h = n * n * 5.4 * (0.78 + 0.22 * broad);
  float d = length(p - vec2(-40.0, 160.0));
  float u = d / 104.0;
  if (u < 1.0) {
    float s = 1.0 - u;
    h += 36.0 * s * s * (3.0 - 2.0 * s);
  }
  d = length(p - vec2(-155.0, -55.0));
  u = d / 72.0;
  if (u < 1.0) {
    float s = 1.0 - u;
    h += 30.0 * s * s * (3.0 - 2.0 * s);
  }
  if (d < 14.0) h -= (1.0 - d / 14.0) * 12.0;
  if (length(p - vec2(70.0, 96.0)) < 14.0) h = 2.05;
  return h;
}

float nearest(vec2 p) {
  float best = 200.0;
  for (int i = 0; i < 48; i++) best = min(best, length(p - uTrack[i].xy));
  return best;
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  float tanHalf = tan(uFov * 0.5);
  vec3 rd = normalize(uFwd + uRight * (ndc.x * tanHalf * uAspect) + uUp * (ndc.y * tanHalf));
  vec3 sun = normalize(uSun);
  float best = 400.0;
  vec3 rgb = vec3(0.0);
  bool hit = false;
  for (int i = 0; i < 8; i++) {
    if (i >= uKarts) break;
    vec3 center = vec3(uPos[i].xy, heightAt(uPos[i].xy) + 0.85);
    vec3 oc = uCam - center;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - 0.9;
    float disc = b * b - c;
    if (disc > 0.0) {
      float t = -b - sqrt(disc);
      if (t > 0.2 && t < best) {
        best = t;
        vec3 n = normalize(uCam + rd * t - center);
        float light = 0.35 + 0.65 * max(dot(n, sun), 0.0);
        rgb = uTint[i] * light;
        hit = true;
      }
    }
  }
  float t = 1.0;
  float ground = -1.0;
  for (int i = 0; i < 14; i++) {
    vec3 p = uCam + rd * t;
    if (p.z < heightAt(p.xy)) {
      ground = t;
      break;
    }
    t += 1.5 + float(i) * 1.35;
    if (t > 220.0) break;
  }
  if (ground > 0.0 && ground < best) {
    float lo = max(ground - 6.0, 0.2);
    float hi = ground;
    for (int i = 0; i < 5; i++) {
      float mid = 0.5 * (lo + hi);
      vec3 p = uCam + rd * mid;
      if (p.z < heightAt(p.xy)) hi = mid;
      else lo = mid;
    }
    vec3 p = uCam + rd * hi;
    float h = heightAt(p.xy);
    float road = nearest(p.xy);
    vec3 n = normalize(vec3(heightAt(p.xy + vec2(0.8, 0.0)) - h, heightAt(p.xy + vec2(0.0, 0.8)) - h, 0.8));
    float light = 0.42 + 0.58 * max(dot(n, sun), 0.0);
    vec3 sand = vec3(0.62, 0.48, 0.22);
    vec3 grass = vec3(0.28, 0.38, 0.18);
    vec3 rock = vec3(0.42, 0.36, 0.30);
    vec3 albedo = mix(grass, sand, smoothstep(1.2, 4.5, h));
    if (h > 12.0) albedo = mix(albedo, rock, smoothstep(12.0, 24.0, h));
    if (length(p.xy - vec2(70.0, 96.0)) < 14.0) albedo = vec3(0.15, 0.32, 0.38);
    if (road < uRoad) {
      albedo = vec3(0.12, 0.12, 0.13);
      if (road > uRoad - 0.7) albedo = vec3(0.75, 0.22, 0.12);
    }
    float fog = smoothstep(40.0, 160.0, hi);
    rgb = mix(albedo * light, vec3(0.62, 0.72, 0.82), fog);
    hit = true;
  }
  if (!hit) {
    float up = clamp(rd.z * 0.9 + 0.15, 0.0, 1.0);
    rgb = mix(vec3(0.86, 0.72, 0.48), vec3(0.42, 0.62, 0.86), up);
    rgb += vec3(1.0, 0.92, 0.7) * pow(max(dot(rd, sun), 0.0), 48.0);
  }
  fragColor = vec4(rgb, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "shader";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

export function createLitePainter(canvas: OffscreenCanvas) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "a");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const track = new Float32Array(48 * 4);
  const karts = new Float32Array(8 * 4);
  let courseId = "";
  let road = 8;
  const loc = (name: string) => gl.getUniformLocation(program, name);
  const loadCourse = (id?: string) => {
    if (id && id !== courseId) {
      setCourseById(id);
      courseId = id;
    }
    const ribbon = trackRibbon(48);
    track.fill(9999);
    let step = 0;
    const count = Math.min(48, ribbon.length / 4);
    for (let i = 0; i < count; i++) {
      track[i * 4] = ribbon[i * 4]!;
      track[i * 4 + 1] = ribbon[i * 4 + 1]!;
      const j = (i + 1) % count;
      step = Math.max(step, Math.hypot(ribbon[i * 4]! - ribbon[j * 4]!, ribbon[i * 4 + 1]! - ribbon[j * 4 + 1]!));
    }
    road = halfWidth() + step * 0.55;
  };
  loadCourse();
  return {
    paint(frame: Frame) {
      loadCourse(frame.course);
      const fwd = frame.camera.dir;
      const rx = fwd[1];
      const ry = -fwd[0];
      const rlen = Math.hypot(rx, ry) || 1;
      const right: [number, number, number] = [rx / rlen, ry / rlen, 0];
      const up: [number, number, number] = [
        right[1] * fwd[2] - right[2] * fwd[1],
        right[2] * fwd[0] - right[0] * fwd[2],
        right[0] * fwd[1] - right[1] * fwd[0],
      ];
      karts.fill(0);
      const tint = new Float32Array(8 * 3);
      const n = Math.min(8, frame.bodies.length);
      for (let i = 0; i < n; i++) {
        const body = frame.bodies[i]!;
        karts[i * 4] = body.x;
        karts[i * 4 + 1] = body.y;
        tint[i * 3] = body.color[0];
        tint[i * 3 + 1] = body.color[1];
        tint[i * 3 + 2] = body.color[2];
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.uniform3f(loc("uCam"), frame.camera.x, frame.camera.y, frame.camera.z);
      gl.uniform3f(loc("uFwd"), fwd[0], fwd[1], fwd[2]);
      gl.uniform3f(loc("uRight"), right[0], right[1], right[2]);
      gl.uniform3f(loc("uUp"), up[0], up[1], up[2]);
      gl.uniform3f(loc("uSun"), frame.sun[0], frame.sun[1], frame.sun[2]);
      gl.uniform1f(loc("uFov"), (68 * Math.PI) / 180);
      gl.uniform1f(loc("uAspect"), canvas.width / Math.max(1, canvas.height));
      gl.uniform1f(loc("uRoad"), road);
      gl.uniform4fv(loc("uTrack"), track);
      gl.uniform4fv(loc("uPos"), karts);
      gl.uniform3fv(loc("uTint"), tint);
      gl.uniform1i(loc("uKarts"), n);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.finish();
    },
  };
}
