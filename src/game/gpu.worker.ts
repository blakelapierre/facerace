import { K, sha256Block, toHex } from "./sha256";
import { prepareHeader, writeNonce } from "./work";

const scope = self as unknown as Worker;

const vert = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const frag = `#version 300 es
precision highp float;
precision highp int;
out vec4 outColor;
uniform uint uPrev[8];
uniform uint uTime;
uniform uint uHeight;
uniform uint uMiner0;
uniform uint uMiner1;
uniform uint uBase;
uniform uint uTx;
uniform uint uBits;
uniform uint uMode;
uniform uint uWidth;

uint rotr(uint x, uint n) { return (x >> n) | (x << (32u - n)); }
uint kk(int i) {
${[...K].map((word, index) => `  if (i == ${index}) return ${word >>> 0}u;`).join("\n")}
  return 0u;
}

void compress(uint nonce, out uint H0, out uint H1, out uint H2, out uint H3, out uint H4, out uint H5, out uint H6, out uint H7) {
  uint w[64];
  w[0] = uPrev[0]; w[1] = uPrev[1]; w[2] = uPrev[2]; w[3] = uPrev[3];
  w[4] = uPrev[4]; w[5] = uPrev[5]; w[6] = uPrev[6]; w[7] = uPrev[7];
  w[8] = uTime; w[9] = uHeight; w[10] = uMiner0; w[11] = uMiner1;
  w[12] = nonce; w[13] = uTx; w[14] = 0x80000000u; w[15] = 448u;
  for (int i = 16; i < 64; ++i) {
    uint x15 = w[i - 15];
    uint x2 = w[i - 2];
    uint s0 = rotr(x15, 7u) ^ rotr(x15, 18u) ^ (x15 >> 3u);
    uint s1 = rotr(x2, 17u) ^ rotr(x2, 19u) ^ (x2 >> 10u);
    w[i] = w[i - 16] + s0 + w[i - 7] + s1;
  }
  uint a = 0x6a09e667u;
  uint b = 0xbb67ae85u;
  uint c = 0x3c6ef372u;
  uint d = 0xa54ff53au;
  uint e = 0x510e527fu;
  uint f = 0x9b05688cu;
  uint g = 0x1f83d9abu;
  uint h = 0x5be0cd19u;
  for (int i = 0; i < 64; ++i) {
    uint s1 = rotr(e, 6u) ^ rotr(e, 11u) ^ rotr(e, 25u);
    uint ch = (e & f) ^ ((~e) & g);
    uint t1 = h + s1 + ch + kk(i) + w[i];
    uint s0 = rotr(a, 2u) ^ rotr(a, 13u) ^ rotr(a, 22u);
    uint maj = (a & b) ^ (a & c) ^ (b & c);
    uint t2 = s0 + maj;
    h = g; g = f; f = e; e = d + t1; d = c; c = b; b = a; a = t1 + t2;
  }
  H0 = a + 0x6a09e667u; H1 = b + 0xbb67ae85u; H2 = c + 0x3c6ef372u; H3 = d + 0xa54ff53au;
  H4 = e + 0x510e527fu; H5 = f + 0x9b05688cu; H6 = g + 0x1f83d9abu; H7 = h + 0x5be0cd19u;
}

void main() {
  if (uMode == 0u) {
    uint H0, H1, H2, H3, H4, H5, H6, H7;
    compress(0u, H0, H1, H2, H3, H4, H5, H6, H7);
    uint words[8] = uint[8](H0, H1, H2, H3, H4, H5, H6, H7);
    uint word = words[int(gl_FragCoord.x)];
    outColor = vec4(
      float((word >> 24) & 255u) / 255.0,
      float((word >> 16) & 255u) / 255.0,
      float((word >> 8) & 255u) / 255.0,
      float(word & 255u) / 255.0
    );
    return;
  }
  uint index = uint(int(gl_FragCoord.x)) + uint(int(gl_FragCoord.y)) * uWidth;
  uint H0, H1, H2, H3, H4, H5, H6, H7;
  compress(uBase + index, H0, H1, H2, H3, H4, H5, H6, H7);
  uint bits = uBits;
  bool hit = bits >= 32u ? H0 == 0u : (H0 & (0xffffffffu << (32u - bits))) == 0u;
  outColor = hit ? vec4(1.0) : vec4(0.0);
}`;

type Job = { prev: string; time: number; height: number; miner: string; bits: number; duty: number; txTag?: number };

let canvas: OffscreenCanvas | null = null;
let gl: WebGL2RenderingContext | null = null;
let program: WebGLProgram | null = null;
let job: Job | null = null;
let running = false;
let proven = false;
let base = 0;
const width = 32;

function fail(reason: string) {
  running = false;
  scope.postMessage({ type: "gpu", on: false, reason });
}

function location(name: string) {
  return gl!.getUniformLocation(program!, name);
}

function upload(nonceBase: number, mode: number) {
  if (!job || !gl) return;
  const prev = new Uint32Array(8);
  const raw = job.prev.padStart(64, "0");
  for (let i = 0; i < 8; i++) prev[i] = parseInt(raw.slice(i * 8, i * 8 + 8), 16) >>> 0;
  const miner = job.miner.padStart(16, "0");
  gl.uniform1uiv(location("uPrev[0]"), prev);
  gl.uniform1ui(location("uTime"), job.time >>> 0);
  gl.uniform1ui(location("uHeight"), job.height >>> 0);
  gl.uniform1ui(location("uMiner0"), parseInt(miner.slice(0, 8), 16) >>> 0);
  gl.uniform1ui(location("uMiner1"), parseInt(miner.slice(8, 16), 16) >>> 0);
  gl.uniform1ui(location("uBase"), nonceBase >>> 0);
  gl.uniform1ui(location("uTx"), (job.txTag || 0) >>> 0);
  gl.uniform1ui(location("uBits"), job.bits >>> 0);
  gl.uniform1ui(location("uMode"), mode >>> 0);
  gl.uniform1ui(location("uWidth"), width);
}

function draw(w: number, h: number) {
  gl!.viewport(0, 0, w, h);
  gl!.drawArrays(gl!.TRIANGLES, 0, 3);
}

function prove() {
  if (!gl || !job) return false;
  const buf = new Uint8Array(64);
  const prev = new Uint8Array(32);
  const miner = new Uint8Array(8);
  const prevHex = job.prev.padStart(64, "0");
  const minerHex = job.miner.padStart(16, "0");
  for (let i = 0; i < 32; i++) prev[i] = parseInt(prevHex.slice(i * 2, i * 2 + 2), 16);
  for (let i = 0; i < 8; i++) miner[i] = parseInt(minerHex.slice(i * 2, i * 2 + 2), 16);
  prepareHeader(buf, prev, job.time, job.height, miner, job.txTag || 0);
  writeNonce(buf, 0);
  const expect = sha256Block(buf);
  upload(0, 0);
  draw(8, 1);
  const pixels = new Uint8Array(8 * 4);
  gl.readPixels(0, 0, 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let match = 0;
  for (let i = 0; i < 32; i++) if (pixels[i] === expect[i]) match += 1;
  if (match < 32) {
    fail(`GPU hash disagreed (${match}/32)`);
    return false;
  }
  scope.postMessage({ type: "gpu", on: true, check: toHex(expect) });
  return true;
}

function boot() {
  if (canvas) return true;
  try {
    canvas = new OffscreenCanvas(width, width);
    gl = canvas.getContext("webgl2", { antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    if (!gl) {
      fail("No WebGL2");
      return false;
    }
    const compile = (type: number, source: string) => {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        fail(gl!.getShaderInfoLog(shader) || "shader");
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vert);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return false;
    program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      fail(gl.getProgramInfoLog(program) || "link");
      return false;
    }
    gl.useProgram(program);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    return true;
  } catch (error) {
    fail(error instanceof Error ? error.message : "GPU miner failed");
    return false;
  }
}

function loop() {
  if (!running || !gl || !job) return;
  const started = performance.now();
  if (!proven) {
    proven = prove();
    if (!proven) return;
  }
  upload(base, 1);
  draw(width, width);
  const pixels = new Uint8Array(width * width * 4);
  gl.readPixels(0, 0, width, width, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  for (let i = 0; i < width * width; i++) {
    if (pixels[i * 4]! > 200) {
      scope.postMessage({
          type: "found",
          nonce: (base + i) >>> 0,
          time: job.time,
          height: job.height,
          prev: job.prev,
          bits: job.bits,
        });
      break;
    }
  }
  const hashes = width * width;
  base = (base + hashes) >>> 0;
  const spent = performance.now() - started;
  const duty = Math.min(1, Math.max(0.02, job.duty));
  const rest = duty >= 0.99 ? 16 : Math.max(16, (spent * (1 - duty)) / duty);
  scope.postMessage({ type: "rate", hashes, spent, wall: spent + rest, gpu: true });
  setTimeout(loop, rest);
}

scope.onmessage = (event: MessageEvent) => {
  const message = event.data as { cmd?: string; duty?: number } & Partial<Job>;
  if (message.cmd === "stop") {
    running = false;
    return;
  }
  if (message.cmd === "duty" && job) {
    job.duty = message.duty || job.duty;
    return;
  }
  if (message.cmd === "job") {
    const first = !running;
    job = {
      prev: message.prev || "",
      time: message.time || 0,
      height: message.height || 1,
      miner: message.miner || "",
      bits: message.bits || 20,
      duty: message.duty || 0.1,
    };
    if (!boot()) return;
    if (first) {
      running = true;
      setTimeout(loop, 1200);
    }
  }
};
