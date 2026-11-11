import { duneHeight } from "./terrain";
import { halfWidth, leftNormal, pointAt, setCourseById, trackRibbon } from "./track";

type Frame = {
  bodies: { x: number; y: number; z?: number; yaw?: number; pitch?: number; roll?: number; flame?: number; seed?: number; color: [number, number, number] }[];
  camera: { x: number; y: number; z: number; dir: [number, number, number] };
  sun: [number, number, number];
  course?: string;
  skids?: { x: number; y: number; x2: number; y2: number }[];
  rails?: { x: number; y: number; x2: number; y2: number; hp: number }[];
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
uniform vec4 uTrack[64];
uniform vec4 uPos[12];
uniform vec3 uTint[12];
uniform float uSlot[12];
uniform vec4 uLean[12];
uniform vec4 uSkid[40];
uniform int uSkids;
uniform int uKarts;
uniform vec4 uGate[8];
uniform vec4 uRail[16];
uniform float uHp[16];
uniform int uRails;
uniform sampler2D uFace;

float heightAt(vec2 p) {
  float roll = 0.5 * sin(p.x * 0.15) + 0.5 * cos(p.y * 0.13);
  float wash = 0.5 * sin((p.x + p.y) * 0.17 + 1.3) + 0.5;
  float n = clamp(0.55 * roll + 0.45 * wash, 0.0, 1.0);
  float broad = 0.5 + 0.5 * sin(p.x * 0.021 + 0.6) * cos(p.y * 0.018);
  float h = n * n * 5.4 * (0.78 + 0.22 * broad);
  float marsh = exp(-((p.x - 36.0) * (p.x - 36.0) + (p.y + 96.0) * (p.y + 96.0)) / 2200.0);
  h *= 1.0 - marsh * 0.55;
  float ridge = exp(-(p.x + 24.0) * (p.x + 24.0) / 520.0) * max(0.0, cos(p.y * 0.02));
  h = clamp(h + ridge * 1.6, 0.0, 5.4);
  float d = length(p - vec2(-40.0, 160.0));
  float wobble = 0.92 + 0.08 * sin(p.x * 0.05 + 160.0) * cos(p.y * 0.04);
  float u = d / (104.0 * wobble);
  if (u < 1.0) {
    float s = 1.0 - u;
    h += 36.0 * s * s * (3.0 - 2.0 * s);
  }
  d = length(p - vec2(-155.0, -55.0));
  wobble = 0.92 + 0.08 * sin(p.x * 0.05 - 55.0) * cos(p.y * 0.04);
  u = d / (72.0 * wobble);
  if (u < 1.0) {
    float s = 1.0 - u;
    h += 30.0 * s * s * (3.0 - 2.0 * s);
  }
  if (d < 14.0) h -= (1.0 - d / 14.0) * 12.0;
  float r = length(p - vec2(70.0, 96.0));
  float rl = 14.0 * (0.94 + 0.06 * sin(p.x * 0.21));
  if (r < rl) {
    float q = r / max(rl, 0.01);
    h = 2.2 - 0.12 - 1.6 * (1.0 - q * q);
  }
  return max(-2.0, h);
}

float coneBound(vec2 a, vec2 b, vec2 c, float radius, float height) {
  vec2 ab = b - a;
  float span = max(dot(ab, ab), 0.0001);
  float u = clamp(dot(c - a, ab) / span, 0.0, 1.0);
  float dist = length(a + ab * u - c);
  float reach = radius * 0.92;
  if (dist >= reach) return 0.0;
  float s = 1.0 - dist / reach;
  return height * s * s * (3.0 - 2.0 * s);
}

float nearest(vec2 p) {
  float best = 200.0;
  for (int i = 0; i < 64; i++) {
    vec2 a = uTrack[i].xy;
    vec2 b = uTrack[i].zw;
    vec2 ab = b - a;
    float span = max(dot(ab, ab), 0.0001);
    float t = clamp(dot(p - a, ab) / span, 0.0, 1.0);
    best = min(best, length(p - (a + ab * t)));
  }
  return best;
}

void axes(float yaw, float pitch, float roll, out vec3 fwd, out vec3 right, out vec3 up) {
  float cp = cos(pitch);
  float sp = sin(pitch);
  float cr = cos(roll);
  float sr = sin(roll);
  float fx = sin(yaw);
  float fy = cos(yaw);
  fwd = vec3(fx * cp, fy * cp, sp);
  vec3 rx0 = vec3(cos(yaw), -sin(yaw), 0.0);
  vec3 up0 = vec3(-fx * sp, -fy * sp, cp);
  right = rx0 * cr + up0 * sr;
  up = up0 * cr - rx0 * sr;
}

vec3 placed(vec3 pos, vec3 fwd, vec3 right, vec3 up, vec3 local) {
  return pos + right * local.x + fwd * local.y + up * local.z;
}

vec3 wheelAt(vec3 pos, vec3 fwd, vec3 right, vec3 up, vec3 local) {
  vec3 w = placed(pos, fwd, right, up, local);
  if (up.z > 0.25) w.z = max(w.z, heightAt(w.xy) + 0.2);
  return w;
}

void ball(vec3 ro, vec3 rd, vec3 center, float radius, vec3 albedo, float faceSlot, vec3 fwd, vec3 sun, inout float best, inout vec3 rgb, inout bool hit) {
  vec3 oc = ro - center;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float disc = b * b - c;
  if (disc <= 0.0) return;
  float t = -b - sqrt(disc);
  if (t <= 0.2 || t >= best) return;
  best = t;
  vec3 n = normalize(ro + rd * t - center);
  float light = 0.32 + 0.68 * max(dot(n, sun), 0.0);
  vec3 color = mix(albedo * 0.62, albedo, smoothstep(-0.2, 0.55, n.z)) * light;
  if (faceSlot >= 0.0) {
    vec3 side = vec3(fwd.y, -fwd.x, 0.0);
    float front = dot(n, fwd);
    if (front > 0.18) {
      float u = clamp(dot(n, side) * 1.25 + 0.5, 0.02, 0.98);
      float v = clamp(n.z * 1.2 + 0.4, 0.02, 0.98);
      float col = mod(faceSlot, 4.0);
      float row = floor(faceSlot / 4.0);
      vec2 uv = vec2((col + u) / 4.0, 1.0 - (row + (1.0 - v)) / 3.0);
      color = texture(uFace, uv).rgb * (0.62 + 0.5 * light);
    } else {
      color = vec3(0.18, 0.12, 0.09) * light;
    }
  }
  rgb = color;
  hit = true;
}

float capT(vec3 ro, vec3 rd, vec3 pa, vec3 pb, float ra, out vec3 nrm) {
  nrm = vec3(0.0, 0.0, 1.0);
  vec3 ba = pb - pa;
  vec3 oa = ro - pa;
  float baba = dot(ba, ba);
  float bard = dot(ba, rd);
  float baoa = dot(ba, oa);
  float rdoa = dot(rd, oa);
  float oaoa = dot(oa, oa);
  float aa = baba - bard * bard;
  float bb = baba * rdoa - baoa * bard;
  float cc = baba * oaoa - baoa * baoa - ra * ra * baba;
  float h = bb * bb - aa * cc;
  float bestT = -1.0;
  if (h >= 0.0 && abs(aa) > 1.0e-4) {
    float t = (-bb - sqrt(h)) / aa;
    float y = baoa + t * bard;
    if (y > 0.0 && y < baba) {
      vec3 p = ro + rd * t;
      nrm = normalize(p - (pa + ba * (y / max(baba, 1.0e-4))));
      return t;
    }
  }
  vec3 capA = pa;
  vec3 oc = ro - capA;
  bb = dot(oc, rd);
  cc = dot(oc, oc) - ra * ra;
  h = bb * bb - cc;
  if (h > 0.0) {
    float t = -bb - sqrt(h);
    if (t > 0.0) {
      bestT = t;
      nrm = normalize(ro + rd * t - capA);
    }
  }
  oc = ro - pb;
  bb = dot(oc, rd);
  cc = dot(oc, oc) - ra * ra;
  h = bb * bb - cc;
  if (h > 0.0) {
    float t = -bb - sqrt(h);
    if (t > 0.0 && (bestT < 0.0 || t < bestT)) {
      bestT = t;
      nrm = normalize(ro + rd * t - pb);
    }
  }
  return bestT;
}

void beam(vec3 ro, vec3 rd, vec3 pa, vec3 pb, float ra, vec3 albedo, vec3 sun, inout float best, inout vec3 rgb, inout bool hit) {
  vec3 nrm;
  float t = capT(ro, rd, pa, pb, ra, nrm);
  if (t <= 0.2 || t >= best) return;
  best = t;
  float light = 0.34 + 0.66 * max(dot(nrm, sun), 0.0);
  rgb = albedo * light;
  hit = true;
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  float tanHalf = tan(uFov * 0.5);
  vec3 rd = normalize(uFwd + uRight * (ndc.x * tanHalf * uAspect) + uUp * (ndc.y * tanHalf));
  vec3 sun = normalize(uSun);
  float best = 8000.0;
  vec3 rgb = vec3(0.0);
  bool hit = false;
  for (int i = 0; i < 12; i++) {
    if (i >= uKarts) break;
    vec3 pos = uPos[i].xyz;
    float yaw = uPos[i].w;
    vec3 fwd;
    vec3 side;
    vec3 up;
    axes(yaw, uLean[i].x, uLean[i].y, fwd, side, up);
    vec3 tint = uTint[i];
    vec3 dark = tint * 0.38;
    vec3 wheel = vec3(0.07, 0.07, 0.08);
    ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, 0.0, 0.05)), 0.46, tint, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, 0.72, 0.08)), 0.24, tint, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, -0.48, 0.02)), 0.2, dark, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, -0.02, 0.52)), 0.36, vec3(0.86, 0.72, 0.58), uSlot[i], fwd, sun, best, rgb, hit);
    ball(uCam, rd, wheelAt(pos, fwd, side, up, vec3(0.46, 0.5, -0.28)), 0.2, wheel, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, wheelAt(pos, fwd, side, up, vec3(-0.46, 0.5, -0.28)), 0.2, wheel, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, wheelAt(pos, fwd, side, up, vec3(0.46, -0.42, -0.28)), 0.2, wheel, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, wheelAt(pos, fwd, side, up, vec3(-0.46, -0.42, -0.28)), 0.2, wheel, -1.0, fwd, sun, best, rgb, hit);
    if (uLean[i].z > 0.5) {
      ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, -0.85, 0.02)), 0.16, vec3(1.0, 0.45, 0.08), -1.0, fwd, sun, best, rgb, hit);
    }
  }
  for (int g = 0; g < 8; g++) {
    vec2 c = uGate[g].xy;
    vec2 nrm = uGate[g].zw;
    vec2 lp = c + nrm * (uRoad + 0.2);
    vec2 rp = c - nrm * (uRoad + 0.2);
    vec3 post = g == 0 ? vec3(0.93, 0.2, 0.14) : vec3(0.95, 0.82, 0.28);
    ball(uCam, rd, vec3(lp, heightAt(lp) + 1.15), 0.34, post, -1.0, uFwd, sun, best, rgb, hit);
    ball(uCam, rd, vec3(rp, heightAt(rp) + 1.15), 0.34, post, -1.0, uFwd, sun, best, rgb, hit);
  }
  for (int i = 0; i < 16; i++) {
    if (i >= uRails) break;
    float hp = uHp[i];
    if (hp < 0.12) continue;
    vec2 a = uRail[i].xy;
    vec2 b = uRail[i].zw;
    vec2 mid = (a + b) * 0.5;
    vec2 toMid = mid - uCam.xy;
    if (dot(toMid, uFwd.xy) < -6.0 && length(toMid) > 14.0) continue;
    if (length(toMid) > 120.0) continue;
    float ha = heightAt(a);
    float hb = heightAt(b);
    float sag = (1.0 - hp) * 0.7;
    float rad = 0.2 + 0.12 * hp;
    float hurt = 1.0 - hp;
    vec3 steel = mix(vec3(0.82, 0.84, 0.8), vec3(0.4, 0.18, 0.1), hurt);
    vec3 band = mix(vec3(0.95, 0.93, 0.88), vec3(0.28, 0.16, 0.12), hurt);
    if (mod(float(i), 2.0) < 0.5) band = mix(vec3(0.9, 0.2, 0.12), vec3(0.32, 0.1, 0.08), hurt);
    beam(uCam, rd, vec3(a, ha + 0.48 - sag), vec3(b, hb + 0.48 - sag), rad, steel, sun, best, rgb, hit);
    beam(uCam, rd, vec3(a, ha + 1.02 - sag), vec3(b, hb + 1.02 - sag), rad * 0.85, band, sun, best, rgb, hit);
  }
  float prevT = 0.3;
  float t = 0.3;
  float ground = -1.0;
  for (int i = 0; i < 80; i++) {
    vec3 a = uCam + rd * t;
    float clearance = a.z - heightAt(a.xy);
    float stride = t < 130.0 ? min(3.6, 0.45 + t * 0.024) : min(88.0, 4.2 + (t - 130.0) * 0.1);
    if (clearance > 18.0 && t > 40.0) stride = max(stride, min(72.0, clearance * 0.85));
    float nextT = min(t + stride, 8000.0);
    vec3 b = uCam + rd * nextT;
    float cones = coneBound(a.xy, b.xy, vec2(-40.0, 160.0), 104.0, 36.0);
    cones = max(cones, coneBound(a.xy, b.xy, vec2(-155.0, -55.0), 72.0, 30.0));
    if (cones > 0.5 && min(a.z, b.z) < cones + 2.0 && stride > 3.2) {
      nextT = min(t + max(1.3, min(6.0, stride * 0.28)), 8000.0);
      b = uCam + rd * nextT;
    }
    if (b.z <= heightAt(b.xy)) {
      prevT = t;
      ground = nextT;
      break;
    }
    if (rd.z >= 0.0 && b.z > 48.0 && t > 12.0) break;
    prevT = t;
    t = nextT;
    if (t >= 8000.0) break;
  }
  if (ground > 0.0 && ground < best) {
    float lo = prevT;
    float hi = ground;
    for (int i = 0; i < 8; i++) {
      float mid = 0.5 * (lo + hi);
      vec3 p = uCam + rd * mid;
      if (p.z < heightAt(p.xy)) hi = mid;
      else lo = mid;
    }
    vec3 p = uCam + rd * hi;
    float h = heightAt(p.xy);
    float road = nearest(p.xy);
    vec3 n = normalize(vec3(heightAt(p.xy + vec2(1.15, 0.0)) - h, heightAt(p.xy + vec2(0.0, 1.15)) - h, 1.15));
    float light = 0.42 + 0.58 * max(dot(n, sun), 0.0);
    vec3 sand = vec3(0.62, 0.48, 0.22);
    vec3 grass = vec3(0.28, 0.38, 0.18);
    vec3 rock = vec3(0.42, 0.36, 0.30);
    vec3 albedo = mix(grass, sand, smoothstep(1.2, 4.5, h));
    if (h > 12.0) albedo = mix(albedo, rock, smoothstep(12.0, 24.0, h));
    if (length(p.xy - vec2(70.0, 96.0)) < 14.0 && h < 2.4) albedo = vec3(0.15, 0.32, 0.38);
    if (road < uRoad) {
      vec3 asphalt = vec3(0.15, 0.15, 0.16);
      albedo = asphalt;
      if (road < 0.18) albedo = vec3(0.86, 0.74, 0.22);
      if (road > uRoad - 0.55) albedo = mix(vec3(0.92, 0.92, 0.88), vec3(0.78, 0.16, 0.11), step(0.5, fract((p.x + p.y) * 0.35)));
      for (int g = 0; g < 8; g++) {
        vec2 rel = p.xy - uGate[g].xy;
        vec2 nrm = uGate[g].zw;
        float across = dot(rel, nrm);
        float along = abs(dot(rel, vec2(-nrm.y, nrm.x)));
        if (along < 0.42 && abs(across) < uRoad) {
          float check = step(0.5, fract(across * 0.38));
          albedo = mix(vec3(0.95, 0.93, 0.86), vec3(0.1, 0.1, 0.11), check);
        }
      }
    } else {
      albedo *= 0.94 + 0.06 * sin(p.x * 0.7) * cos(p.y * 0.6);
    }
    float shade = 1.0;
    for (int i = 0; i < 12; i++) {
      if (i >= uKarts) break;
      float drop = max(0.0, uPos[i].z - h);
      float d = length(p.xy - uPos[i].xy);
      shade *= 1.0 - (1.0 - smoothstep(0.35, 1.5 + drop * 0.45, d)) * (0.42 / (1.0 + drop * 0.25));
    }
    albedo *= shade;
    float rubber = 0.0;
    for (int i = 0; i < 40; i++) {
      if (i >= uSkids) break;
      vec2 a = uSkid[i].xy;
      vec2 b = uSkid[i].zw;
      vec2 ab = b - a;
      float span = max(dot(ab, ab), 0.0001);
      float u = clamp(dot(p.xy - a, ab) / span, 0.0, 1.0);
      rubber = max(rubber, 1.0 - smoothstep(0.08, 0.62, length(p.xy - (a + ab * u))));
    }
    albedo = mix(albedo, vec3(0.02, 0.02, 0.025), rubber * 0.94);
    float fog = 1.0 - exp(-hi * 0.00012);
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

const TILE = 64;
const COLS = 4;
const ATLAS_W = 256;
const ATLAS_H = 192;

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
  const track = new Float32Array(64 * 4);
  const karts = new Float32Array(12 * 4);
  const tint = new Float32Array(12 * 3);
  const slots = new Float32Array(12);
  const lean = new Float32Array(12 * 4);
  const skid = new Float32Array(40 * 4);
  const gates = new Float32Array(8 * 4);
  const rail = new Float32Array(16 * 4);
  const railHp = new Float32Array(16);
  const atlas = new Uint8Array(ATLAS_W * ATLAS_H * 4);
  for (let i = 0; i < atlas.length; i += 4) {
    atlas[i] = 214;
    atlas[i + 1] = 170;
    atlas[i + 2] = 132;
    atlas[i + 3] = 255;
  }
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ATLAS_W, ATLAS_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  const faceSlot = new Map<number, number>();
  const faceStamp = new Map<number, number>();
  let faceUsed = 0;
  let faceDirty = false;
  let courseId = "";
  let road = 8;
  const loc = (name: string) => gl.getUniformLocation(program, name);
  const loadCourse = (id?: string) => {
    if (id && id !== courseId) {
      setCourseById(id);
      courseId = id;
    }
    const ribbon = trackRibbon(64);
    track.fill(0);
    const count = Math.min(64, ribbon.length / 4);
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      track[i * 4] = ribbon[i * 4]!;
      track[i * 4 + 1] = ribbon[i * 4 + 1]!;
      track[i * 4 + 2] = ribbon[j * 4]!;
      track[i * 4 + 3] = ribbon[j * 4 + 1]!;
    }
    road = halfWidth();
    for (let i = 0; i < 8; i++) {
      const gate = pointAt(i / 8);
      const [lx, ly] = leftNormal(gate);
      gates[i * 4] = gate.x;
      gates[i * 4 + 1] = gate.y;
      gates[i * 4 + 2] = lx;
      gates[i * 4 + 3] = ly;
    }
  };
  loadCourse();
  return {
    setFace(seed: number, face: { width: number; height: number; data: Uint8Array }) {
      let stamp = 0;
      const data = face.data;
      for (let i = 0; i < data.length; i += 997) stamp = (stamp + (data[i] ?? 0)) | 0;
      if (faceStamp.get(seed) === stamp) return;
      faceStamp.set(seed, stamp);
      let slot = faceSlot.get(seed);
      if (slot == null) {
        slot = faceUsed % 12;
        faceUsed += 1;
        faceSlot.set(seed, slot);
      }
      const col = slot % COLS;
      const row = (slot / COLS) | 0;
      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const sx = Math.min(face.width - 1, ((x + 0.5) * face.width) / TILE) | 0;
          const sy = Math.min(face.height - 1, ((y + 0.5) * face.height) / TILE) | 0;
          const si = (sy * face.width + sx) * 4;
          const di = ((row * TILE + y) * ATLAS_W + (col * TILE + x)) * 4;
          atlas[di] = data[si] ?? 0;
          atlas[di + 1] = data[si + 1] ?? 0;
          atlas[di + 2] = data[si + 2] ?? 0;
          atlas[di + 3] = 255;
        }
      }
      faceDirty = true;
    },
    paint(frame: Frame) {
      loadCourse(frame.course);
      if (faceDirty && tex) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, ATLAS_W, ATLAS_H, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
        faceDirty = false;
      }
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
      tint.fill(0);
      slots.fill(0);
      lean.fill(0);
      const n = Math.min(12, frame.bodies.length);
      for (let i = 0; i < n; i++) {
        const body = frame.bodies[i]!;
        karts[i * 4] = body.x;
        karts[i * 4 + 1] = body.y;
        karts[i * 4 + 2] = body.z ?? duneHeight(body.x, body.y) + 0.46;
        karts[i * 4 + 3] = body.yaw ?? 0;
        tint[i * 3] = body.color[0];
        tint[i * 3 + 1] = body.color[1];
        tint[i * 3 + 2] = body.color[2];
        slots[i] = faceSlot.get(body.seed ?? i) ?? 0;
        lean[i * 4] = body.pitch ?? 0;
        lean[i * 4 + 1] = body.roll ?? 0;
        lean[i * 4 + 2] = body.flame ?? 0;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
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
      gl.uniform4fv(loc("uGate"), gates);
      gl.uniform4fv(loc("uPos"), karts);
      gl.uniform3fv(loc("uTint"), tint);
      gl.uniform1fv(loc("uSlot"), slots);
      const marks = frame.skids ?? [];
      const count = Math.min(40, marks.length);
      skid.fill(0);
      for (let i = 0; i < count; i++) {
        const mark = marks[i]!;
        skid[i * 4] = mark.x;
        skid[i * 4 + 1] = mark.y;
        skid[i * 4 + 2] = mark.x2;
        skid[i * 4 + 3] = mark.y2;
      }
      gl.uniform4fv(loc("uLean"), lean);
      gl.uniform4fv(loc("uSkid"), skid);
      gl.uniform1i(loc("uSkids"), count);
      const bars = frame.rails ?? [];
      const railsN = Math.min(16, bars.length);
      rail.fill(0);
      railHp.fill(0);
      for (let i = 0; i < railsN; i++) {
        const bar = bars[i]!;
        rail[i * 4] = bar.x;
        rail[i * 4 + 1] = bar.y;
        rail[i * 4 + 2] = bar.x2;
        rail[i * 4 + 3] = bar.y2;
        railHp[i] = bar.hp;
      }
      gl.uniform4fv(loc("uRail"), rail);
      gl.uniform1fv(loc("uHp"), railHp);
      gl.uniform1i(loc("uRails"), railsN);
      gl.uniform1i(loc("uFace"), 0);
      gl.uniform1i(loc("uKarts"), n);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.finish();
    },
  };
}
