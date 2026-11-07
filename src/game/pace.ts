// Picture pacing from Meridian's render/pace.js. A still view may sharpen.
// A moving one keeps a frame budget and drops rays before the GPU stalls.

export function pictureSize(scale: number, displayW: number, displayH: number) {
  const span = Math.max(0.05, Math.min(1, scale || 0));
  let width = Math.max(2, Math.round(displayW * span));
  let height = Math.max(2, Math.round(displayH * span));
  const long = Math.max(displayW, displayH);
  const edge = Math.max(width, height);
  if (long >= 160 && edge < 64) {
    const lift = 64 / edge;
    width = Math.round(width * lift);
    height = Math.round(height * lift);
  }
  width = Math.max(2, Math.min(displayW, Math.round(width / 4) * 4));
  height = Math.max(2, Math.min(displayH, Math.round(height / 4) * 4));
  return { width, height };
}

export function stillScale(scale: number, frameMs: number, budgetMs = 110) {
  const now = Math.max(0.08, Math.min(1, scale || 0.08));
  if (!(frameMs > 0)) return now;
  const room = Math.sqrt(budgetMs / frameMs);
  if (frameMs > budgetMs) return Math.max(0.08, now * Math.max(room, 0.5));
  return Math.min(1, now * Math.min(1.12, room));
}

function motionLimit(refreshMs: number, accel = 0) {
  const refresh = Math.min(Math.max(refreshMs || 0, 1000 / 120), 1000 / 20);
  const floor = 1000 / 12;
  const bend = Math.max(0, accel) / 2.4;
  const surge = 1 - 1 / (1 + bend * bend);
  return floor * (1 - surge) + refresh * surge;
}

export function createPicturePace() {
  let scale = 0.32;
  let period = 1000 / 60;
  let periodSamples = 0;
  let wasStill = false;
  return {
    get scale() {
      return scale;
    },
    step({
      gap = 0,
      displayW = 960,
      displayH = 540,
      still = false,
      accel = 0,
    }: {
      gap?: number;
      displayW?: number;
      displayH?: number;
      still?: boolean;
      accel?: number;
    } = {}) {
      if (gap >= 8 && gap <= 50) {
        period = periodSamples ? period * 0.85 + gap * 0.15 : gap;
        periodSamples += 1;
      }
      const refresh = periodSamples < 4 ? Math.max(period, 1000 / 30) : period;
      const sized = () => pictureSize(scale, displayW, displayH);
      if (!(gap > 0)) {
        const size = sized();
        return { scale, width: size.width, height: size.height };
      }
      const vsync = !still && accel >= 1;
      const target = still ? Infinity : vsync ? refresh : motionLimit(refresh, accel);
      const ease = (aim: number) => {
        const next = Math.max(0.08, Math.min(1, aim));
        if (vsync) return next;
        return scale + (next - scale) * 0.5;
      };
      if (wasStill && !still && gap > target) {
        const aim = scale * Math.sqrt(target / gap);
        const floorMiss = target + 0.5 >= 1000 / 12 && gap > 1000 / 12;
        scale = floorMiss ? Math.max(0.08, Math.min(1, aim)) : ease(aim);
        wasStill = false;
        const size = sized();
        return { scale, width: size.width, height: size.height };
      }
      if (still) {
        scale = stillScale(scale, gap);
        wasStill = true;
        const size = pictureSize(scale, displayW, displayH);
        return { scale, width: size.width, height: size.height };
      }
      wasStill = false;
      if (gap > target) {
        const aim = scale * Math.sqrt(target / gap);
        const floorMiss = !vsync && gap > 1000 / 12 && target + 0.5 >= 1000 / 12;
        scale = floorMiss ? Math.max(0.08, Math.min(scale, aim)) : ease(aim);
      } else if (gap < target * 0.9) scale = ease(scale * 1.12);
      const next = pictureSize(scale, displayW, displayH);
      return { scale, width: next.width, height: next.height };
    },
  };
}

/** First trace stays inside a small boot edge. Later traces may grow a little, and must shrink when a draw ran long. */
export function guardTrace(
  width: number,
  height: number,
  { measured = false, drawMs = 0, budgetMs = 48, prevW = 0, prevH = 0, boot = 320 } = {},
) {
  let w = Math.max(2, Math.round(width) || 2);
  let h = Math.max(2, Math.round(height) || 2);
  const clampTo = (maxW: number, maxH: number) => {
    const roomW = Math.max(2, maxW);
    const roomH = Math.max(2, maxH);
    if (w <= roomW && h <= roomH) return;
    const cut = Math.min(roomW / w, roomH / h);
    w = Math.max(2, Math.round((w * cut) / 4) * 4);
    h = Math.max(2, Math.round((h * cut) / 4) * 4);
  };
  if (!measured) {
    const long = Math.max(w, h);
    if (long > boot) clampTo((w * boot) / long, (h * boot) / long);
    return { width: w, height: h };
  }
  if (prevW > 0 && prevH > 0 && drawMs > budgetMs && budgetMs > 0) {
    const room = Math.sqrt(budgetMs / drawMs);
    clampTo(Math.max(96, prevW * room), Math.max(54, prevH * room));
  } else if (prevW > 0 && prevH > 0) {
    clampTo(prevW * 1.35, prevH * 1.35);
  }
  return { width: w, height: h };
}
