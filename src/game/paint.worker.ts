import { paintFace, type FaceImage } from "./faces";
import { createPace, picturePixels, stepPace, type PaceState } from "./pace";
import { buildPicture } from "./scene";
import { setCourseById } from "./track";

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
  pitch?: number;
  roll?: number;
  flame?: number;
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
  skids?: { x: number; y: number; x2: number; y2: number }[];
  rails?: { x: number; y: number; x2: number; y2: number; hp: number }[];
  time?: number;
  nextGate?: number;
  /** Centerline from the race thread: x, y, tx, ty. The painter must not guess the course. */
  ribbon?: Float32Array;
  half?: number;
  /** Milliseconds since the previous presented frame on the main thread. */
  pace?: number;
};

const scope = self as unknown as {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (data: unknown, transfer?: Transferable[]) => void;
  close: () => void;
};

let canvas: OffscreenCanvas | null = null;
let painter: Painter | null = null;
let lite: { paint: (frame: FrameMsg, pixels?: { w: number; h: number }) => number; setFace?: (seed: number, face: FaceImage) => void } | null = null;
let cpu: { paintFrame: (scene: unknown, w: number, h: number) => Uint8ClampedArray } | null = null;
let ctx2d: OffscreenCanvasRenderingContext2D | null = null;
let mode = "discrete";
let tune: { spheres: number; boxes: number; shapes: number } | undefined;
let viewW = 960;
let viewH = 540;
let pace: PaceState = createPace();
let drawnCourse = "";
let drawnW = 0;
let drawnH = 0;
let lastDrawAt = 0;
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

function pictureSize() {
  return picturePixels(viewW, viewH, pace.shown);
}

/**
 * Hold ~30fps. If that misses, spend resolution to reach 20, and only the floor if 12 is in trouble.
 * `gap` is the present interval. `cost` is this picture alone, so a cheap picture is not ground down.
 */
function budget(gap: number, cost: number) {
  pace = stepPace(pace, gap, cost);
}

function draw(frame: FrameMsg) {
  if (!canvas) return;
  if (frame.course && frame.course !== drawnCourse) {
    setCourseById(frame.course);
    drawnCourse = frame.course;
  }
  const now = performance.now();
  const period = lastDrawAt ? Math.min(160, now - lastDrawAt) : 0;
  lastDrawAt = now;
  const hinted = Math.min(160, Math.max(0, frame.pace || 0));
  const size = pictureSize();
  const resized = size.w !== drawnW || size.h !== drawnH;
  drawnW = size.w;
  drawnH = size.h;
  const charge = (cost: number) => {
    // A zero paint time means the GPU timer returned before the work landed.
    // The gap until the next paint is the real cost in that case.
    // Resizing the picture is a one-frame hitch. Don't let it knock the size again.
    const pictureCost = cost >= 1 ? cost : Math.max(period, hinted);
    const gap = Math.max(pictureCost, hinted, period);
    if (resized && pace.ema > 0) budget(Math.min(gap, pace.ema), Math.min(pictureCost, Math.max(pace.ema, 1)));
    else budget(gap, pictureCost);
  };
  const report = () => {
    const bitmap = canvas!.transferToImageBitmap();
    scope.postMessage({ type: "bitmap", bitmap, pictureW: size.w, pictureH: size.h }, [bitmap]);
  };
  if (lite) {
    for (const body of frame.bodies) {
      const face = body.seed === liveSeed && liveFace ? liveFace : faceFor(body.seed);
      lite.setFace?.(body.seed, face);
    }
    const started = performance.now();
    const gpu = Number(lite.paint(frame, size)) || 0;
    const cpu = performance.now() - started;
    const cost = Math.max(cpu, gpu);
    charge(cost);
    report();
    return;
  }
  const traceW = mode === "software" ? Math.max(80, Math.min(192, size.w)) : size.w;
  const traceH = mode === "software" ? Math.max(48, Math.round((traceW * viewH) / Math.max(1, viewW) / 2) * 2) : size.h;
  const bodies = frame.bodies.map((body) => ({
    x: body.x,
    y: body.y,
    z: body.z,
    yaw: body.yaw,
    pitch: body.pitch,
    roll: body.roll,
    flame: body.flame,
    color: body.color,
    name: body.name,
    face: faceFor(body.seed),
  }));
  const picture = buildPicture(
    bodies,
    frame.camera,
    traceW,
    traceH,
    frame.still,
    frame.sun,
    frame.rain,
    frame.rails ?? [],
    frame.time ?? 0,
    frame.nextGate ?? 0,
    frame.course ?? "",
    frame.ribbon,
    frame.half ?? 0,
  );
  const started = performance.now();
  if (painter) {
    const ok = painter.paint(picture, traceW, traceH);
    if (ok) painter.present(1);
    const cost = performance.now() - started;
    charge(cost);
    scope.postMessage({ type: "painted", ms: cost, ok });
    report();
    return;
  }
  if (!cpu || !ctx2d) return;
  const pixels = cpu.paintFrame(picture, traceW, traceH);
  const image = new ImageData(new Uint8ClampedArray(pixels), traceW, traceH);
  const scratch = new OffscreenCanvas(traceW, traceH);
  scratch.getContext("2d")?.putImageData(image, 0, 0);
  ctx2d.imageSmoothingEnabled = true;
  ctx2d.drawImage(scratch, 0, 0, canvas.width, canvas.height);
  const cost = performance.now() - started;
  charge(cost);
  report();
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
  } catch (error) {
    lite = null;
    console.error(error);
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
    skids?: FrameMsg["skids"];
    rails?: FrameMsg["rails"];
    time?: number;
    nextGate?: number;
    ribbon?: Float32Array;
    half?: number;
    pace?: number;
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
    pace = createPace();
    drawnCourse = "";
    drawnW = 0;
    drawnH = 0;
    lastDrawAt = 0;
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
      skids: message.skids,
      rails: message.rails,
      time: message.time,
      nextGate: message.nextGate,
      ribbon: message.ribbon,
      half: message.half,
      pace: message.pace,
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
