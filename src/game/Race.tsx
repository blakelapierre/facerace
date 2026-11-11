import { useEffect, useRef, useState } from "react";
import { Camera, Flag, Gauge, Users, Volume2, VolumeX } from "lucide-react";
import { paintFace, type FaceImage } from "./faces";
import { createSim, installProbe, lapOf, parkOn, placeOf, stepSim, type Sim } from "./sim";
import { buildPicture, chaseCamera, raceSun, type DrawBody } from "./scene";
import { createRaceAudio, hearAt, type RaceAudio } from "./sound";
import { rainAt } from "./terrain";
import { COURSES, lapCount } from "./track";
import { freshCode, openBoard, type ListedRoom, type MarketListing } from "./lobby";
import type { RaceNet } from "./net";
import { credit, openWallet, shortAddress, type Wallet } from "./wallet";
import {
  HEATS,
  MECHANICS,
  alreadyPaid,
  dropCart,
  giveCart,
  hire,
  listingIsReal,
  loadYard,
  mechanicById,
  payIsReal,
  rememberPay,
  selectCart,
  signListing,
  signPay,
  specOf,
  stakeHeat,
  type Heat,
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

function clampUnit(n: number) {
  if (n > 1) return 1;
  if (n < -1) return -1;
  return n;
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
  const boardRef = useRef<{ announce: (card: { code: string; course: string; host: string; live: boolean }) => void; post: (catalog: string) => void; close: () => void } | null>(null);
  const walletRef = useRef<Wallet | null>(null);
  const yardRef = useRef<Yard>(loadYard());
  const heatRef = useRef<(Heat & { paid: boolean }) | null>(null);
  const weatherRef = useRef(12);
  const armRef = useRef(false);
  const leaveRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<"menu" | "live">("menu");
  const [seat, setSeat] = useState<"pick" | "host" | "wait">("pick");
  const [courseId, setCourseId] = useState(COURSES[0]!.id);
  const [rooms, setRooms] = useState<ListedRoom[]>([]);
  const [boardNote, setBoardNote] = useState("Looking for rooms…");
  const [roomCode, setRoomCode] = useState("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [yard, setYard] = useState<Yard>(yardRef.current);
  const [desk, setDesk] = useState<"race" | "yard" | "purse">("race");
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [yardNote, setYardNote] = useState("");
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState("");
  const [muted, setMuted] = useState(false);
  const [hands, setHands] = useState<"tilt" | "stick">(preferredHands);
  const setMutedRef = useRef(setMuted);
  setMutedRef.current = setMuted;

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

    let closedBoard = false;
    void openWallet().then((opened) => {
      if (closedBoard) return;
      walletRef.current = opened;
      setWallet(opened);
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
            if (await listingIsReal(listing.mechanic, listing.price, listing.seller, listing.nonce, listing.x, listing.y, listing.sig)) real.push(listing);
          }
          if (!closedBoard) setListings(real);
          let purse = walletRef.current;
          let owned = yardRef.current;
          if (!purse) return;
          for (const pay of pays) {
            if (pay.seller !== purse.address || alreadyPaid(pay.id)) continue;
            if (!(await payIsReal(pay.seller, pay.amount, pay.buyer, pay.nonce, pay.mechanic, pay.x, pay.y, pay.sig))) continue;
            rememberPay(pay.id);
            purse = credit(purse, pay.amount);
            owned = dropCart(owned, pay.mechanic);
          }
          walletRef.current = purse;
          yardRef.current = owned;
          if (!closedBoard) {
            setWallet(purse);
            setYard(owned);
          }
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
    let painter: {
      paint: (scene: unknown, w: number, h: number) => boolean;
      present: (n?: number) => void;
      setSmoothing?: (on: boolean) => void;
      busy?: () => boolean;
      failReason?: () => string;
    } | null = null;
    let cpu: { paintFrame: (scene: unknown, w: number, h: number) => Uint8ClampedArray } | null = null;
    let ctx2d: CanvasRenderingContext2D | null = null;
    let glFailed = "";
    let alive = true;

    const fit = () => {
      const box = canvas.parentElement?.getBoundingClientRect();
      const cssW = box?.width || window.innerWidth || 960;
      const cssH = box?.height || window.innerHeight || 540;
      // A full-window backing store plus the raytrace freezes desktop GPUs, then the picture goes black.
      const scale = Math.min(1, 960 / Math.max(1, cssW), 540 / Math.max(1, cssH));
      const viewW = Math.max(320, Math.floor(cssW * scale));
      const viewH = Math.max(180, Math.floor(cssH * scale));
      if (canvas.width === viewW && canvas.height === viewH) return false;
      canvas.width = viewW;
      canvas.height = viewH;
      return true;
    };

    const keysDown = (event: KeyboardEvent) => setKey(event, true);
    const keysUp = (event: KeyboardEvent) => setKey(event, false);
    function setKey(event: KeyboardEvent, down: boolean) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const simNow = simRef.current;
      if (!simNow) return;
      const tracked = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
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
    };
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
    window.addEventListener("blur", blur);

    let tiltZero: number | null = null;
    const onTilt = (event: DeviceOrientationEvent) => {
      const current = simRef.current;
      if (!current || current.hands !== "tilt") return;
      const roll = screenRoll(event);
      if (tiltZero == null) tiltZero = roll;
      const delta = roll - tiltZero;
      const dead = 4;
      const mag = Math.max(0, Math.abs(delta) - dead);
      current.tilt = clampUnit(-(Math.sign(delta) * mag) / 18);
    };
    const resetTilt = () => {
      tiltZero = null;
    };
    window.addEventListener("deviceorientation", onTilt);
    screen.orientation?.addEventListener("change", resetTilt);

    let smooth = chaseCamera(sim.karts[0]!);
    let prevYaw = sim.karts[0]!.yaw;
    let acc = 0;
    let last = performance.now();
    let faceAt = 0;
    let hudAt = 0;
    let raf = 0;
    let lastPaint = 0;
    let paintMs = 120;
    let traceScale = 0.72;
    let timed = false;
    let gpuWait = false;
    let gpuAt = 0;
    let ambAt = 0;

    const boot = async () => {
      const gpu = await import("@/vendor/meridian/render/gpu.js");
      const frame = await import("@/vendor/meridian/engine/frame.js");
      cpu = frame;
      if (!alive) return;
      const make = () => {
        fit();
        painter = gpu.createGpuPainter(canvas);
        if (!painter) {
          glFailed = canvas.dataset.gpuError || "no WebGL2";
          ctx2d = canvas.getContext("2d");
        } else painter.setSmoothing?.(true);
      };
      make();
      const onResize = () => {
        traceScale = 0.72;
        timed = false;
        if (!fit() || !alive) return;
        if (glFailed) {
          ctx2d = canvas.getContext("2d");
          return;
        }
        painter = gpu.createGpuPainter(canvas);
        painter?.setSmoothing?.(true);
      };
      window.addEventListener("resize", onResize);
      const lost = (event: Event) => {
        event.preventDefault();
        painter = null;
        gpuWait = false;
        traceScale = 0.72;
        timed = false;
      };
      const restored = () => {
        painter = gpu.createGpuPainter(canvas);
        painter?.setSmoothing?.(true);
        gpuWait = false;
      };
      canvas.addEventListener("webglcontextlost", lost);
      canvas.addEventListener("webglcontextrestored", restored);
      return () => {
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("webglcontextlost", lost);
        canvas.removeEventListener("webglcontextrestored", restored);
      };
    };
    const bootDone = boot();

    const frameLoop = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frameLoop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      weatherRef.current += dt;
      const current = simRef.current;
      if (!current) return;
      acc += dt;
      let guard = 0;
      while (acc >= 1 / 60 && guard < 5) {
        stepSim(current, 1 / 60);
        acc -= 1 / 60;
        guard += 1;
      }
      const player = current.karts[0]!;
      const yawRate = Math.atan2(Math.sin(player.yaw - prevYaw), Math.cos(player.yaw - prevYaw)) / Math.max(dt, 1 / 120);
      prevYaw = player.yaw;
      const video = videoRef.current;
      if (video && video.readyState >= 2 && now - faceAt > 250) {
        faceAt = now;
        faceRef.current = paintFace(player.seed, video);
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

      const remotes = netRef.current?.racers() ?? [];
      const bodies: DrawBody[] = [
        ...current.karts.map((kart) => ({
          x: kart.x,
          y: kart.y,
          yaw: kart.yaw,
          color: kart.color,
          name: kart.name,
          face: kart.ai ? (botFaces.current.get(kart.id) ?? null) : faceRef.current,
        })),
        ...remotes.map((remote) => ({
          x: remote.x,
          y: remote.y,
          yaw: remote.yaw,
          color: remote.color,
          name: remote.name,
          face: remote.face,
        })),
      ];
      const boxW = canvas.width;
      const boxH = canvas.height;
      const settled = !lookingRef.current && (Math.abs(player.speed) < 1.2 || !current.running);
      if (gpuWait && painter && !painter.busy?.()) {
        paintMs = Math.max(8, performance.now() - gpuAt);
        gpuWait = false;
        timed = true;
      }
      if (painter && !gpuWait && !painter.busy?.()) {
        if (timed) {
          if (paintMs < (settled ? 110 : 80)) traceScale = Math.min(1, traceScale * 1.12);
          else if (paintMs > (settled ? 180 : 150)) traceScale = Math.max(0.58, traceScale * 0.84);
        }
        const traceW = Math.max(320, Math.min(boxW, Math.round((boxW * traceScale) / 4) * 4));
        const traceH = Math.max(180, Math.min(boxH, Math.round((boxH * traceScale) / 4) * 4));
        const picture = buildPicture(bodies, view, traceW, traceH, settled, raceSun(weatherRef.current), rainAt(weatherRef.current));
        gpuAt = performance.now();
        const ok = painter.paint(picture, traceW, traceH);
        if (ok) {
          painter.present(1);
          gpuWait = true;
          lastPaint = now;
        } else glFailed = painter.failReason?.() || "picture failed";
      } else if (!painter && glFailed && cpu && ctx2d && now - lastPaint > 800) {
        lastPaint = now;
        const w = 80;
        const h = 45;
        const picture = buildPicture(bodies, view, w, h, true, raceSun(weatherRef.current), rainAt(weatherRef.current));
        const pixels = cpu.paintFrame(picture, w, h);
        const image = new ImageData(new Uint8ClampedArray(pixels), w, h);
        const scratch = document.createElement("canvas");
        scratch.width = w;
        scratch.height = h;
        scratch.getContext("2d")?.putImageData(image, 0, 0);
        ctx2d.imageSmoothingEnabled = true;
        ctx2d.drawImage(scratch, 0, 0, canvas.width, canvas.height);
      }
      netRef.current?.tick(
        {
          x: player.x,
          y: player.y,
          yaw: player.yaw,
          speed: player.speed,
          yawRate,
          name: player.name,
          faceUrl: faceRef.current?.url || "",
        },
        current.time,
      );
      if (now - hudAt > 80) {
        hudAt = now;
        if (speedRef.current) speedRef.current.textContent = String(Math.round(Math.abs(player.speed) * 8));
        if (lapRef.current) lapRef.current.textContent = `${lapOf(player)} / ${lapCount()}`;
        if (placeRef.current) placeRef.current.textContent = ordinal(placeOf(current, player));
        const heat = heatRef.current;
        if (heat && !heat.paid && player.finishedAt != null && placeOf(current, player) === 1) {
          heat.paid = true;
          const purse = walletRef.current;
          if (purse) {
            const paid = credit(purse, heat.purse);
            walletRef.current = paid;
            setWallet(paid);
            current.banner = `Won ${heat.purse}`;
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
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", keysDown);
      window.removeEventListener("keyup", keysUp);
      window.removeEventListener("blur", blur);
      window.removeEventListener("deviceorientation", onTilt);
      screen.orientation?.removeEventListener("change", resetTilt);
      canvas.parentElement?.removeEventListener("selectstart", blockSelect);
      closedBoard = true;
      boardRef.current?.close();
      void bootDone.then((off) => off?.());
      audio.close();
      audioRef.current = null;
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

  async function toggleHands() {
    const sim = simRef.current;
    if (!sim) return;
    const next = sim.hands === "tilt" ? "stick" : "tilt";
    sim.hands = next;
    sim.tilt = 0;
    sim.stick = 0;
    sim.gas = 0;
    sim.pedal = 0;
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
    if (target?.closest(".stick, .pedals, .race-mode, button, input, a, .race-card, .race-sideways")) return;
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

  function leaveRace() {
    netRef.current?.close();
    netRef.current = null;
    const sim = simRef.current;
    if (sim) {
      sim.running = false;
      sim.keys.clear();
      sim.touch.clear();
      sim.steer = 0;
      sim.stick = 0;
      sim.gas = 0;
      sim.pedal = 0;
      sim.banner = "";
    }
    armRef.current = false;
    setSeat("pick");
    setPhase("menu");
  }
  leaveRef.current = leaveRace;

  async function begin(code: string, course: string) {
    const sim = simRef.current;
    if (!sim || sim.running || armRef.current) return;
    armRef.current = true;
    const name = nameRef.current?.value.trim().slice(0, 16) || "You";
    parkOn(sim, course);
    sim.karts[0]!.name = name;
    const built = specOf(yardRef.current);
    sim.cart = { speed: built.speed, turn: built.turn, grip: built.grip, color: built.color };
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
    sim.running = true;
    setPhase("live");
    setSeat("pick");
    audioRef.current?.resume();
    audioRef.current?.cue("horn", 1, 0);
    if (!code) {
      if (statusRef.current) statusRef.current.textContent = "Solo heat";
      return;
    }
    boardRef.current?.announce({ code, course, host: name, live: true });
    const { createRaceNet } = await import("./net");
    const net = await createRaceNet(code, (line) => {
      if (statusRef.current) statusRef.current.textContent = line;
    });
    if (!simRef.current?.running) {
      net.close();
      return;
    }
    netRef.current = net;
  }

  function createRoom() {
    const code = freshCode();
    const name = nameRef.current?.value.trim().slice(0, 16) || "You";
    setRoomCode(code);
    setSeat("host");
    boardRef.current?.announce({ code, course: courseId, host: name, live: false });
    if (statusRef.current) statusRef.current.textContent = "Room posted";
  }

  function keep(nextWallet: Wallet, nextYard: Yard, note = "") {
    walletRef.current = nextWallet;
    yardRef.current = nextYard;
    setWallet(nextWallet);
    setYard(nextYard);
    setYardNote(note);
  }

  function hireMechanic(id: string) {
    const purse = walletRef.current;
    if (!purse) return;
    const result = hire(purse, yardRef.current, id);
    keep(result.wallet, result.yard, result.error || `${mechanicById(id).name} rolled it out.`);
  }

  async function listSelected() {
    const purse = walletRef.current;
    const selected = yardRef.current.carts.find((cart) => cart.id === yardRef.current.selected);
    if (!purse || !selected || selected.mechanic === "stock") {
      setYardNote("Pick a built cart to list.");
      return;
    }
    const price = mechanicById(selected.mechanic).cost;
    const signed = await signListing(purse, selected.mechanic, price);
    boardRef.current?.post(`s|${selected.mechanic}|${price}|${signed.wallet.address}|${signed.nonce}|${signed.wallet.x}|${signed.wallet.y}|${signed.sig}`);
    keep(signed.wallet, yardRef.current, `Listed ${mechanicById(selected.mechanic).name} for ${price}.`);
  }

  async function buyListing(listing: MarketListing) {
    const purse = walletRef.current;
    if (!purse) return;
    if (listing.seller === purse.address) {
      setYardNote("That’s your own listing.");
      return;
    }
    const next = stakeHeat(purse, { id: "buy", name: "buy", stake: listing.price, purse: 0 });
    if (!next) {
      setYardNote("Not enough chips.");
      return;
    }
    const paid = await signPay(next, listing.seller, listing.price, listing.mechanic);
    const owned = giveCart(yardRef.current, listing.mechanic);
    boardRef.current?.post(`p|${listing.seller}|${listing.price}|${paid.wallet.address}|${paid.nonce}|${listing.mechanic}|${paid.wallet.x}|${paid.wallet.y}|${paid.sig}`);
    keep(paid.wallet, owned, `${mechanicById(listing.mechanic).name} is in your yard.`);
  }

  function enterHeat(heat: Heat) {
    const purse = walletRef.current;
    if (!purse) return;
    const next = stakeHeat(purse, heat);
    if (!next) {
      setYardNote("Not enough chips for that heat.");
      return;
    }
    keep(next, yardRef.current, `${heat.name} heat. Win pays ${heat.purse}.`);
    heatRef.current = { ...heat, paid: false };
    void begin("", courseId);
  }

  useEffect(() => {
    if (phase === "live" || seat !== "wait") return;
    const hit = rooms.find((room) => room.code === roomCode && room.live);
    if (!hit) return;
    void begin(hit.code, hit.course);
  });

  return (
    <div
      className={`race-root ${hands === "tilt" ? "is-tilt" : "is-stick"} ${phase === "menu" ? "is-menu" : ""}`}
      onPointerDown={lookDown}
      onPointerMove={lookMove}
      onPointerUp={lookUp}
      onPointerCancel={lookUp}
    >
      <canvas ref={canvasRef} className="race-canvas" />
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
            if (seat === "host") void begin(roomCode, courseId);
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
              </div>
              <p className="race-note">{wallet ? `${shortAddress(wallet.address)} · ${wallet.purse} chips` : "Opening a wallet…"}</p>
              {desk === "race" ? (
                <>
                  <h2>Pick a course.</h2>
                  <label className="pit-name">
                    Name
                    <input ref={nameRef} name="name" defaultValue="You" maxLength={16} autoComplete="nickname" />
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
                          setSeat(room.live ? "pick" : "wait");
                          if (room.live) void begin(room.code, room.course);
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
                  <h2>Hire a mechanic.</h2>
                  <div className="course-row">
                    {yard.carts.map((cart) => (
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
                      </button>
                    ))}
                  </div>
                  <div className="room-line">
                    {MECHANICS.map((mechanic) => (
                      <button key={mechanic.id} type="button" className="room-row" onClick={() => hireMechanic(mechanic.id)}>
                        <strong>{mechanic.name}</strong>
                        <span>
                          {mechanic.line} · {mechanic.cost}
                        </span>
                      </button>
                    ))}
                  </div>
                  {yardNote ? <p className="race-note">{yardNote}</p> : null}
                </>
              ) : null}
              {desk === "purse" ? (
                <>
                  <h2>Small stakes.</h2>
                  <div className="race-actions">
                    {HEATS.map((heat) => (
                      <button key={heat.id} type="button" className="race-ghost" onClick={() => enterHeat(heat)}>
                        {heat.name} {heat.stake}
                      </button>
                    ))}
                    <button type="button" className="race-go" onClick={() => void listSelected()}>
                      List cart
                    </button>
                  </div>
                  <div className="room-line">
                    {listings.length === 0 ? <p className="race-note">No signed carts on the trackers yet.</p> : null}
                    {listings.slice(0, 2).map((listing) => (
                      <button key={listing.id} type="button" className="room-row" onClick={() => void buyListing(listing)}>
                        <strong>{mechanicById(listing.mechanic).name}</strong>
                        <span>
                          {listing.price} · {shortAddress(listing.seller)}
                        </span>
                      </button>
                    ))}
                  </div>
                  {yardNote ? <p className="race-note">{yardNote}</p> : null}
                </>
              ) : null}
            </>
          ) : null}
          {seat === "host" ? (
            <>
              <h2>Room {roomCode} is on the trackers.</h2>
              <p className="race-note">
                {COURSES.find((item) => item.id === courseId)?.name} · friends join from the room list, then you start everyone.
              </p>
              <div className="race-actions">
                <button type="button" className="race-ghost" onClick={() => setSeat("pick")}>
                  Back
                </button>
                <button type="submit" className="race-go">
                  Start the race
                </button>
              </div>
            </>
          ) : null}
          {seat === "wait" ? (
            <>
              <h2>Waiting for the start.</h2>
              <p className="race-note">Room {roomCode}. You’ll go when the host starts. If the trackers stay quiet, start anyway.</p>
              <div className="race-actions">
                <button type="button" className="race-ghost" onClick={() => setSeat("pick")}>
                  Back
                </button>
                <button type="button" className="race-go" onClick={() => void begin(roomCode, courseId)}>
                  Start now
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
