/** Internal picture scale. Each step is a big, visible cut in pixel count. */
export const PICTURE_STEPS = [1, 0.75, 0.5, 0.35, 0.25] as const;

export type PaceState = {
  scale: number;
  ema: number;
  fast: number;
  /** Frames to wait after a cut so one slow sample cannot stack. */
  cool: number;
  /** Scale that missed the frame budget. Don't jump straight back onto it. */
  failed: number;
};

export function createPace(): PaceState {
  return { scale: 1, ema: 0, fast: 0, cool: 0, failed: 0 };
}

function stepIndex(scale: number) {
  let best = 0;
  let err = Infinity;
  for (let i = 0; i < PICTURE_STEPS.length; i++) {
    const delta = Math.abs(PICTURE_STEPS[i]! - scale);
    if (delta < err) {
      err = delta;
      best = i;
    }
  }
  return best;
}

/**
 * Chase 30fps, then 20, then 12.
 * `ms` is the frame the player actually got (present gap or paint, whichever is worse).
 * `cost` is just the picture. Once that is already cheap, stop cutting it.
 */
export function stepPace(state: PaceState, msIn: number, costIn = msIn): PaceState {
  const ms = Math.max(0, Math.min(160, msIn));
  const cost = Math.max(0, Math.min(160, costIn));
  const ema = state.ema <= 0 ? ms : state.ema * 0.4 + ms * 0.6;
  const index = stepIndex(state.scale);
  const cheap = index > 0 && cost < 16 && cost < ms * 0.4;
  const cooling = state.cool > 0;
  let next = index;
  if (!cheap && !cooling) {
    if (ms > 83) next = Math.min(PICTURE_STEPS.length - 1, index + 3);
    else if (ms > 50) next = Math.min(PICTURE_STEPS.length - 1, index + 2);
    else if (ms > 33.4) next = Math.min(PICTURE_STEPS.length - 1, index + 1);
  }

  let cool = cooling ? state.cool - 1 : 0;
  let fast = ms <= 22 ? state.fast + 1 : 0;
  let failed = state.failed;
  if (next === index && !cooling && ms <= 33.4 && fast >= 3 && ema <= 20 && ms <= 22 && index > 0) {
    const up = index - 1;
    const dest = PICTURE_STEPS[up]!;
    const heavier = cost * (dest / state.scale) ** 2;
    // A step that just missed stays down unless the picture itself has room for the extra pixels.
    const blocked = failed > 0 && dest >= failed - 0.001 && heavier > 27;
    if (!blocked) next = up;
  }

  if (next > index) {
    failed = state.scale;
    cool = 2;
    fast = 0;
  } else if (next < index && !(failed > 0 && PICTURE_STEPS[next]! < failed - 0.001)) {
    failed = 0;
  }

  return { scale: PICTURE_STEPS[next] ?? 0.25, ema, fast, cool, failed };
}

export function picturePixels(viewW: number, viewH: number, scale: number) {
  const fullW = Math.max(2, viewW | 0);
  const fullH = Math.max(2, viewH | 0);
  if (scale >= 0.995) return { w: fullW, h: fullH };
  const w = Math.max(160, Math.min(fullW, Math.round((fullW * scale) / 8) * 8));
  const h = Math.max(90, Math.min(fullH, Math.round((w * fullH) / Math.max(1, fullW) / 8) * 8));
  return { w, h };
}
