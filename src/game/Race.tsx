import { useEffect, useRef, useState } from "react";
import { Camera, Flag, Gauge, Users, Volume2, VolumeX } from "lucide-react";
import { faceFromUrl, paintFace, type FaceImage } from "./faces";
import { paintPortrait } from "./portrait";
import { createSim, installProbe, lapOf, parkHuman, parkOn, placeOf, stepSim, type Sim } from "./sim";
import { chaseCamera, raceSun } from "./scene";
import { createRaceAudio, hearAt, type RaceAudio } from "./sound";
import { rainAt } from "./terrain";
import { COURSES, course, lapCount, pointAt } from "./track";
import { freshCode, openBoard, type ListedRoom, type MarketListing } from "./lobby";
import type { RaceNet, RoomPerson } from "./net";
import { openWallet, shortAddress, writePurse, type Wallet } from "./wallet";
import { startMiner, type MineStatus } from "./miner";
import { holdings, market, purseTable, recentBlocks, submitTx, watchChain, type Holdings, type OpenPurse } from "./chain";
import { cartIdFor, signTx } from "./tx";
import {
  MECHANICS,
  PURSE_SIZES,
  PURSE_STAKES,
  listingIsReal,
  loadOffers,
  loadYard,
  mechanicById,
  pullOffer,
  purseKey,
  putOffer,
  selectCart,
  signListing,
  specOf,
  writeOffers,
  writeYard,
  type Offer,
  type Yard,
} from "./yard";

function fmt(seconds: number) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(2).padStart(5, "0")}`;
}

function ordinal(n: number) {
  const teen = n % 100;
  if (teen >= 11 && teen <= 13) return `${n}th`;
  const tail = n % 10;
  if (tail === 1) return `${n}st`;
  if (tail === 2) return `${n}nd`;
  if (tail === 3) return `${n}rd`;
  return `${n}th`;
}

/** Degrees the screen's right edge is below the left. Positive → turn right. */
function screenRoll(event: DeviceOrientationEvent) {
  const angle = screen.orientation?.angle ?? Number(window.orientation ?? 0);
  const beta = event.beta ?? 0;
  const gamma = event.gamma ?? 0;
  if (angle === 90) return beta;
  if (angle === 270 || angle === -90) return -beta;
  if (angle === 180) return -gamma;
  return gamma;
}

/** Degrees the top edge is lifted. Positive is pulled back. */
function screenPitch(event: DeviceOrientationEvent) {
  const angle = screen.orientation?.angle ?? Number(window.orientation ?? 0);
  const beta = event.beta ?? 0;
  const gamma = event.gamma ?? 0;
  if (angle === 90) return -gamma;
  if (angle === 270 || angle === -90) return gamma;
  if (angle === 180) return -beta;
  return beta;
}

function clampUnit(n: number) {
  if (n > 1) return 1;
  if (n < -1) return -1;
  return n;
}

function drawMap(canvas: HTMLCanvasElement | null, sim: Sim, remotes: { x: number; y: number }[]) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const you = sim.karts[0];
  if (!ctx || !you) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const scale = w / 96;
  const to = (x: number, y: number) => [w / 2 + (x - you.x) * scale, h / 2 - (y - you.y) * scale] as const;
  ctx.strokeStyle = "rgba(232, 196, 92, 0.92)";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i <= 32; i++) {
    const sample = pointAt(you.travel - 0.05 + (i / 32) * 0.13);
    const [px, py] = to(sample.x, sample.y);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  const dot = (x: number, y: number, color: string, radius = 3.4) => {
    const [px, py] = to(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  for (const kart of sim.karts) {
    if (kart === you) continue;
    dot(kart.x, kart.y, `rgb(${Math.round(kart.color[0] * 255)}, ${Math.round(kart.color[1] * 255)}, ${Math.round(kart.color[2] * 255)})`);
  }
  for (const remote of remotes) dot(remote.x, remote.y, "#9fd0ff");
  dot(you.x, you.y, "#f4c14e", 4.4);
}

const BUBBLE_TAN = Math.tan(((68 * Math.PI) / 180) * 0.5);

function savedName() {
  try {
    const name = localStorage.getItem("facerace-name")?.trim().slice(0, 16);
    if (name) return name;
  } catch {
    /* private mode */
  }
  return "You";
}

function rememberName(name: string) {
  try {
    localStorage.setItem("facerace-name", name.trim().slice(0, 16) || "You");
  } catch {
    /* private mode */
  }
}

function rememberFace(url: string) {
  if (!url.startsWith("data:image")) return;
  try {
    localStorage.setItem("facerace-face", url);
  } catch {
    /* private mode */
  }
}

function projectHead(
  cam: { x: number; y: number; z: number; dir: [number, number, number] },
  point: { x: number; y: number; z: number },
  width: number,
  height: number,
) {
  const fwd = cam.dir;
  const rx = fwd[1];
  const ry = -fwd[0];
  const rlen = Math.hypot(rx, ry) || 1;
  const right = [rx / rlen, ry / rlen, 0];
  const up = [right[1]! * fwd[2] - right[2]! * fwd[1], right[2]! * fwd[0] - right[0]! * fwd[2], right[0]! * fwd[1] - right[1]! * fwd[0]];
  const vx = point.x - cam.x;
  const vy = point.y - cam.y;
  const vz = point.z - cam.z;
  const depth = vx * fwd[0] + vy * fwd[1] + vz * fwd[2];
  if (depth < 0.35) return null;
  const aspect = width / Math.max(1, height);
  const ndcX = (vx * right[0]! + vy * right[1]! + vz * right[2]!) / (depth * BUBBLE_TAN * aspect);
  const ndcY = (vx * up[0]! + vy * up[1]! + vz * up[2]!) / (depth * BUBBLE_TAN);
  if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.15 || ndcY > 1.25) return null;
  return { x: (ndcX * 0.5 + 0.5) * width, y: (0.5 - ndcY * 0.5) * height };
}

function drawThoughts(
  root: HTMLElement | null,
  nodes: Map<string, HTMLDivElement>,
  player: { x: number; y: number; z: number },
  spots: { key: string; url: string; x: number; y: number; z: number }[],
  cam: { x: number; y: number; z: number; dir: [number, number, number] },
) {
  if (!root) return;
  const width = root.clientWidth;
  const height = root.clientHeight;
  const seen = new Set<string>();
  for (const spot of spots) {
    if (!spot.url) continue;
    const dist = Math.hypot(spot.x - player.x, spot.y - player.y, spot.z - player.z);
    if (dist > 52) continue;
    const near = Math.min(1, Math.max(0, (dist - 3.2) / 36));
    const placed = projectHead(cam, { x: spot.x, y: spot.y, z: spot.z + 0.92 }, width, height);
    if (!placed) continue;
    seen.add(spot.key);
    let node = nodes.get(spot.key);
    if (!node) {
      node = document.createElement("div");
      node.className = "thought";
      const img = document.createElement("img");
      img.alt = "";
      img.draggable = false;
      const mid = document.createElement("i");
      const tip = document.createElement("b");
      node.append(img, mid, tip);
      nodes.set(spot.key, node);
      root.append(node);
    }
    const img = node.firstElementChild as HTMLImageElement;
    if (img.getAttribute("src") !== spot.url) img.src = spot.url;
    const size = 58 - near * 38;
    node.style.transform = `translate(${placed.x}px, ${placed.y}px) translate(-50%, -118%)`;
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;
    node.style.opacity = String(0.58 - near * 0.26);
    node.style.zIndex = String(800 - Math.round(dist * 8));
  }
  for (const [key, node] of nodes) {
    if (seen.has(key)) continue;
    node.remove();
    nodes.delete(key);
  }
}

/** Software GL gets a tiny CPU picture. Intel integrated gets a smaller raytracer on the GPU. */
function pictureBudget() {
  const probe = document.createElement("canvas");
  let name = "";
  try {
    const gl = probe.getContext("webgl2", { antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    if (gl) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      name = String((info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) || "");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    name = "";
  }
  try {
    const pick = localStorage.getItem("facerace-picture");
    if (pick === "gpu") return { mode: "integrated" as const, name };
    if (pick === "cpu") return { mode: "software" as const, name };
  } catch {
    /* ignore */
  }
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const software = /swiftshader|llvmpipe|basic render/i.test(name);
  const discrete = /nvidia|geforce|radeon|amd|apple|adreno|arc/i.test(name);
  const integrated = !discrete && !software && (/intel|uhd|hd graphics|iris/i.test(name) || (cores <= 4 && memory <= 8));
  const mode = software ? "software" : integrated ? "integrated" : "discrete";
  return { mode, name } as const;
}

function preferredHands(): "tilt" | "stick" {
  if (typeof window === "undefined") return "stick";
  return window.matchMedia("(pointer: coarse)").matches ? "tilt" : "stick";
}

export function Race() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const lapRef = useRef<HTMLSpanElement>(null);
  const placeRef = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const noxRef = useRef<HTMLSpanElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const thoughtRef = useRef<HTMLDivElement>(null);
  const thoughtNodes = useRef(new Map<string, HTMLDivElement>());
  const portraitRef = useRef<HTMLCanvasElement>(null);
  const kartPortraitRef = useRef<HTMLCanvasElement>(null);
  const sendToRef = useRef<HTMLInputElement>(null);
  const sendAmtRef = useRef<HTMLInputElement>(null);
  const crownedRef = useRef("");
  const bannerRef = useRef<HTMLParagraphElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const standRef = useRef<HTMLUListElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<Sim | null>(null);
  const netRef = useRef<RaceNet | null>(null);
  const faceRef = useRef<FaceImage | null>(null);
  const botFaces = useRef<Map<string, FaceImage>>(new Map());
  const orbitRef = useRef({ yaw: 0, pitch: 0 });
  const lookingRef = useRef(false);
  const lookPoint = useRef<{ id: number; x: number; y: number } | null>(null);
  const audioRef = useRef<RaceAudio | null>(null);
  const boardRef = useRef<{ announce: (card: { code: string; course: string; host: string; live: boolean; gun?: number }) => void; post: (catalog: string) => void; close: () => void } | null>(null);
  const walletRef = useRef<Wallet | null>(null);
  const yardRef = useRef<Yard>(loadYard());
  const offerRef = useRef<Offer[]>(loadOffers());
  const netCodeRef = useRef("");
  const joinGen = useRef(0);
  const gunAtRef = useRef(0);
  const purseRef = useRef<(OpenPurse & { paid: boolean }) | null>(null);
  const racedRef = useRef(new Set<string>());
  const minerRef = useRef<{ setPower: (power: number) => void; stop: () => void } | null>(null);
  const weatherRef = useRef(12);
  const armRef = useRef(false);
  const leaveRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<"menu" | "live">("menu");
  const [seat, setSeat] = useState<"pick" | "host" | "wait" | "purse">("pick");
  const [courseId, setCourseId] = useState(COURSES[0]!.id);
  const [rooms, setRooms] = useState<ListedRoom[]>([]);
  const [boardNote, setBoardNote] = useState("Looking for rooms…");
  const [roomCode, setRoomCode] = useState("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [yard, setYard] = useState<Yard>(yardRef.current);
  const [offers, setOffers] = useState<Offer[]>(offerRef.current);
  const [book, setBook] = useState<Holdings | null>(null);
  const syncRef = useRef<() => void>(() => {});
  const [desk, setDesk] = useState<"race" | "yard" | "purse" | "wallet" | "chain">("race");
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [yardNote, setYardNote] = useState("");
  const [lobby, setLobby] = useState<RoomPerson[]>([]);
  const [purses, setPurses] = useState<OpenPurse[]>([]);
  const [board, setBoard] = useState(market);
  const [blocks, setBlocks] = useState(recentBlocks);
  const [sizePick, setSizePick] = useState(4);
  const [stakePick, setStakePick] = useState<"s" | "h">("s");
  const [talk, setTalk] = useState("ada");
  const [mine, setMine] = useState<MineStatus>({ height: 0, rate: "0 H/s", power: 10, gpu: false, load: 0, mined: 0, detail: "" });
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState("");
  const [muted, setMuted] = useState(false);
  const [hands, setHands] = useState<"tilt" | "stick">(preferredHands);
  const setMutedRef = useRef(setMuted);
  setMutedRef.current = setMuted;

  useEffect(() => {
    if (phase !== "menu" || desk !== "yard") return;
    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - last < 80) return;
      last = now;
      const time = now / 1000;
      const selected = yardRef.current.carts.find((cart) => cart.id === yardRef.current.selected);
      const crewId = selected && selected.mechanic !== "stock" ? selected.mechanic : talk;
      const tint = mechanicById(crewId).color;
      const face = portraitRef.current?.getContext("2d");
      const body = kartPortraitRef.current?.getContext("2d");
      if (face) paintPortrait(face, "mechanic", tint, time);
      if (body) paintPortrait(body, "kart", tint, time);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [phase, desk, talk, yard.selected]);

  useEffect(() => {
    const sim = createSim();
    sim.hands = preferredHands();
    simRef.current = sim;
    installProbe(sim);
    const audio = createRaceAudio();
    audioRef.current = audio;
    for (const kart of sim.karts) {
      if (kart.ai) botFaces.current.set(kart.id, paintFace(kart.seed));
    }
    faceRef.current = paintFace(7);
    try {
      const stored = localStorage.getItem("facerace-face");
      if (stored?.startsWith("data:image")) {
        void faceFromUrl(stored).then((img) => {
          if (img) faceRef.current = img;
        });
      } else if (faceRef.current.url) {
        rememberFace(faceRef.current.url);
      }
    } catch {
      /* private mode */
    }
    if (sim.karts[0]) sim.karts[0].name = savedName();
    if (nameRef.current && nameRef.current.value === "You") nameRef.current.value = savedName();
    const budget = pictureBudget();

    let closedBoard = false;
    let unwatch = () => {};
    void openWallet().then((opened) => {
      if (closedBoard) return;
      walletRef.current = opened;
      setWallet(opened);
      minerRef.current = startMiner({
        address: opened.address,
        allowGpu: budget.mode === "discrete",
        onStatus: (status) => {
          if (closedBoard) return;
          setMine((prev) =>
            prev.height === status.height &&
            prev.rate === status.rate &&
            prev.power === status.power &&
            prev.gpu === status.gpu &&
            prev.load === status.load &&
            prev.mined === status.mined &&
            prev.detail === status.detail
              ? prev
              : status,
          );
        },
        onReward: () => syncRef.current(),
      });
      const sync = () => {
        const purse = walletRef.current;
        if (!purse || closedBoard) return;
        const held = holdings(purse.address);
        const nextPurse = writePurse(purse, held.chips);
        walletRef.current = nextPurse;
        const carts = [{ id: "stock", mechanic: "stock" }, ...held.carts];
        const selected = carts.some((cart) => cart.id === yardRef.current.selected) ? yardRef.current.selected : "stock";
        const nextYard = writeYard({ carts, selected });
        yardRef.current = nextYard;
        const owned = new Set(carts.map((cart) => cart.id));
        const offers = offerRef.current.filter((offer) => owned.has(offer.cartId));
        if (offers.length !== offerRef.current.length) offerRef.current = writeOffers(offers);
        setWallet(nextPurse);
        setYard(nextYard);
        setOffers(offerRef.current);
        setBook(held);
        setPurses(purseTable());
        setBoard(market());
        setBlocks(recentBlocks(6));
      };
      syncRef.current = sync;
      sync();
      unwatch = watchChain(() => sync());
    });
    void openBoard(
      (found, note) => {
        if (closedBoard) return;
        setRooms(found);
        setBoardNote(note);
      },
      (found, pays) => {
        if (closedBoard) return;
        void (async () => {
          const real: MarketListing[] = [];
          for (const listing of found) {
            if (await listingIsReal(listing.mechanic, listing.price, listing.seller, listing.nonce, listing.cartId, listing.x, listing.y, listing.sig)) real.push(listing);
          }
          if (!closedBoard) setListings(real);
        })();
      },
    ).then((board) => {
      if (closedBoard) board.close();
      else boardRef.current = board;
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const blockSelect = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea")) return;
      event.preventDefault();
    };
    canvas.parentElement?.addEventListener("selectstart", blockSelect);
    let alive = true;
    let paintWorker: Worker | null = null;
    let paintGen = 0;

    const fitSize = () => {
      const box = canvas.parentElement?.getBoundingClientRect();
      const cssW = box?.width || window.innerWidth || 960;
      const cssH = box?.height || window.innerHeight || 540;
      const cap = budget.mode === "integrated" ? 960 : budget.mode === "software" ? 480 : 960;
      const scale = Math.min(1, cap / Math.max(1, cssW, cssH));
      return {
        viewW: Math.max(2, Math.floor(cssW * scale)),
        viewH: Math.max(2, Math.floor(cssH * scale)),
      };
    };

    const keysDown = (event: KeyboardEvent) => setKey(event, true);
    const keysUp = (event: KeyboardEvent) => setKey(event, false);
    function setKey(event: KeyboardEvent, down: boolean) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const simNow = simRef.current;
      if (!simNow) return;
      const tracked = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ShiftLeft", "ShiftRight"];
      if (event.code === "Escape" && down) {
        event.preventDefault();
        leaveRef.current();
        return;
      }
      if (event.code === "KeyM" && down) {
        event.preventDefault();
        audio.resume();
        setMutedRef.current(audio.toggle());
        return;
      }
      if (!tracked.includes(event.code)) return;
      event.preventDefault();
      if (down) simNow.keys.add(event.code);
      else simNow.keys.delete(event.code);
    }
    const blur = () => {
      sim.keys.clear();
      sim.touch.clear();
      sim.steer = 0;
      sim.stick = 0;
      sim.gas = 0;
      sim.pedal = 0;
      sim.brake = 0;
      sim.boost = 0;
      sim.lean = 0;
    };
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
    window.addEventListener("blur", blur);

    let tiltZero: number | null = null;
    let pitchZero: number | null = null;
    const onTilt = (event: DeviceOrientationEvent) => {
      const current = simRef.current;
      if (!current || current.hands !== "tilt") return;
      const roll = screenRoll(event);
      const pitch = screenPitch(event);
      if (tiltZero == null) tiltZero = roll;
      if (pitchZero == null) pitchZero = pitch;
      const delta = roll - tiltZero;
      const dead = 4;
      const mag = Math.max(0, Math.abs(delta) - dead);
      current.tilt = clampUnit(-(Math.sign(delta) * mag) / 18);
      const lifted = pitch - pitchZero;
      const pitchDead = 8;
      const pitchMag = Math.max(0, Math.abs(lifted) - pitchDead);
      current.lean = clampUnit((Math.sign(lifted) * pitchMag) / 20);
    };
    const resetTilt = () => {
      tiltZero = null;
      pitchZero = null;
    };
    window.addEventListener("deviceorientation", onTilt);
    screen.orientation?.addEventListener("change", resetTilt);

    let smooth = chaseCamera(sim.karts[0]!);
    let prevYaw = sim.karts[0]!.yaw;
    let acc = 0;
    let last = performance.now();
    let faceAt = 0;
    let faceSavedAt = 0;
    let sentFace = "";
    let hudAt = 0;
    let raf = 0;
    let ambAt = 0;
    let viewW = 960;
    let viewH = 540;

    const tune = budget.mode === "integrated" ? { spheres: 80, boxes: 8, shapes: 64 } : undefined;
    const boot = () => {
      const size = fitSize();
      viewW = size.viewW;
      viewH = size.viewH;
      canvas.width = viewW;
      canvas.height = viewH;
      const ctx2d = canvas.getContext("2d");
      const worker = new Worker(new URL("./paint.worker.ts", import.meta.url), { type: "module" });
      paintWorker = worker;
      const mine = ++paintGen;
      worker.onmessage = (event: MessageEvent<{ type?: string; bitmap?: ImageBitmap }>) => {
        if (mine !== paintGen) {
          event.data.bitmap?.close();
          return;
        }
        const bitmap = event.data.bitmap;
        if (!bitmap || !ctx2d) return;
        ctx2d.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
      };
      worker.postMessage({ cmd: "init", mode: budget.mode, tune, viewW, viewH });
      let resizeWait = 0;
      const onResize = () => {
        if (!alive || mine !== paintGen) return;
        window.clearTimeout(resizeWait);
        resizeWait = window.setTimeout(() => {
          const next = fitSize();
          if (next.viewW === viewW && next.viewH === viewH) return;
          viewW = next.viewW;
          viewH = next.viewH;
          canvas.width = viewW;
          canvas.height = viewH;
          worker.postMessage({ cmd: "resize", viewW, viewH });
        }, 400);
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        worker.postMessage({ cmd: "stop" });
        worker.terminate();
      };
    };
    const bootDone = Promise.resolve(boot());

    const frameLoop = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frameLoop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      weatherRef.current += dt;
      const current = simRef.current;
      if (!current) return;
      const gun = gunAtRef.current;
      if (gun && !current.running) {
        const left = gun - Date.now();
        current.banner = left > 0 ? `Flag in ${(left / 1000).toFixed(1)}` : "Go";
        if (left <= 0) {
          current.running = true;
          audioRef.current?.cue("horn", 1, 0);
        }
      }
      const remotes = netRef.current?.racers() ?? [];
      const peers = remotes.map((remote) => ({
        x: remote.x,
        y: remote.y,
        z: remote.z,
        vx: remote.vx,
        vy: remote.vy,
        vz: remote.vz,
        radius: 0.82,
        mass: 4,
      }));
      acc += dt;
      let guard = 0;
      while (acc >= 1 / 60 && guard < 5) {
        stepSim(current, 1 / 60, peers);
        acc -= 1 / 60;
        guard += 1;
      }
      const player = current.karts[0]!;
      const yawRate = Math.atan2(Math.sin(player.yaw - prevYaw), Math.cos(player.yaw - prevYaw)) / Math.max(dt, 1 / 120);
      prevYaw = player.yaw;
      const video = videoRef.current;
      if (video && video.readyState >= 2 && now - faceAt > 250) {
        faceAt = now;
        const face = paintFace(player.seed, video);
        faceRef.current = face;
        if (face.url && now - faceSavedAt > 2000) {
          faceSavedAt = now;
          rememberFace(face.url);
        }
        paintWorker?.postMessage({ cmd: "face", seed: player.seed, width: face.width, height: face.height, data: face.data }, [face.data.buffer]);
        sentFace = face.url;
      }
      const heldFace = faceRef.current;
      if (paintWorker && heldFace?.url && heldFace.url !== sentFace && heldFace.data?.byteLength) {
        paintWorker.postMessage({
          cmd: "face",
          seed: player.seed,
          width: heldFace.width,
          height: heldFace.height,
          data: heldFace.data.slice(),
        });
        sentFace = heldFace.url;
      }
      const orbit = orbitRef.current;
      if (!lookingRef.current) {
        const settle = Math.exp(-dt * 0.9);
        orbit.yaw *= settle;
        orbit.pitch *= settle;
      }
      const want = chaseCamera(player, 7.5, orbit);
      const blend = 1 - Math.exp(-dt * 5.5);
      smooth = {
        x: smooth.x + (want.x - smooth.x) * blend,
        y: smooth.y + (want.y - smooth.y) * blend,
        z: smooth.z + (want.z - smooth.z) * blend,
        dir: [
          smooth.dir[0] + (want.dir[0] - smooth.dir[0]) * blend,
          smooth.dir[1] + (want.dir[1] - smooth.dir[1]) * blend,
          smooth.dir[2] + (want.dir[2] - smooth.dir[2]) * blend,
        ],
      };
      const len = Math.hypot(smooth.dir[0], smooth.dir[1], smooth.dir[2]) || 1;
      smooth.dir = [smooth.dir[0] / len, smooth.dir[1] / len, smooth.dir[2] / len];
      current.shake *= Math.exp(-dt * 8);
      const kick = Math.sin(current.time * 46) * current.shake * 0.16;
      const view = {
        x: smooth.x + smooth.dir[1] * kick,
        y: smooth.y - smooth.dir[0] * kick,
        z: smooth.z + kick * 0.35,
        dir: [smooth.dir[0], smooth.dir[1], smooth.dir[2] - kick * 0.05] as [number, number, number],
      };

      const slip = Math.min(1, Math.abs(yawRate) / 2.2);
      let near = current.karts[1] ?? null;
      let nearD = 48;
      for (const kart of current.karts) {
        if (kart === player) continue;
        const d = Math.hypot(kart.x - player.x, kart.y - player.y);
        if (d < nearD) {
          near = kart;
          nearD = d;
        }
      }
      audio.drive(player.speed, slip, current.running);
      if (near) {
        const heard = hearAt(player, player.yaw, near, 46);
        audio.rivalDrive(near.speed, heard?.pan ?? 0, current.running ? (heard?.gain ?? 0) : 0);
      }
      if (current.events.length) {
        for (const ev of current.events) audio.cue(ev.kind, ev.amount, 0);
        current.events.length = 0;
      }
      if (now - ambAt > 500) {
        ambAt = now;
        audio.ambient(now / 1000, player, current.running);
      }

      const settled = !lookingRef.current && (Math.abs(player.speed) < 1.2 || !current.running);
      paintWorker?.postMessage({
        cmd: "frame",
        bodies: [
          ...current.karts.map((kart) => ({
            x: kart.x,
            y: kart.y,
            z: kart.z,
            yaw: kart.yaw,
            pitch: kart.pitch,
            roll: kart.roll,
            flame: kart.flame ? 1 : 0,
            color: kart.color,
            seed: kart.seed,
            name: kart.name,
          })),
          ...remotes.map((remote) => ({
            x: remote.x,
            y: remote.y,
            z: remote.z,
            yaw: remote.yaw,
            pitch: remote.pitch,
            roll: remote.roll,
            color: remote.color,
            seed: remote.name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 3),
            name: remote.name,
          })),
        ],
        camera: view,
        still: settled,
        rain: rainAt(weatherRef.current),
        sun: raceSun(weatherRef.current),
        course: course().id,
        skids: current.skids,
      });
      const bubbles = [
        ...current.karts
          .filter((kart) => kart !== player)
          .map((kart) => ({
            key: kart.id,
            url: botFaces.current.get(kart.id)?.url || "",
            x: kart.x,
            y: kart.y,
            z: kart.z,
          })),
        ...remotes.map((remote) => ({
          key: remote.id,
          url: remote.face?.url || "",
          x: remote.x,
          y: remote.y,
          z: remote.z,
        })),
      ];
      drawThoughts(thoughtRef.current, thoughtNodes.current, player, bubbles, view);
      for (const mark of current.skidOut.splice(0)) {
        netRef.current?.say(JSON.stringify({ t: "skid", x: mark.x, y: mark.y, x2: mark.x2, y2: mark.y2 }));
      }
      netRef.current?.tick(
        {
          x: player.x,
          y: player.y,
          z: player.z,
          vx: player.vx,
          vy: player.vy,
          vz: player.vz,
          yaw: player.yaw,
          speed: player.speed,
          yawRate,
          air: player.air,
          pitch: player.pitch,
          roll: player.roll,
          name: player.name,
          faceUrl: faceRef.current?.url || "",
          travel: player.travel,
          done: player.finishedAt != null,
        },
        current.time,
      );
      if (now - hudAt > 80) {
        hudAt = now;
        if (speedRef.current) speedRef.current.textContent = String(Math.round(Math.abs(player.speed) * 8));
        if (lapRef.current) lapRef.current.textContent = `${lapOf(player)} / ${lapCount()} · ${player.gate + 1}/8`;
        if (placeRef.current) placeRef.current.textContent = ordinal(placeOf(current, player));
        if (noxRef.current) noxRef.current.style.transform = `scaleX(${Math.max(0, Math.min(1, player.nox))})`;
        drawMap(mapRef.current, current, remotes);
        const race = purseRef.current;
        if (race && !race.paid && player.finishedAt != null) {
          const beaten = (netRef.current?.people() ?? []).some((person) => person.done);
          if (!beaten) {
            race.paid = true;
            const pot = race.stake * race.size;
            const purse = walletRef.current;
            if (purse) {
              void (async () => {
                const held = holdings(purse.address);
                const tx = await signTx(purse, {
                  kind: "claim",
                  nonce: held.nonce + 1,
                  mechanic: yardRef.current.selected,
                  cartId: race.key,
                  seller: purse.address,
                  price: pot,
                  ask: "",
                  askNonce: race.epoch,
                  sx: "",
                  sy: "",
                });
                const err = await submitTx(tx);
                current.banner = err || `Won ${pot}`;
                syncRef.current();
              })();
            }
          }
        } else if (player.finishedAt != null && yardRef.current.selected !== "stock") {
          const token = `${yardRef.current.selected}:${player.finishedAt}`;
          if (crownedRef.current !== token) {
            crownedRef.current = token;
            const purse = walletRef.current;
            const cartId = yardRef.current.selected;
            if (purse) {
              void (async () => {
                const held = holdings(purse.address);
                const tx = await signTx(purse, {
                  kind: "crown",
                  nonce: held.nonce + 1,
                  mechanic: cartId,
                  cartId,
                  seller: "",
                  price: 0,
                  ask: "",
                  askNonce: 0,
                  sx: "",
                  sy: "",
                });
                await submitTx(tx);
                syncRef.current();
              })();
            }
          }
        }
        if (clockRef.current) {
          const shown = player.finishedAt ?? current.time;
          clockRef.current.textContent = current.running ? fmt(shown) : "0:00.00";
        }
        if (bannerRef.current) bannerRef.current.textContent = current.banner;
        if (standRef.current) {
          const order = [...current.karts].sort((a, b) => placeOf(current, a) - placeOf(current, b));
          const items = standRef.current.querySelectorAll("li");
          order.forEach((kart, index) => {
            const row = items[index];
            if (!row) return;
            row.textContent = `${kart.name}${kart.finishedAt != null ? "  ·  " + fmt(kart.finishedAt) : ""}`;
            row.classList.toggle("is-you", !kart.ai);
          });
        }
      }
    };
    raf = requestAnimationFrame(frameLoop);

    return () => {
      alive = false;
      unwatch();
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", keysDown);
      window.removeEventListener("keyup", keysUp);
      window.removeEventListener("blur", blur);
      window.removeEventListener("deviceorientation", onTilt);
      screen.orientation?.removeEventListener("change", resetTilt);
      canvas.parentElement?.removeEventListener("selectstart", blockSelect);
      closedBoard = true;
      minerRef.current?.stop();
      boardRef.current?.close();
      void bootDone.then((off) => off?.());
      audio.close();
      audioRef.current = null;
      joinGen.current += 1;
      netRef.current?.close();
      netRef.current = null;
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function holdStick(clientX: number, clientY: number) {
    const pad = stickRef.current;
    const sim = simRef.current;
    if (!pad || !sim) return;
    const rect = pad.getBoundingClientRect();
    const max = rect.width * 0.34;
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const mag = Math.hypot(dx, dy) || 1;
    if (mag > max) {
      dx *= max / mag;
      dy *= max / mag;
    }
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    sim.stick = clampUnit(-dx / max);
    sim.gas = clampUnit(-dy / max);
  }

  function releaseStick() {
    const sim = simRef.current;
    if (sim) {
      sim.stick = 0;
      sim.gas = 0;
    }
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
  }

  function holdPedal(value: number, event: React.PointerEvent) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const sim = simRef.current;
    if (sim) sim.pedal = value;
  }

  function releasePedal() {
    const sim = simRef.current;
    if (sim) sim.pedal = 0;
  }

  function holdHold(which: "brake" | "boost", event: React.PointerEvent) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const sim = simRef.current;
    if (sim) sim[which] = 1;
  }

  function releaseHold(which: "brake" | "boost") {
    const sim = simRef.current;
    if (sim) sim[which] = 0;
  }

  async function toggleHands() {
    const sim = simRef.current;
    if (!sim) return;
    const next = sim.hands === "tilt" ? "stick" : "tilt";
    sim.hands = next;
    sim.tilt = 0;
    sim.stick = 0;
    sim.gas = 0;
    sim.pedal = 0;
    sim.brake = 0;
    sim.boost = 0;
    sim.lean = 0;
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
    setHands(next);
    if (next !== "tilt") return;
    const orient = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof orient.requestPermission === "function") {
      try {
        await orient.requestPermission();
      } catch {
        /* tilt stays unused */
      }
    }
  }

  function lookDown(event: React.PointerEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.closest(".stick, .pedals, .assist, .race-mode, button, input, a, .race-card, .race-sideways")) return;
    lookingRef.current = true;
    lookPoint.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function lookMove(event: React.PointerEvent) {
    const point = lookPoint.current;
    if (!point || point.id !== event.pointerId) return;
    const dx = event.clientX - point.x;
    const dy = event.clientY - point.y;
    point.x = event.clientX;
    point.y = event.clientY;
    const orbit = orbitRef.current;
    orbit.yaw += dx * 0.005;
    orbit.pitch = Math.max(-0.55, Math.min(0.85, orbit.pitch - dy * 0.0035));
  }

  function lookUp(event: React.PointerEvent) {
    if (lookPoint.current?.id === event.pointerId) {
      lookPoint.current = null;
      lookingRef.current = false;
    }
  }

  async function useCamera() {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 256, height: 256 },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamOn(true);
    } catch {
      setCamError("Camera stayed off — you’ll race a painted face.");
    }
  }

  function dropNet() {
    joinGen.current += 1;
    netRef.current?.close();
    netRef.current = null;
    netCodeRef.current = "";
  }

  function leaveRace() {
    dropNet();
    const sim = simRef.current;
    if (sim) {
      sim.running = false;
      sim.keys.clear();
      sim.touch.clear();
      sim.steer = 0;
      sim.stick = 0;
      sim.gas = 0;
      sim.pedal = 0;
      sim.brake = 0;
      sim.boost = 0;
      sim.lean = 0;
      sim.banner = "";
    }
    armRef.current = false;
    gunAtRef.current = 0;
    netCodeRef.current = "";
    purseRef.current = null;
    crownedRef.current = "";
    setLobby([]);
    setSeat("pick");
    setPhase("menu");
  }
  leaveRef.current = leaveRace;

  function leaveLobby() {
    dropNet();
    setLobby([]);
    setSeat("pick");
  }

  async function ensureNet(code: string) {
    if (!code) return null;
    if (netRef.current && netCodeRef.current === code) return netRef.current;
    const gen = ++joinGen.current;
    netRef.current?.close();
    netRef.current = null;
    netCodeRef.current = code;
    const { createRaceNet } = await import("./net");
    const net = await createRaceNet(code, (line) => {
      if (statusRef.current) statusRef.current.textContent = line;
    });
    if (gen !== joinGen.current) {
      net.close();
      return null;
    }
    net.onSay((_from, text) => {
      try {
        const msg = JSON.parse(text) as { t?: string; at?: number; course?: string };
        if (msg.t === "gun" && msg.at) {
          const ids = [...net.people().map((person) => person.id), net.id()].sort();
          void launch(msg.course || courseId, code, msg.at, true, Math.max(0, ids.indexOf(net.id())));
        }
      } catch {
        /* not a race message */
      }
    });
    const name = nameRef.current?.value.trim().slice(0, 16) || "You";
    rememberName(name);
    net.setIdentity(name, faceRef.current?.url || "");
    net.onSkid((mark) => {
      const sim = simRef.current;
      if (!sim) return;
      sim.skids.push(mark);
      if (sim.skids.length > 28) sim.skids.shift();
    });
    netRef.current = net;
    return net;
  }

  async function launch(courseName: string, code: string, at: number, humans: boolean, slot = 0) {
    const sim = simRef.current;
    if (!sim || sim.running || armRef.current) return;
    armRef.current = true;
    gunAtRef.current = at;
    const name = nameRef.current?.value.trim().slice(0, 16) || "You";
    rememberName(name);
    if (humans) parkHuman(sim, courseName, name, slot);
    else parkOn(sim, courseName);
    sim.karts[0]!.name = name;
    const built = specOf(yardRef.current);
    const owned = holdings(walletRef.current?.address || "").carts.find((item) => item.id === yardRef.current.selected);
    const crew = holdings(walletRef.current?.address || "").jobs.find((job) => job.id === built.id);
    const skill = crew && crew.boss === walletRef.current?.address ? 1 + (crew.skill - 1) * 0.02 : 1;
    sim.cart = {
      speed: built.speed * skill,
      turn: built.turn,
      grip: built.grip,
      color: built.color,
      wings: owned?.wings,
      rudder: owned?.rudder,
    };
    sim.karts[0]!.color = built.color;
    const orient = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof orient.requestPermission === "function") {
      try {
        await orient.requestPermission();
      } catch {
        /* tilt stays unused */
      }
    }
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) {
      try {
        await document.documentElement.requestFullscreen();
        await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> })?.lock?.("landscape");
      } catch {
        /* desktop, or the browser refused */
      }
    }
    if (Date.now() >= at) {
      sim.running = true;
      audioRef.current?.cue("horn", 1, 0);
    } else sim.banner = "Hold for the flag";
    setPhase("live");
    setSeat("pick");
    audioRef.current?.resume();
    if (!code) {
      if (statusRef.current) statusRef.current.textContent = "Solo heat";
      return;
    }
    boardRef.current?.announce({ code, course: courseName, host: name, live: true, gun: at });
    await ensureNet(code);
    netRef.current?.setIdentity(name, faceRef.current?.url || "");
  }

  function begin(code: string, courseName: string) {
    void launch(courseName, code, Date.now(), false);
  }

  function createRoom() {
    const code = freshCode();
    const name = nameRef.current?.value.trim().slice(0, 16) || "You";
    setRoomCode(code);
    setSeat("host");
    boardRef.current?.announce({ code, course: courseId, host: name, live: false });
    if (statusRef.current) statusRef.current.textContent = "Room posted";
  }

  function startTogether() {
    const at = lobby.length ? Date.now() + 3000 : Date.now();
    if (lobby.length && netRef.current) {
      netRef.current.say(JSON.stringify({ t: "gun", at, course: courseId }));
      return;
    }
    void launch(courseId, roomCode, Date.now(), false);
  }

  async function hireMechanic(id: string) {
    const purse = walletRef.current;
    if (!purse) return;
    const mechanic = mechanicById(id);
    const held = holdings(purse.address);
    if (held.chips < mechanic.cost) {
      setYardNote("Not enough chips.");
      return;
    }
    const nonce = held.nonce + 1;
    const tx = await signTx(purse, {
      kind: "hire",
      nonce,
      mechanic: id,
      cartId: cartIdFor(id, purse.address, nonce),
      seller: "",
      price: mechanic.cost,
      ask: "",
      askNonce: 1,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || `${mechanic.name} mints when the next block confirms it.`);
    syncRef.current();
  }

  async function poachMechanic(id: string) {
    const purse = walletRef.current;
    if (!purse) return;
    const mechanic = mechanicById(id);
    const job = book?.jobs.find((item) => item.id === id);
    const price = Math.max(job?.wage ?? mechanic.cost, mechanic.cost) + 4;
    const held = holdings(purse.address);
    if (held.chips < price) {
      setYardNote("Not enough chips to poach.");
      return;
    }
    const tx = await signTx(purse, {
      kind: "poach",
      nonce: held.nonce + 1,
      mechanic: id,
      cartId: "poach",
      seller: job?.boss || "",
      price,
      ask: "",
      askNonce: 0,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || `${mechanic.name} changes crews when the block confirms ${price}.`);
    syncRef.current();
  }

  async function fitPart(kind: "wing" | "rudder") {
    const purse = walletRef.current;
    const cartId = yardRef.current.selected;
    if (!purse || cartId === "stock") {
      setYardNote("Mint a cart before fitting parts.");
      return;
    }
    const held = holdings(purse.address);
    const tx = await signTx(purse, {
      kind,
      nonce: held.nonce + 1,
      mechanic: kind === "wing" ? "oil" : "battery",
      cartId,
      seller: "",
      price: kind === "wing" ? 8 : 6,
      ask: "",
      askNonce: kind === "wing" ? 2 : 1,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || `${kind === "wing" ? "Wings" : "A rudder"} fits when the next block confirms it.`);
    syncRef.current();
  }

  async function sendValue(token: string, to: string, amount: number) {
    const purse = walletRef.current;
    if (!purse) return;
    const who = to.trim();
    if (!who) {
      setYardNote("Name a wallet.");
      return;
    }
    const held = holdings(purse.address);
    const tx = await signTx(purse, {
      kind: "send",
      nonce: held.nonce + 1,
      mechanic: token === "chips" ? "" : token,
      cartId: "send",
      seller: who,
      price: token === "chips" ? amount : 0,
      ask: "",
      askNonce: token === "chips" ? 0 : amount,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || `Sending when the next block confirms it.`);
    syncRef.current();
  }

  async function swapToken(token: "oil" | "battery" | "engine", side: "buy" | "sell", spend = 4) {
    const purse = walletRef.current;
    if (!purse) return;
    const held = holdings(purse.address);
    const tx = await signTx(purse, {
      kind: "swap",
      nonce: held.nonce + 1,
      mechanic: token,
      cartId: side,
      seller: "",
      price: side === "buy" ? spend : 0,
      ask: "",
      askNonce: side === "sell" ? 1 : 0,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || `${side === "buy" ? "Buy" : "Sell"} ${token} waits for a block.`);
    syncRef.current();
  }

  async function listMaterial(token: "oil" | "battery" | "engine") {
    const purse = walletRef.current;
    if (!purse) return;
    const held = holdings(purse.address);
    const tx = await signTx(purse, {
      kind: "listmat",
      nonce: held.nonce + 1,
      mechanic: token,
      cartId: "list",
      seller: purse.address,
      price: token === "engine" ? 8 : 3,
      ask: "",
      askNonce: 1,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || `Listed 1 ${token}.`);
    syncRef.current();
  }

  async function buyMaterial(id: string, cost: number) {
    const purse = walletRef.current;
    if (!purse) return;
    const held = holdings(purse.address);
    const tx = await signTx(purse, {
      kind: "buymat",
      nonce: held.nonce + 1,
      mechanic: "",
      cartId: id,
      seller: "",
      price: cost,
      ask: "",
      askNonce: 0,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || "The trade waits for a block.");
    syncRef.current();
  }

  async function dropMaterial(id: string) {
    const purse = walletRef.current;
    if (!purse) return;
    const held = holdings(purse.address);
    const tx = await signTx(purse, {
      kind: "dropmat",
      nonce: held.nonce + 1,
      mechanic: "",
      cartId: id,
      seller: "",
      price: 0,
      ask: "",
      askNonce: 0,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || "The listing comes back when the block confirms it.");
    syncRef.current();
  }

  async function listOnChain(cartId: string) {
    const purse = walletRef.current;
    const selected = yardRef.current.carts.find((cart) => cart.id === cartId);
    if (!purse || !selected || selected.mechanic === "stock") {
      setYardNote("Pick a built cart to list.");
      return;
    }
    const held = holdings(purse.address);
    const price = mechanicById(selected.mechanic).cost;
    const tx = await signTx(purse, {
      kind: "list",
      nonce: held.nonce + 1,
      mechanic: selected.mechanic,
      cartId,
      seller: purse.address,
      price,
      ask: "",
      askNonce: 0,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || `${mechanicById(selected.mechanic).name} goes on the chain in the next block.`);
    setDesk("purse");
    syncRef.current();
  }

  async function listSelected(cartId: string) {
    const purse = walletRef.current;
    const selected = yardRef.current.carts.find((cart) => cart.id === cartId);
    if (!purse || !selected || selected.mechanic === "stock") {
      setYardNote("Pick a built cart to list.");
      return;
    }
    const price = mechanicById(selected.mechanic).cost;
    const signed = await signListing(purse, selected.mechanic, price, selected.id);
    const offer: Offer = {
      cartId: selected.id,
      mechanic: selected.mechanic,
      price,
      seller: signed.wallet.address,
      nonce: signed.nonce,
      x: signed.wallet.x,
      y: signed.wallet.y,
      sig: signed.sig,
    };
    offerRef.current = putOffer(offerRef.current, offer);
    setOffers(offerRef.current);
    boardRef.current?.post(`s|${selected.mechanic}|${price}|${signed.wallet.address}|${signed.nonce}|${selected.id}|${signed.wallet.x}|${signed.wallet.y}|${signed.sig}`);
    walletRef.current = signed.wallet;
    setWallet(signed.wallet);
    setYardNote(`${mechanicById(selected.mechanic).name} is posted on the trackers. A buy still confirms on chain.`);
    setDesk("purse");
  }

  function cancelOffer(cartId: string) {
    offerRef.current = pullOffer(offerRef.current, cartId);
    setOffers(offerRef.current);
    setYardNote("Pulled the tracker listing.");
    if (offerRef.current.length === 0) boardRef.current?.post("");
  }

  async function buyChain(cartId: string, seller: string, price: number, mechanic: string) {
    const purse = walletRef.current;
    if (!purse) return;
    if (seller === purse.address) {
      const held = holdings(purse.address);
      const tx = await signTx(purse, {
        kind: "drop",
        nonce: held.nonce + 1,
        mechanic,
        cartId,
        seller: purse.address,
        price,
        ask: "",
        askNonce: 0,
        sx: "",
        sy: "",
      });
      const err = await submitTx(tx);
      setYardNote(err || "Pull waits for the next block.");
      syncRef.current();
      return;
    }
    const held = holdings(purse.address);
    if (held.chips < price) {
      setYardNote("Not enough chips.");
      return;
    }
    const tx = await signTx(purse, {
      kind: "buy",
      nonce: held.nonce + 1,
      mechanic,
      cartId,
      seller,
      price,
      ask: "",
      askNonce: 0,
      sx: "",
      sy: "",
    });
    const err = await submitTx(tx);
    setYardNote(err || "Buy waits for the next block.");
    syncRef.current();
  }

  async function buyListing(listing: MarketListing) {
    const purse = walletRef.current;
    if (!purse) return;
    if (listing.seller === purse.address) {
      cancelOffer(listing.cartId);
      return;
    }
    const held = holdings(purse.address);
    if (held.chips < listing.price) {
      setYardNote("Not enough chips.");
      return;
    }
    const tx = await signTx(purse, {
      kind: "buy",
      nonce: held.nonce + 1,
      mechanic: listing.mechanic,
      cartId: listing.cartId,
      seller: listing.seller,
      price: listing.price,
      ask: listing.sig,
      askNonce: listing.nonce,
      sx: listing.x,
      sy: listing.y,
    });
    const err = await submitTx(tx);
    setYardNote(err || "Buy waits for the next block.");
    syncRef.current();
  }

  async function sitPurse(size: number, stakeId: "s" | "h") {
    const purse = walletRef.current;
    if (!purse) return;
    const row = purseTable().find((item) => item.key === purseKey(size, stakeId));
    if (!row) return;
    if (row.started && !row.seats.includes(purse.address)) {
      setYardNote("That flag already dropped.");
      return;
    }
    if (!row.seats.includes(purse.address)) {
      if (holdings(purse.address).chips < row.stake) {
        setYardNote("Not enough chips for that stake.");
        return;
      }
      const held = holdings(purse.address);
      const tx = await signTx(purse, {
        kind: "seat",
        nonce: held.nonce + 1,
        mechanic: yardRef.current.selected,
        cartId: row.key,
        seller: purse.address,
        price: row.stake,
        ask: "",
        askNonce: row.epoch,
        sx: "",
        sy: "",
      });
      const err = await submitTx(tx);
      if (err) {
        setYardNote(err);
        return;
      }
      setYardNote(`${row.size} karts · ${row.stake} stake. The flag drops when the purse is full and the block lands.`);
    }
    const code = `purse-${row.key}-${row.epoch}`;
    setRoomCode(code);
    setCourseId("stadium");
    setSeat("purse");
    purseRef.current = { ...row, paid: false };
    syncRef.current();
  }

  useEffect(() => {
    if (phase === "live" || (seat !== "host" && seat !== "wait" && seat !== "purse") || !roomCode) return;
    void ensureNet(roomCode);
    const timer = window.setInterval(() => {
      setLobby(netRef.current?.people() ?? []);
    }, 700);
    return () => window.clearInterval(timer);
  }, [seat, roomCode, phase]);

  useEffect(() => {
    if (phase !== "menu" || seat !== "wait") return;
    const hit = rooms.find((room) => room.code === roomCode && room.gun);
    if (!hit) return;
    const ids = [...lobby.map((person) => person.id), netRef.current?.id() || ""].filter(Boolean).sort();
    const me = netRef.current?.id() || "";
    void launch(hit.course, hit.code, hit.gun, true, Math.max(0, ids.indexOf(me)));
  }, [rooms, seat, phase, roomCode, lobby]);

  useEffect(() => {
    if (!wallet || phase !== "menu") return;
    const mine = purses.find((row) => row.started > 0 && row.seats.includes(wallet.address));
    if (!mine) return;
    const token = `${mine.key}:${mine.epoch}`;
    if (racedRef.current.has(token)) return;
    racedRef.current.add(token);
    const at = Math.max(mine.started * 1000 + 4000, Date.now() + 1200);
    const slot = [...mine.seats].sort().indexOf(wallet.address);
    purseRef.current = { ...mine, paid: false };
    void launch("stadium", `purse-${mine.key}-${mine.epoch}`, at, true, Math.max(0, slot));
  }, [purses, wallet, phase]);

  return (
    <div
      className={`race-root ${hands === "tilt" ? "is-tilt" : "is-stick"} ${phase === "menu" ? "is-menu" : ""}`}
      onPointerDown={lookDown}
      onPointerMove={lookMove}
      onPointerUp={lookUp}
      onPointerCancel={lookUp}
    >
      <canvas ref={canvasRef} className="race-canvas" />
      <div ref={thoughtRef} className="thoughts" />
      <canvas ref={mapRef} className="race-map" width={180} height={180} aria-hidden="true" />
      <video ref={videoRef} className="race-video" playsInline muted />
      <div className="race-sideways">
        <p className="race-kicker">Landscape</p>
        <h2>Turn the phone sideways</h2>
        <p>Motion mode tilts to steer. Go and Back drive. Or switch to the stick.</p>
      </div>
      <header className="race-top">
        <div>
          <p className="race-kicker">FaceRace</p>
          <h1 className="race-title">Your face, their faces, one circuit.</h1>
        </div>
        <div className="race-meters">
          <span className="race-meter">
            <Flag aria-hidden="true" />
            <span ref={placeRef}>6th</span>
          </span>
          <span className="race-meter">
            <span ref={lapRef}>1 / 3</span>
          </span>
          <span className="race-meter">
            <Gauge aria-hidden="true" />
            <span ref={speedRef}>0</span>
            <span className="race-unit">km/h</span>
          </span>
          <span className="race-meter" ref={clockRef}>
            0:00.00
          </span>
          <span className="race-meter race-nox" title="Nox">
            <span className="nox-track">
              <span ref={noxRef} />
            </span>
          </span>
          {phase === "live" ? (
            <button
              type="button"
              className="race-pits"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={leaveRace}
            >
              Pits
            </button>
          ) : null}
        </div>
      </header>
      <p ref={bannerRef} className="race-banner" />
      <aside className="race-stand">
        <p className="race-kicker">
          <Users aria-hidden="true" /> Order
        </p>
        <ul ref={standRef}>
          {["You", "Vesper", "Nox", "Ione", "Bram", "Sol"].map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p ref={statusRef} className="race-status">
          Grid is set
        </p>
      </aside>
      {phase === "menu" ? (
        <form
          className="race-card"
          onSubmit={(event) => {
            event.preventDefault();
            if (seat === "host") startTogether();
            else void begin("", courseId);
          }}
        >
          <p className="race-kicker">Pit lane</p>
          {seat === "pick" ? (
            <>
              <div className="desk-row">
                <button type="button" className={desk === "race" ? "is-on" : ""} onClick={() => setDesk("race")}>
                  Race
                </button>
                <button type="button" className={desk === "yard" ? "is-on" : ""} onClick={() => setDesk("yard")}>
                  Yard
                </button>
                <button type="button" className={desk === "purse" ? "is-on" : ""} onClick={() => setDesk("purse")}>
                  Purse
                </button>
                <button type="button" className={desk === "wallet" ? "is-on" : ""} onClick={() => setDesk("wallet")}>
                  Wallet
                </button>
                <button type="button" className={desk === "chain" ? "is-on" : ""} onClick={() => setDesk("chain")}>
                  Chain
                </button>
              </div>
              <p className="race-note">{wallet ? `${shortAddress(wallet.address)} · ${wallet.purse} chips` : "Opening a wallet…"}</p>
              {desk === "race" ? (
                <>
                  <h2>Pick a course.</h2>
                  <label className="pit-name">
                    Name
                    <input
                      ref={nameRef}
                      name="name"
                      defaultValue="You"
                      maxLength={16}
                      autoComplete="nickname"
                      onChange={(event) => rememberName(event.target.value)}
                    />
                  </label>
                  <div className="course-row">
                    {COURSES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`course-chip ${courseId === item.id ? "is-on" : ""}`}
                        onClick={() => setCourseId(item.id)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                  <div className="room-line">
                    {rooms.length === 0 ? <p className="race-note">{boardNote}</p> : null}
                    {rooms.slice(0, 2).map((room) => (
                      <button
                        key={room.id}
                        type="button"
                        className="room-row"
                        onClick={() => {
                          setRoomCode(room.code);
                          setCourseId(room.course);
                          setSeat("wait");
                          if (room.live && !room.gun) void begin(room.code, room.course);
                        }}
                      >
                        <strong>{room.host}</strong>
                        <span>
                          {COURSES.find((item) => item.id === room.course)?.name ?? room.course} · {room.code}
                          {room.live ? " · racing" : " · waiting"}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="race-actions">
                    <button type="button" className="race-ghost" onClick={() => void useCamera()}>
                      <Camera aria-hidden="true" />
                      {camOn ? "Face live" : "Face"}
                    </button>
                    <button type="button" className="race-ghost" onClick={createRoom}>
                      New room
                    </button>
                    <button type="submit" className="race-go">
                      Race
                    </button>
                  </div>
                </>
              ) : null}
              {desk === "yard" ? (
                <>
                  <h2>Mint a cart.</h2>
                  <div className="portrait-row">
                    <canvas ref={portraitRef} className="portrait" width={180} height={96} />
                    <canvas ref={kartPortraitRef} className="portrait" width={180} height={96} />
                  </div>
                  <p className="race-note">
                    Fees split to the developer pool and the bonus purse. Wings are 8 chips and 2 oil. A rudder is 6 chips and 1 battery. Bag · oil {book?.mats.oil ?? 0} · battery {book?.mats.battery ?? 0} · engine {book?.mats.engine ?? 0}
                  </p>
                  <div className="course-row">
                    {yard.carts.map((cart) => {
                      const chain = book?.carts.find((item) => item.id === cart.id);
                      return (
                        <button
                          key={cart.id}
                          type="button"
                          className={`course-chip ${yard.selected === cart.id ? "is-on" : ""}`}
                          onClick={() => {
                            const next = selectCart(yard, cart.id);
                            yardRef.current = next;
                            setYard(next);
                          }}
                        >
                          {mechanicById(cart.mechanic).name}
                          {chain ? ` · ${chain.wins}w` : ""}
                          {chain?.wings ? " · wings" : ""}
                          {chain?.rudder ? " · rudder" : ""}
                        </button>
                      );
                    })}
                  </div>
                  {(() => {
                    const chain = book?.carts.find((item) => item.id === yard.selected);
                    if (!chain) return <p className="race-note">Stock has no record yet. Hire a mechanic to mint one.</p>;
                    return (
                      <p className="race-note">
                        {chain.races} races · {chain.wins} wins · {chain.purseWins} purse wins
                        {chain.wings ? " · wings" : ""}
                        {chain.rudder ? " · rudder" : ""}
                      </p>
                    );
                  })()}
                  <div className="room-line">
                    {MECHANICS.map((mechanic) => {
                      const job = book?.jobs.find((item) => item.id === mechanic.id);
                      const taken = Boolean(job?.boss && job.boss !== wallet?.address);
                      const price = Math.max(job?.wage ?? mechanic.cost, mechanic.cost) + (taken ? 4 : 0);
                      return (
                        <button
                          key={mechanic.id}
                          type="button"
                          className="room-row"
                          onPointerEnter={() => setTalk(mechanic.id)}
                          onFocus={() => setTalk(mechanic.id)}
                          onClick={() => {
                            setTalk(mechanic.id);
                            void (taken ? poachMechanic(mechanic.id) : hireMechanic(mechanic.id));
                          }}
                        >
                          <strong>{mechanic.name}</strong>
                          <span>
                            {mechanic.line} · skill {job?.skill ?? 1}
                            {job?.boss ? ` · ${shortAddress(job.boss)}` : " · free"}
                            {taken ? ` · poach ${price}` : ` · mint ${mechanic.cost}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="race-actions">
                    <button type="button" className="race-ghost" onClick={() => void fitPart("wing")}>
                      Wings · 8
                    </button>
                    <button type="button" className="race-ghost" onClick={() => void fitPart("rudder")}>
                      Rudder · 6
                    </button>
                  </div>
                  {yardNote ? <p className="race-note">{yardNote}</p> : null}
                </>
              ) : null}
              {desk === "purse" ? (
                <>
                  <h2>Your pit.</h2>
                  <p className="race-note">
                    {book?.pending[0]
                      ? `${book.pending[0].kind} ${book.pending[0].mechanic || book.pending[0].cartId} · waiting for a block`
                      : "Nothing is waiting on a block."}
                  </p>
                  <div className="room-line">
                    {yard.carts.filter((cart) => cart.mechanic !== "stock").length === 0 ? (
                      <p className="race-note">You hold the stock kart. Mint one in the yard.</p>
                    ) : null}
                    {yard.carts
                      .filter((cart) => cart.mechanic !== "stock")
                      .slice(0, 2)
                      .map((cart) => {
                        const offer = offers.find((item) => item.cartId === cart.id);
                        const chain = book?.lists.find((item) => item.cartId === cart.id);
                        return (
                          <div key={cart.id} className="room-row">
                            <strong>
                              {mechanicById(cart.mechanic).name}
                              {chain ? " · on chain" : offer ? " · on trackers" : ""}
                            </strong>
                            <span className="row-actions">
                              {chain ? (
                                <button type="button" onClick={() => void buyChain(cart.id, chain.seller, chain.price, chain.mechanic)}>
                                  Pull {chain.price}
                                </button>
                              ) : offer ? (
                                <button type="button" onClick={() => cancelOffer(cart.id)}>
                                  Pull trackers
                                </button>
                              ) : (
                                <>
                                  <button type="button" onClick={() => void listOnChain(cart.id)}>
                                    Chain
                                  </button>
                                  <button type="button" onClick={() => void listSelected(cart.id)}>
                                    Trackers
                                  </button>
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    {book?.lists
                      .filter((item) => item.seller !== wallet?.address)
                      .slice(0, 2)
                      .map((item) => (
                        <button key={item.cartId} type="button" className="room-row" onClick={() => void buyChain(item.cartId, item.seller, item.price, item.mechanic)}>
                          <strong>{mechanicById(item.mechanic).name}</strong>
                          <span>
                            Buy {item.price} · chain · {shortAddress(item.seller)}
                          </span>
                        </button>
                      ))}
                    {listings
                      .filter((listing) => listing.seller !== wallet?.address)
                      .slice(0, 2)
                      .map((listing) => (
                        <button key={listing.id} type="button" className="room-row" onClick={() => void buyListing(listing)}>
                          <strong>{mechanicById(listing.mechanic).name}</strong>
                          <span>
                            Buy {listing.price} · trackers · {shortAddress(listing.seller)}
                          </span>
                        </button>
                      ))}
                  </div>
                  {purses.filter((row) => row.seats.length > 0 && !row.started).length === 0 ? (
                    <p className="race-note">No purses are waiting. Sit to open one. One purse per size and stake.</p>
                  ) : (
                    <div className="room-line purse-list">
                      {purses
                        .filter((row) => row.seats.length > 0 && !row.started)
                        .map((row) => (
                          <button key={row.key} type="button" className="room-row" onClick={() => void sitPurse(row.size, row.stakeId)}>
                            <strong>
                              {row.size} karts · {row.stakeId === "s" ? "Small" : "High"}
                            </strong>
                            <span>
                              {row.seats.length}/{row.size} waiting · stake {row.stake} · pot {row.stake * row.size}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                  <div className="course-row">
                    {PURSE_SIZES.map((size) => (
                      <button key={size} type="button" className={`course-chip ${sizePick === size ? "is-on" : ""}`} onClick={() => setSizePick(size)}>
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="course-row">
                    {PURSE_STAKES.map((stake) => (
                      <button key={stake.id} type="button" className={`course-chip ${stakePick === stake.id ? "is-on" : ""}`} onClick={() => setStakePick(stake.id)}>
                        {stake.name} {stake.stake}
                      </button>
                    ))}
                  </div>
                  <div className="race-actions">
                    <button type="button" className="race-go" onClick={() => void sitPurse(sizePick, stakePick)}>
                      Sit {sizePick} · {stakePick === "s" ? "Small" : "High"}
                    </button>
                  </div>
                  {yardNote ? <p className="race-note">{yardNote}</p> : null}
                </>
              ) : null}
              {desk === "chain" ? (
                <>
                  <h2>Chain</h2>
                  <p className="race-note">
                    Dev pool {board.dev} · bonus purse {board.bonus}. A quarter of that bonus tops the next purse win. Height {mine.height}.
                  </p>
                  <p className="race-note">
                    You hold {wallet?.purse ?? 0} chips · oil {book?.mats.oil ?? 0} · battery {book?.mats.battery ?? 0} · engine {book?.mats.engine ?? 0}
                  </p>
                  <div className="send-line">
                    <input
                      ref={sendToRef}
                      placeholder="Their wallet"
                      autoComplete="off"
                      spellCheck={false}
                      onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
                    />
                    <input
                      ref={sendAmtRef}
                      defaultValue="4"
                      inputMode="numeric"
                      aria-label="Amount"
                      onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const amount = Math.max(1, Math.floor(Number(sendAmtRef.current?.value) || 0));
                        void sendValue("chips", sendToRef.current?.value || "", amount);
                      }}
                    >
                      Send chips
                    </button>
                  </div>
                  <div className="course-row">
                    {(["oil", "battery", "engine"] as const).map((token) => (
                      <button
                        key={token}
                        type="button"
                        className="course-chip"
                        onClick={() => {
                          const amount = Math.max(1, Math.floor(Number(sendAmtRef.current?.value) || 0));
                          void sendValue(token, sendToRef.current?.value || "", amount);
                        }}
                      >
                        Send {token}
                      </button>
                    ))}
                  </div>
                  <div className="room-line chain-scroll">
                    {(["oil", "battery", "engine"] as const).map((token) => {
                      const pool = board.amm[token];
                      const spend = pool.token > 1 ? Math.ceil(pool.chips / (pool.token - 1)) : 0;
                      const quote = spend > 0 ? Math.floor((pool.token * spend) / (pool.chips + spend)) : 0;
                      return (
                        <div key={token} className="room-row">
                          <strong>
                            {token} · pool {pool.token}/{pool.chips}
                          </strong>
                          <span className="row-actions">
                            <button type="button" onClick={() => void swapToken(token, "buy", spend)}>
                              Buy {quote} · {spend}
                            </button>
                            <button type="button" onClick={() => void swapToken(token, "sell")}>
                              Sell 1
                            </button>
                            <button type="button" onClick={() => void listMaterial(token)}>
                              List 1
                            </button>
                          </span>
                        </div>
                      );
                    })}
                    {board.mats.slice(0, 6).map((item) => (
                      <div key={item.id} className="room-row">
                        <strong>
                          {item.amount} {item.token} · {item.price * item.amount}
                        </strong>
                        <span className="row-actions">
                          {item.seller === wallet?.address ? (
                            <button type="button" onClick={() => void dropMaterial(item.id)}>
                              Pull
                            </button>
                          ) : (
                            <button type="button" onClick={() => void buyMaterial(item.id, item.price * item.amount)}>
                              Buy · {shortAddress(item.seller)}
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="room-line chain-scroll">
                    {blocks.map((row) => (
                      <div key={row.height} className="room-row">
                        <strong>
                          #{row.height} · {row.kind}
                        </strong>
                        <span>
                          {row.detail} · {shortAddress(row.miner)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {yardNote ? <p className="race-note">{yardNote}</p> : null}
                </>
              ) : null}
              {desk === "wallet" ? (
                <>
                  <h2>Wallet</h2>
                  <p className="race-note">This key signs mints and trades. The chain confirms them.</p>
                  <label className="pit-name">
                    Address
                    <input readOnly value={wallet?.address ?? ""} onFocus={(event) => event.currentTarget.select()} onKeyDown={(event) => event.key === "Enter" && event.preventDefault()} />
                  </label>
                  <p className="race-note">
                    {wallet ? `${wallet.purse} chips` : "Opening…"} · chain #{mine.height} · {mine.rate} · {mine.load}% cpu · {mine.gpu ? "GPU on" : mine.detail.slice(0, 36) || "GPU off"}
                    {mine.mined ? ` · ${mine.mined} mined` : ""}
                  </p>
                  <label className="mine-row">
                    Power {mine.power}%
                    <input
                      className="mine-range"
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={mine.power}
                      onPointerDown={(event) => event.stopPropagation()}
                      onChange={(event) => minerRef.current?.setPower(Number(event.target.value))}
                    />
                  </label>
                </>
              ) : null}
            </>
          ) : null}
          {seat === "host" ? (
            <>
              <h2>Room {roomCode}</h2>
              <p className="race-note">
                {COURSES.find((item) => item.id === courseId)?.name} · {lobby.length + 1} here. The flag drops together, three seconds after you start.
              </p>
              <div className="face-row">
                <figure>
                  <span>You</span>
                  <figcaption>You</figcaption>
                </figure>
                {lobby.map((person) => (
                  <figure key={person.id}>
                    {person.face?.url ? <img src={person.face.url} alt="" /> : <span>{person.name.slice(0, 1)}</span>}
                    <figcaption>{person.name}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="race-actions">
                <button type="button" className="race-ghost" onClick={leaveLobby}>
                  Back
                </button>
                <button type="submit" className="race-go">
                  Start the race
                </button>
              </div>
            </>
          ) : null}
          {seat === "wait" || seat === "purse" ? (
            <>
              <h2>{seat === "purse" ? "Purse is filling." : "Waiting for the flag."}</h2>
              <p className="race-note">
                {seat === "purse"
                  ? "Humans only. The chain drops the flag when every seat is confirmed."
                  : `Room ${roomCode}. ${lobby.length + 1} here. You go when the host starts.`}
              </p>
              <div className="face-row">
                <figure>
                  <span>You</span>
                  <figcaption>You</figcaption>
                </figure>
                {lobby.map((person) => (
                  <figure key={person.id}>
                    {person.face?.url ? <img src={person.face.url} alt="" /> : <span>{person.name.slice(0, 1)}</span>}
                    <figcaption>{person.name}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="race-actions">
                <button type="button" className="race-ghost" onClick={leaveRace}>
                  Back
                </button>
              </div>
            </>
          ) : null}
          {camError ? <p className="race-note">{camError}</p> : null}
        </form>
      ) : null}
      <div
        className="stick"
        ref={stickRef}
        onPointerDown={(event) => {
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          holdStick(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          holdStick(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
          releaseStick();
        }}
        onPointerCancel={releaseStick}
      >
        <div className="stick-knob" ref={knobRef} />
      </div>
      <button
        type="button"
        className="race-mode"
        aria-pressed={hands === "tilt"}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => void toggleHands()}
      >
        {hands === "tilt" ? "Motion" : "Stick"}
      </button>
      <div className="pedals">
        <button
          type="button"
          className="pedal pedal-go"
          onPointerDown={(event) => holdPedal(1, event)}
          onPointerUp={releasePedal}
          onPointerCancel={releasePedal}
        >
          Go
        </button>
        <button
          type="button"
          className="pedal pedal-back"
          onPointerDown={(event) => holdPedal(-1, event)}
          onPointerUp={releasePedal}
          onPointerCancel={releasePedal}
        >
          Back
        </button>
      </div>
      <div className="assist">
        <button
          type="button"
          className="pedal pedal-brake"
          onPointerDown={(event) => holdHold("brake", event)}
          onPointerUp={() => releaseHold("brake")}
          onPointerCancel={() => releaseHold("brake")}
        >
          Brake
        </button>
        <button
          type="button"
          className="pedal pedal-nox"
          onPointerDown={(event) => holdHold("boost", event)}
          onPointerUp={() => releaseHold("boost")}
          onPointerCancel={() => releaseHold("boost")}
        >
          Nox
        </button>
      </div>
      <button
        type="button"
        className="race-mute"
        aria-pressed={muted}
        aria-label={muted ? "Unmute" : "Mute"}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          const heard = audioRef.current;
          if (!heard) return;
          if (!heard.muted) heard.resume();
          setMuted(heard.toggle());
        }}
      >
        {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
      </button>
    </div>
  );
}
