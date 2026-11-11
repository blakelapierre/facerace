/** Lowest internal scale. Anything under this is too soft to read the road. */
export const PACE_FLOOR = 0.25;

export type PaceState = {
  /** Smoothed desire, 0.25–1. This is not the size on screen yet. */
  scale: number;
  /** Size actually drawn. It steps only after the desire has settled. */
  shown: number;
  ema: number;
  /** Milliseconds the desire has sat away from the picture. */
  since: number;
};

export function createPace(): PaceState {
  return { scale: 1, shown: 1, ema: 0, since: 0 };
}

/** Where the picture should sit for this smoothed frame time. 30fps stays sharp, 12fps is the floor. */
export function paceGoal(ema: number) {
  if (ema <= 30) return 1;
  if (ema >= 84) return PACE_FLOOR;
  const t = (ema - 30) / (84 - 30);
  return 1 + (PACE_FLOOR - 1) * t;
}

/**
 * Ease the frame-time estimate, then move the drawn size in small late steps.
 * A hitch does not change the picture. The screen fades between those steps.
 * `ms` is the frame the player got. `cost` is the picture alone.
 */
export function stepPace(state: PaceState, msIn: number, costIn = msIn): PaceState {
  const ms = Math.max(0, Math.min(180, msIn));
  const cost = Math.max(0, Math.min(180, costIn));
  if (state.ema <= 0) return { scale: state.scale, shown: state.shown, ema: ms, since: 0 };
  const dt = Math.max(8, Math.min(80, ms));
  const ema = state.ema + (ms - state.ema) * (1 - Math.exp(-dt / 2200));
  let want = paceGoal(ema);
  const cheap = state.shown < 0.98 && cost >= 1 && cost < 14 && cost < ema * 0.4;
  if (cheap && want < state.scale) want = state.scale;
  const tau = want < state.scale ? 1800 : 2800;
  const scale = Math.max(PACE_FLOOR, Math.min(1, state.scale + (want - state.scale) * (1 - Math.exp(-dt / tau))));
  let shown = state.shown;
  let since = state.since;
  const gap = scale - shown;
  if (Math.abs(gap) < 0.055) {
    since = 0;
  } else {
    since += dt;
    const urgent = ema >= 72 && gap < 0;
    const dwell = urgent ? 520 : gap < 0 ? 980 : 1400;
    if (since >= dwell) {
      const cap = urgent ? 0.12 : gap < 0 ? 0.08 : 0.06;
      const step = Math.min(Math.abs(gap), Math.max(0.04, Math.min(cap, Math.abs(gap) * 0.5)));
      shown = Math.max(PACE_FLOOR, Math.min(1, shown + Math.sign(gap) * step));
      since = 0;
    }
  }
  return { scale, shown, ema, since };
}

export function picturePixels(viewW: number, viewH: number, scale: number) {
  const fullW = Math.max(2, viewW | 0);
  const fullH = Math.max(2, viewH | 0);
  if (scale >= 0.97) return { w: fullW, h: fullH };
  const w = Math.max(160, Math.min(fullW, Math.round((fullW * scale) / 16) * 16));
  const h = Math.max(90, Math.min(fullH, Math.round((w * fullH) / Math.max(1, fullW) / 8) * 8));
  return { w, h };
}
