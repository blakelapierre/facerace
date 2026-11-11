export type FaceImage = { width: number; height: number; data: Uint8Array; url: string };

const SIZE = 128;

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function paintProcedural(ctx: CanvasRenderingContext2D, seed: number) {
  const rand = rng(seed);
  const skin: [number, number, number] = [
    180 + rand() * 60,
    120 + rand() * 70,
    90 + rand() * 60,
  ];
  const hair: [number, number, number] = [rand() * 90, rand() * 70, rand() * 80];
  const iris: [number, number, number] = [40 + rand() * 80, 60 + rand() * 120, 80 + rand() * 140];
  ctx.fillStyle = `rgb(${hair.map((n) => n | 0).join(",")})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = `rgb(${skin.map((n) => n | 0).join(",")})`;
  ctx.beginPath();
  ctx.ellipse(64, 70, 40, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgb(${hair.map((n) => (n * 0.85) | 0).join(",")})`;
  ctx.beginPath();
  ctx.ellipse(64, 38, 42, 28, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  const eye = (x: number) => {
    ctx.fillStyle = "#f4efe6";
    ctx.beginPath();
    ctx.ellipse(x, 68, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgb(${iris.map((n) => n | 0).join(",")})`;
    ctx.beginPath();
    ctx.arc(x + (rand() - 0.5) * 3, 68, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a140f";
    ctx.beginPath();
    ctx.arc(x, 68, 2.1, 0, Math.PI * 2);
    ctx.fill();
  };
  eye(50);
  eye(78);
  ctx.strokeStyle = `rgb(${hair.map((n) => n | 0).join(",")})`;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(40, 56);
  ctx.quadraticCurveTo(50, 52 + rand() * 4, 60, 57);
  ctx.moveTo(68, 57);
  ctx.quadraticCurveTo(78, 52 + rand() * 4, 88, 56);
  ctx.stroke();
  ctx.strokeStyle = "rgba(90,40,40,0.85)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  const smile = 0.2 + rand() * 0.8;
  ctx.moveTo(52, 92);
  ctx.quadraticCurveTo(64, 92 + 10 * smile, 76, 92);
  ctx.stroke();
  if (rand() > 0.55) {
    ctx.strokeStyle = "rgba(20,16,12,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(50, 68, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(78, 68, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(62, 68);
    ctx.lineTo(66, 68);
    ctx.stroke();
  }
}

function makeFaceCanvas() {
  if (typeof document === "undefined") {
    const canvas = new OffscreenCanvas(SIZE, SIZE);
    const ctx = canvas.getContext("2d", { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D | null;
    return { canvas, ctx };
  }
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  return { canvas, ctx: canvas.getContext("2d", { willReadFrequently: true }) };
}

export function paintFace(seed: number, source?: CanvasImageSource | null): FaceImage {
  const { canvas, ctx } = makeFaceCanvas();
  if (!ctx) return { width: SIZE, height: SIZE, data: new Uint8Array(SIZE * SIZE * 4), url: "" };
  if (source) {
    ctx.save();
    ctx.translate(SIZE, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(source, 0, 0, SIZE, SIZE);
    ctx.restore();
    ctx.strokeStyle = "rgba(231,163,34,0.9)";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, SIZE - 6, SIZE - 6);
  } else {
    paintProcedural(ctx as CanvasRenderingContext2D, seed);
  }
  const image = ctx.getImageData(0, 0, SIZE, SIZE);
  let url = "";
  try {
    if ("toDataURL" in canvas) url = canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    url = "";
  }
  return { width: SIZE, height: SIZE, data: new Uint8Array(image.data), url };
}

/** Load a saved face without mirroring or adding another frame. */
export function faceFromUrl(url: string): Promise<FaceImage | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { canvas, ctx } = makeFaceCanvas();
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const image = ctx.getImageData(0, 0, SIZE, SIZE);
      resolve({ width: SIZE, height: SIZE, data: new Uint8Array(image.data), url });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
