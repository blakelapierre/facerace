import { paintFace, type FaceImage } from "./faces";
import { buildPicture } from "./scene";

type Painter = {
  paint: (scene: unknown, w: number, h: number) => boolean;
  present: (n?: number) => void;
  setSmoothing?: (on: boolean) => void;
};

type BodyMsg = {
  x: number;
  y: number;
  z?: number;
  yaw: number;
  color: [number, number, number];
  seed: number;
  name: string;
};

type FrameMsg = {
  cmd: "frame";
  bodies: BodyMsg[];
  camera: { x: number; y: number; z: number; dir: [number, number, number] };
  still: boolean;
  rain: number;
  sun: [number, number, number];
  course?: string;
};

const scope = self as unknown as {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (data: unknown, transfer?: Transferable[]) => void;
  close: () => void;
};

let canvas: OffscreenCanvas | null = null;
let painter: Painter | null = null;
let lite: { paint: (frame: FrameMsg) => void; setFace?: (seed: number, face: FaceImage) => void } | null = null;
let cpu: { paintFrame: (scene: unknown, w: number, h: number) => Uint8ClampedArray } | null = null;
let ctx2d: OffscreenCanvasRenderingContext2D | null = null;
let mode = "discrete";
let tune: { spheres: number; boxes: number; shapes: number } | undefined;
let viewW = 960;
let viewH = 540;
let traceScale = 0.72;
let traceMax = 1;
let ready = false;
let painting = false;
let queued: FrameMsg | null = null;
const faces = new Map<number, FaceImage>();
let liveSeed = Number.NaN;
let liveFace: FaceImage | null = null;

function faceFor(seed: number) {
  if (seed === liveSeed && liveFace) return liveFace;
  let found = faces.get(seed);
  if (!found) {
    found = paintFace(seed);
    faces.set(seed, found);
  }
  return found;
}

function draw(frame: FrameMsg) {
  if (!canvas) return;
  if (lite) {
    for (const body of frame.bodies) {
      const face = body.seed === liveSeed && liveFace ? liveFace : faceFor(body.seed);
      lite.setFace?.(body.seed, face);
    }
    lite.paint(frame);
    const bitmap = canvas.transferToImageBitmap();
    scope.postMessage({ type: "bitmap", bitmap }, [bitmap]);
    return;
  }
  const traceW = mode === "software" ? 96 : Math.max(320, Math.min(viewW, Math.round((viewW * traceScale) / 4) * 4));
  const traceH = mode === "software" ? 54 : Math.max(90, Math.round((traceW * viewH) / Math.max(1, viewW) / 4) * 4);
  const bodies = frame.bodies.map((body) => ({
    x: body.x,
    y: body.y,
    z: body.z,
    yaw: body.yaw,
    color: body.color,
    name: body.name,
    face: faceFor(body.seed),
  }));
  const picture = buildPicture(bodies, frame.camera, traceW, traceH, frame.still, frame.sun, frame.rain);
  const started = performance.now();
  if (painter) {
    const ok = painter.paint(picture, traceW, traceH);
    if (ok) painter.present(1);
    const ms = performance.now() - started;
    if (ms < 80) traceScale = Math.min(1, traceScale * 1.08);
    else if (ms > 140) traceScale = Math.max(0.5, traceScale * 0.86);
    scope.postMessage({ type: "painted", ms, ok });
    const bitmap = canvas.transferToImageBitmap();
    scope.postMessage({ type: "bitmap", bitmap }, [bitmap]);
    return;
  }
  if (!cpu || !ctx2d) return;
  const pixels = cpu.paintFrame(picture, traceW, traceH);
  const image = new ImageData(new Uint8ClampedArray(pixels), traceW, traceH);
  const scratch = new OffscreenCanvas(traceW, traceH);
  scratch.getContext("2d")?.putImageData(image, 0, 0);
  ctx2d.imageSmoothingEnabled = true;
  ctx2d.drawImage(scratch, 0, 0, canvas.width, canvas.height);
  const bitmap = canvas.transferToImageBitmap();
  scope.postMessage({ type: "bitmap", bitmap, ms: performance.now() - started }, [bitmap]);
}

async function bootGpu() {
  if (!canvas || mode !== "discrete") return;
  const gpu = await import("../vendor/meridian/render/gpu.js");
  painter = gpu.createGpuPainter(canvas, tune) as Painter | null;
  painter?.setSmoothing?.(true);
}

async function bootPicture() {
  if (!canvas) return;
  if (mode === "discrete") {
    await bootGpu();
    return;
  }
  const { createLitePainter } = await import("./lite");
  try {
    lite = createLitePainter(canvas);
  } catch {
    lite = null;
  }
  if (!lite) {
    cpu = await import("../vendor/meridian/engine/frame.js");
    ctx2d = canvas.getContext("2d");
  }
}

scope.onmessage = (event: MessageEvent) => {
  const message = event.data as {
    cmd?: string;
    canvas?: OffscreenCanvas;
    mode?: string;
    tune?: { spheres: number; boxes: number; shapes: number };
    viewW?: number;
    viewH?: number;
    seed?: number;
    width?: number;
    height?: number;
    data?: ArrayBuffer;
    bodies?: BodyMsg[];
    camera?: FrameMsg["camera"];
    still?: boolean;
    rain?: number;
    sun?: [number, number, number];
    course?: string;
  };
  if (message.cmd === "stop") {
    scope.close();
    return;
  }
  if (message.cmd === "init") {
    mode = message.mode || "discrete";
    tune = message.tune;
    viewW = message.viewW || viewW;
    viewH = message.viewH || viewH;
    traceScale = mode === "integrated" ? 0.36 : 0.72;
    canvas = new OffscreenCanvas(viewW, viewH);
    void (async () => {
      try {
        if (mode === "discrete") await bootGpu();
        else await bootPicture();
        ready = true;
        scope.postMessage({ type: "ready", ok: Boolean(painter || lite || ctx2d) });
      } catch (error) {
        scope.postMessage({ type: "ready", ok: false, reason: error instanceof Error ? error.message : "picture failed" });
      }
    })();
    return;
  }
  if (message.cmd === "face" && message.data && message.seed != null && message.width && message.height) {
    liveSeed = message.seed;
    liveFace = { width: message.width, height: message.height, data: new Uint8Array(message.data), url: "" };
    return;
  }
  if (message.cmd === "resize" && message.viewW && message.viewH) {
    if (Math.abs(message.viewW - viewW) < 48 && Math.abs(message.viewH - viewH) < 48) return;
    viewW = message.viewW;
    viewH = message.viewH;
    traceScale = mode === "integrated" ? 0.36 : 0.72;
    traceMax = 1;
    if (!canvas) return;
    canvas.width = viewW;
    canvas.height = viewH;
    painter = null;
    lite = null;
    if (mode === "discrete") void bootGpu();
    else void bootPicture();
    return;
  }
  if (message.cmd === "frame" && message.bodies && message.camera && message.sun) {
    const frame: FrameMsg = {
      cmd: "frame",
      bodies: message.bodies,
      camera: message.camera,
      still: Boolean(message.still),
      rain: message.rain || 0,
      sun: message.sun,
      course: message.course,
    };
    if (!ready) {
      queued = frame;
      return;
    }
    if (painting) {
      queued = frame;
      return;
    }
    painting = true;
    try {
      draw(frame);
    } finally {
      painting = false;
      const next = queued;
      queued = null;
      if (next) {
        painting = true;
        try {
          draw(next);
        } finally {
          painting = false;
        }
      }
    }
  }
};
