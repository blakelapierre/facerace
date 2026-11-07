import { useEffect, useRef, useState } from "react";
import { Camera, Flag, Gauge, Users } from "lucide-react";
import { paintFace, type FaceImage } from "./faces";
import { createSim, installProbe, lapOf, placeOf, stepSim, type Sim } from "./sim";
import { buildPicture, chaseCamera, type DrawBody } from "./scene";
import type { RaceNet } from "./net";

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

export function Race() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLInputElement>(null);
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
  const [phase, setPhase] = useState<"grid" | "live">("grid");
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState("");

  useEffect(() => {
    const sim = createSim();
    simRef.current = sim;
    installProbe(sim);
    for (const kart of sim.karts) {
      if (kart.ai) botFaces.current.set(kart.id, paintFace(kart.seed));
    }
    faceRef.current = paintFace(7);

    const canvas = canvasRef.current;
    if (!canvas) return;
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
    };
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
    window.addEventListener("blur", blur);

    let tiltZero: number | null = null;
    const onTilt = (event: DeviceOrientationEvent) => {
      const current = simRef.current;
      if (!current) return;
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
    let gridPainted = false;
    let lastPaint = 0;

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
        gridPainted = false;
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
        gridPainted = false;
      };
      const restored = () => {
        painter = gpu.createGpuPainter(canvas);
        painter?.setSmoothing?.(true);
        gridPainted = false;
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
      const heavy = boxW * boxH > 700 * 420;
      const traceCap = heavy ? 300 : Math.min(boxW, 400);
      const traceW = Math.max(200, Math.min(boxW, traceCap));
      const traceH = Math.max(120, Math.round((traceW * boxH) / Math.max(1, boxW)));
      const picture = buildPicture(bodies, smooth, traceW, traceH, !current.running || Math.abs(player.speed) < 0.4);
      const faceLive = !!videoRef.current && videoRef.current.readyState >= 2;
      const gap = current.running ? (heavy ? 80 : 48) : 0;
      const due = (current.running || !gridPainted || (faceLive && now - lastPaint > 400)) && now - lastPaint >= gap;
      if (painter) {
        if (due && !painter.busy?.()) {
          lastPaint = now;
          if (!current.running) gridPainted = true;
          const ok = painter.paint(picture, traceW, traceH);
          if (ok) painter.present(1);
          else glFailed = painter.failReason?.() || "picture failed";
        }
      } else if (cpu && ctx2d && due) {
        lastPaint = now;
        if (!current.running) gridPainted = true;
        const pixels = cpu.paintFrame(picture, Math.min(traceW, 200), Math.min(traceH, 120));
        const w = Math.min(traceW, 200);
        const h = Math.min(traceH, 120);
        const image = new ImageData(new Uint8ClampedArray(pixels), w, h);
        const scratch = document.createElement("canvas");
        scratch.width = w;
        scratch.height = h;
        scratch.getContext("2d")?.putImageData(image, 0, 0);
        ctx2d.imageSmoothingEnabled = false;
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
        if (lapRef.current) lapRef.current.textContent = `${lapOf(player)} / 3`;
        if (placeRef.current) placeRef.current.textContent = ordinal(placeOf(current, player));
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
      void bootDone.then((off) => off?.());
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

  function lookDown(event: React.PointerEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.closest(".stick, button, input, a, .race-card, .race-sideways")) return;
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

  async function start() {
    const sim = simRef.current;
    if (!sim || sim.running) return;
    const name = nameRef.current?.value.trim().slice(0, 16) || "You";
    sim.karts[0]!.name = name;
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
    const code = roomRef.current?.value.trim() ?? "";
    if (!code) {
      if (statusRef.current) statusRef.current.textContent = "Solo heat";
      return;
    }
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

  return (
    <div className="race-root" onPointerDown={lookDown} onPointerMove={lookMove} onPointerUp={lookUp} onPointerCancel={lookUp}>
      <canvas ref={canvasRef} className="race-canvas" />
      <video ref={videoRef} className="race-video" playsInline muted />
      <div className="race-sideways">
        <p className="race-kicker">Landscape</p>
        <h2>Turn the phone sideways</h2>
        <p>Tilt to steer. Push the stick to drive. Drag the picture to look around.</p>
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
      {phase === "grid" ? (
        <form
          className="race-card"
          onSubmit={(event) => {
            event.preventDefault();
            void start();
          }}
        >
          <p className="race-kicker">Pit lane</p>
          <h2>Three laps. Don’t cut the grass.</h2>
          <label>
            Name
            <input ref={nameRef} name="name" defaultValue="You" maxLength={16} autoComplete="nickname" />
          </label>
          <label>
            Room
            <input ref={roomRef} name="room" defaultValue="pit" maxLength={24} autoCapitalize="off" spellCheck={false} />
          </label>
          <p className="race-note">Same room code shares the track over Meridian’s tracker net. Leave it blank to race only the field. A face photo goes to people in your room.</p>
          <div className="race-actions">
            <button type="button" className="race-ghost" onClick={() => void useCamera()}>
              <Camera aria-hidden="true" />
              {camOn ? "Face live" : "Use my face"}
            </button>
            <button type="submit" className="race-go">
              Start
            </button>
          </div>
          {camError ? <p className="race-note">{camError}</p> : null}
          <p className="race-keys">Keyboard: W gas, S brake, A left, D right. Phone: tilt to turn, stick to drive, drag to look. Landscape is best.</p>
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
    </div>
  );
}
