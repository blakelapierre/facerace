// Race listener in the shape of Meridian's audio/play.js, cues.js, ambient.js,
// and hearAt from sim/perception.js. Everything is synthesized. No samples.

export type Heard = { gain: number; pan: number; dist: number };

/** Gain falls off to `range`. Pan is +right of `yaw` (FaceRace yaw 0 faces +Y). */
export function hearAt(
  listener: { x: number; y: number },
  yaw: number,
  source: { x: number; y: number },
  range = 42,
): Heard | null {
  const dx = source.x - listener.x;
  const dy = source.y - listener.y;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return null;
  const near = 1 - dist / range;
  const gain = near * (0.4 + 0.6 * 0.7);
  const pan = dist < 0.5 ? 0 : Math.max(-1, Math.min(1, (dx * Math.cos(yaw) - dy * Math.sin(yaw)) / dist));
  return { gain, pan, dist };
}

type CueName = "bump" | "scrape" | "lap" | "finish" | "wrong" | "horn";

const CUES: Record<Exclude<CueName, "horn">, { freq: number; to: number; dur: number; gain: number; wave: OscillatorType }> = {
  bump: { freq: 96, to: 48, dur: 0.14, gain: 0.28, wave: "square" },
  scrape: { freq: 180, to: 90, dur: 0.09, gain: 0.1, wave: "sawtooth" },
  lap: { freq: 523, to: 784, dur: 0.2, gain: 0.12, wave: "triangle" },
  finish: { freq: 392, to: 784, dur: 0.55, gain: 0.14, wave: "sine" },
  wrong: { freq: 140, to: 70, dur: 0.22, gain: 0.12, wave: "sawtooth" },
};

const AMBIENT: Record<string, { interval: [number, number]; gain: number }> = {
  gust: { interval: [6, 16], gain: 0.55 },
  bird: { interval: [3.5, 9], gain: 0.45 },
  gull: { interval: [7, 16], gain: 0.4 },
  rustle: { interval: [4, 11], gain: 0.32 },
};

export function createRaceAudio() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let muted = false;
  let noise: AudioBuffer | null = null;
  let engine: { osc: OscillatorNode; sub: OscillatorNode; gain: GainNode; slip: GainNode; noise: AudioBufferSourceNode } | null = null;
  let wind: { src: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  let rival: { osc: OscillatorNode; gain: GainNode; pan: StereoPannerNode } | null = null;
  const next: Record<string, number> = {};
  const variant: Record<string, number> = {};

  let armed = false;

  function context(kick = false) {
    if (muted) return null;
    if (!armed && !kick) return null;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!ctx) {
      ctx = new Ctx();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (kick && ctx.state === "suspended") void ctx.resume();
    return ctx;
  }

  function noiseBuffer(audio: AudioContext) {
    if (noise) return noise;
    noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return noise;
  }

  function route(audio: AudioContext, node: AudioNode, pan = 0) {
    if (!master) return;
    if (pan && audio.createStereoPanner) {
      const stereo = audio.createStereoPanner();
      stereo.pan.value = Math.max(-1, Math.min(1, pan));
      node.connect(stereo);
      stereo.connect(master);
      return;
    }
    node.connect(master);
  }

  function voice(kind: string, which: number, amount: number, pan: number) {
    const audio = context();
    if (!audio || !master) return;
    const now = audio.currentTime;
    const out = audio.createGain();
    out.gain.value = 0;
    const tone = (type: OscillatorType, from: number, to: number, dur: number, at = 0, level = 1) => {
      const osc = audio.createOscillator();
      const env = audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, now + at);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + at + dur);
      env.gain.setValueAtTime(0.0001, now + at);
      env.gain.exponentialRampToValueAtTime(level, now + at + Math.min(0.02, dur / 4));
      env.gain.exponentialRampToValueAtTime(0.0001, now + at + dur);
      osc.connect(env);
      env.connect(out);
      osc.start(now + at);
      osc.stop(now + at + dur + 0.02);
      return at + dur;
    };
    const hiss = (type: BiquadFilterType, freq: number, q: number, dur: number, attack: number, level = 1) => {
      const src = audio.createBufferSource();
      src.buffer = noiseBuffer(audio);
      src.loop = true;
      const filter = audio.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = freq;
      filter.Q.value = q;
      const env = audio.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(level, now + attack);
      env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      src.connect(filter);
      filter.connect(env);
      env.connect(out);
      src.start(now, Math.random() * 1.5);
      src.stop(now + dur + 0.05);
      return dur;
    };
    const jitter = 1 + (Math.random() - 0.5) * 0.12;
    let end = 0.4;
    if (kind === "gust") end = hiss("bandpass", (380 + which * 90) * jitter, 1.2, 1.6 + which * 0.5, 0.7, 0.8);
    else if (kind === "rustle") end = hiss("highpass", 3200 * jitter, 0.8, 0.35 + which * 0.1, 0.05, 0.6);
    else if (kind === "bird") {
      const base = (2400 + which * 450) * jitter;
      for (let i = 0; i < 2 + which; i += 1) end = tone("sine", base, base * 1.35, 0.08, i * 0.13, 0.7);
    } else if (kind === "gull") {
      end = tone("sawtooth", 1250 * jitter, 700, 0.35, 0, 0.3);
      if (which % 2) end = tone("sawtooth", 1300 * jitter, 760, 0.3, 0.42, 0.25);
    } else return;
    out.gain.setValueAtTime(0.18 * Math.max(0, Math.min(1.5, amount)), now);
    route(audio, out, pan);
    window.setTimeout(() => out.disconnect(), (end + 0.3) * 1000);
  }

  function ensureLoops() {
    const audio = context();
    if (!audio || !master || engine) return;
    const osc = audio.createOscillator();
    const sub = audio.createOscillator();
    const gain = audio.createGain();
    const slip = audio.createGain();
    const slipFilter = audio.createBiquadFilter();
    osc.type = "sawtooth";
    sub.type = "triangle";
    osc.frequency.value = 52;
    sub.frequency.value = 34;
    gain.gain.value = 0.0001;
    slip.gain.value = 0.0001;
    slipFilter.type = "bandpass";
    slipFilter.frequency.value = 900;
    slipFilter.Q.value = 0.7;
    const slipSrc = audio.createBufferSource();
    slipSrc.buffer = noiseBuffer(audio);
    slipSrc.loop = true;
    osc.connect(gain);
    sub.connect(gain);
    slipSrc.connect(slipFilter);
    slipFilter.connect(slip);
    gain.connect(master);
    slip.connect(master);
    osc.start();
    sub.start();
    slipSrc.start();
    engine = { osc, sub, gain, slip, noise: slipSrc };

    const src = audio.createBufferSource();
    src.buffer = noiseBuffer(audio);
    src.loop = true;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.6;
    const windGain = audio.createGain();
    windGain.gain.value = 0.0001;
    src.connect(filter);
    filter.connect(windGain);
    windGain.connect(master);
    src.start();
    wind = { src, filter, gain: windGain };

    const rosc = audio.createOscillator();
    const rgain = audio.createGain();
    const rpan = audio.createStereoPanner();
    rosc.type = "sawtooth";
    rosc.frequency.value = 60;
    rgain.gain.value = 0.0001;
    rosc.connect(rgain);
    rgain.connect(rpan);
    rpan.connect(master);
    rosc.start();
    rival = { osc: rosc, gain: rgain, pan: rpan };
  }

  return {
    get muted() {
      return muted;
    },
    resume() {
      armed = true;
      if (context(true)) ensureLoops();
    },
    toggle() {
      muted = !muted;
      armed = true;
      if (muted && ctx && ctx.state === "running") void ctx.suspend();
      if (!muted && context(true)) ensureLoops();
      return muted;
    },
    cue(name: string, amount = 1, pan = 0) {
      const audio = context();
      if (!audio || !master) return;
      if (name === "horn") {
        const now = audio.currentTime;
        [440, 554].forEach((freq, i) => {
          const osc = audio.createOscillator();
          const gain = audio.createGain();
          osc.type = "square";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.0001, now + i * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.12 * amount, now + i * 0.18 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.28);
          osc.connect(gain);
          gain.connect(master!);
          osc.start(now + i * 0.18);
          osc.stop(now + i * 0.18 + 0.32);
        });
        return;
      }
      const cue = CUES[name as Exclude<CueName, "horn">];
      if (!cue) return;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = cue.wave;
      const now = audio.currentTime;
      osc.frequency.setValueAtTime(cue.freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, cue.to), now + cue.dur);
      gain.gain.setValueAtTime(cue.gain * Math.max(0, amount), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cue.dur);
      osc.connect(gain);
      route(audio, gain, pan);
      osc.start(now);
      osc.stop(now + cue.dur + 0.02);
    },
    drive(speed: number, slip: number, live: boolean) {
      const audio = context();
      if (!audio || !engine || !wind) return;
      const now = audio.currentTime;
      const pace = Math.min(1, Math.abs(speed) / 26);
      engine.osc.frequency.setTargetAtTime(46 + pace * 92, now, 0.05);
      engine.sub.frequency.setTargetAtTime(32 + pace * 40, now, 0.08);
      const level = (live ? 0.05 + pace * 0.16 : 0.012) * (speed < 0 ? 0.7 : 1);
      engine.gain.gain.setTargetAtTime(level, now, 0.06);
      engine.slip.gain.setTargetAtTime(live ? Math.min(0.14, slip * slip * pace * 0.16) : 0.0001, now, 0.05);
      wind.filter.frequency.setTargetAtTime(280 + pace * 640, now, 0.1);
      wind.gain.gain.setTargetAtTime(live ? 0.015 + pace * 0.09 : 0.0001, now, 0.12);
    },
    rivalDrive(speed: number, pan: number, gain: number) {
      const audio = context();
      if (!audio || !rival) return;
      const now = audio.currentTime;
      const pace = Math.min(1, Math.abs(speed) / 26);
      rival.osc.frequency.setTargetAtTime(50 + pace * 80, now, 0.08);
      rival.pan.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), now, 0.05);
      rival.gain.gain.setTargetAtTime(Math.max(0.0001, gain * (0.03 + pace * 0.08)), now, 0.08);
    },
    ambient(nowSec: number, here: { x: number; y: number; yaw: number }, racing: boolean) {
      if (!context()) return;
      for (const [name, kind] of Object.entries(AMBIENT)) {
        const gap = () => kind.interval[0] + Math.random() * (kind.interval[1] - kind.interval[0]);
        if (next[name] === undefined) {
          next[name] = nowSec + gap() * Math.random();
          continue;
        }
        if (nowSec < next[name]) continue;
        next[name] = nowSec + gap();
        const angle = Math.random() * Math.PI * 2;
        const radius = 8 + Math.random() * 28;
        const at = { x: here.x + Math.cos(angle) * radius, y: here.y + Math.sin(angle) * radius };
        const heard = hearAt(here, here.yaw, at, 70);
        if (!heard) continue;
        let which = Math.floor(Math.random() * 4);
        if (which === variant[name]) which = (which + 1) % 4;
        variant[name] = which;
        const duck = racing ? 0.4 : 1;
        voice(name, which, kind.gain * heard.gain * duck * (0.75 + Math.random() * 0.5), heard.pan);
      }
    },
    close() {
      engine?.osc.stop();
      engine?.sub.stop();
      engine?.noise.stop();
      wind?.src.stop();
      rival?.osc.stop();
      void ctx?.close();
      ctx = null;
      master = null;
      engine = null;
      wind = null;
      rival = null;
    },
  };
}

export type RaceAudio = ReturnType<typeof createRaceAudio>;
