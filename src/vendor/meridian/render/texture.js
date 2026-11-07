// @ts-nocheck
export const ATLAS = 1024;
export const TEX_TILE = 128;
export const ATLAS_TILES = ATLAS / TEX_TILE;
export const SAND_TILE = 32;
export const WOOD_TILE = 33;
export const GRASS_TILE = 34;
export const ROCK_TILE = 35;
export const CLOTH_TILE = 36;
export const SKIN_TILE = 37;
export const BARK_TILE = 38;
export const HIDE_TILE = 39;
export const HORN_TILE = 40;
export const FEATHER_TILE = 41;
export const METAL_TILE = 42;
export const LEAF_TILE = 43;
export const SCALE_TILE = 44;
export const HAIR_TILE = 45;

export const SHAPE_TILE = {
  sand: SAND_TILE,
  wood: WOOD_TILE,
  grass: GRASS_TILE,
  rock: ROCK_TILE,
  cloth: CLOTH_TILE,
  skin: SKIN_TILE,
  bark: BARK_TILE,
  hide: HIDE_TILE,
  horn: HORN_TILE,
  feather: FEATHER_TILE,
  metal: METAL_TILE,
  leaf: LEAF_TILE,
  scale: SCALE_TILE,
  hair: HAIR_TILE,
};

export function makeTexture(width, height, fill) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = fill(x, y, width, height);
      const i = (y * width + x) * 4;
      data[i] = px[0];
      data[i + 1] = px[1];
      data[i + 2] = px[2];
      data[i + 3] = px.length > 3 ? px[3] : 255;
    }
  }
  return { width, height, data, revision: 0 };
}

function texHash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function texNoise(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const a = texHash(x0, y0);
  const b = texHash(x0 + 1, y0);
  const c = texHash(x0, y0 + 1);
  const d = texHash(x0 + 1, y0 + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function wrapCoord(value, period) {
  const span = Math.max(1, period);
  return ((value % span) + span) % span;
}

function periodicNoise(x, y, period) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const w = (value) => wrapCoord(value, period);
  const a = texHash(w(x0), w(y0));
  const b = texHash(w(x0 + 1), w(y0));
  const c = texHash(w(x0), w(y0 + 1));
  const d = texHash(w(x0 + 1), w(y0 + 1));
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

export function rectFor(tile) {
  const col = tile % ATLAS_TILES;
  const row = (tile / ATLAS_TILES) | 0;
  return [col / ATLAS_TILES, row / ATLAS_TILES, 1 / ATLAS_TILES, 1];
}

export function blitTexture(atlas, tile, tex) {
  const col = tile % ATLAS_TILES;
  const row = (tile / ATLAS_TILES) | 0;
  const x0 = col * TEX_TILE;
  const y0 = row * TEX_TILE;
  for (let y = 0; y < TEX_TILE; y++) {
    const sy = Math.min(tex.height - 1, (y * tex.height / TEX_TILE) | 0);
    const rowOff = (y0 + y) * ATLAS;
    const srcRow = sy * tex.width;
    for (let x = 0; x < TEX_TILE; x++) {
      const sx = Math.min(tex.width - 1, (x * tex.width / TEX_TILE) | 0);
      const si = (srcRow + sx) * 4;
      const di = (rowOff + x0 + x) * 4;
      atlas[di] = tex.data[si];
      atlas[di + 1] = tex.data[si + 1];
      atlas[di + 2] = tex.data[si + 2];
      atlas[di + 3] = tex.data[si + 3];
    }
  }
}

let sand;
let wood;
let grass;
let rock;
let dummy;

export function sandTexture() {
  if (!sand) {
    sand = makeTexture(128, 128, (x, y) => {
      const grain = periodicNoise(x / 8, y / 8, 16);
      const speckle = periodicNoise(x / 2, y / 2, 64);
      const mix = grain * 0.7 + speckle * 0.3;
      return [118 + mix * 80, 96 + mix * 62, 58 + mix * 32, 255];
    });
  }
  return sand;
}

export function grassTexture() {
  if (!grass) {
    grass = makeTexture(128, 128, (x, y) => {
      const clump = periodicNoise(x / 8, y / 8, 16);
      const blade = periodicNoise(x / 2, y / 6, 64);
      const mix = clump * 0.55 + blade * 0.45;
      return [46 + mix * 40, 92 + mix * 70, 34 + mix * 24, 255];
    });
  }
  return grass;
}

export function rockTexture() {
  if (!rock) {
    rock = makeTexture(128, 128, (x, y) => {
      const face = periodicNoise(x / 8, y / 8, 16);
      const crack = Math.abs(periodicNoise(x / 4, y / 8, 32) - 0.5);
      const mix = face * 0.75 + (1 - crack) * 0.25;
      return [92 + mix * 50, 88 + mix * 44, 80 + mix * 36, 255];
    });
  }
  return rock;
}

export function woodTexture() {
  if (!wood) {
    wood = makeTexture(128, 128, (x, y) => {
      const ring = 0.5 + 0.5 * Math.sin(x * 0.45 + texNoise(x / 12, y / 20) * 3);
      return [78 + ring * 70, 48 + ring * 36, 24 + ring * 16, 255];
    });
  }
  return wood;
}

export function dummyTexture() {
  if (!dummy) {
    dummy = makeTexture(128, 128, (x, y, w, h) => {
      const u = x / w - 0.5;
      const v = y / h - 0.5;
      const ring = Math.floor(Math.hypot(u, v) * 8) % 2 === 0;
      return ring ? [214, 42, 32, 255] : [236, 214, 176, 255];
    });
  }
  return dummy;
}

function tone(mix, base, gain) {
  return [
    Math.max(0, Math.min(255, Math.round(base[0] + mix * gain[0]))),
    Math.max(0, Math.min(255, Math.round(base[1] + mix * gain[1]))),
    Math.max(0, Math.min(255, Math.round(base[2] + mix * gain[2]))),
    255,
  ];
}

let cloth;
let skin;
let bark;
let hide;
let horn;
let feather;
let metal;
let leaf;
let scales;
let hair;

export function clothTexture() {
  if (!cloth) {
    cloth = makeTexture(128, 128, (x, y) => {
      const warp = 0.5 + 0.5 * Math.sin(x * 0.9);
      const weft = 0.5 + 0.5 * Math.sin(y * 0.9);
      const thread = warp * 0.55 + weft * 0.45;
      const fleck = periodicNoise(x / 4, y / 4, 32);
      return tone(thread * 0.7 + fleck * 0.3, [118, 112, 102], [90, 84, 74]);
    });
  }
  return cloth;
}

export function skinTexture() {
  if (!skin) {
    skin = makeTexture(128, 128, (x, y) => {
      const pore = periodicNoise(x / 2, y / 2, 64);
      const blush = periodicNoise(x / 14, y / 14, 16);
      return tone(pore * 0.35 + blush * 0.65, [150, 112, 88], [50, 40, 32]);
    });
  }
  return skin;
}

export function barkTexture() {
  if (!bark) {
    bark = makeTexture(128, 128, (x, y) => {
      const ridge = 0.5 + 0.5 * Math.sin(x * 0.55 + periodicNoise(x / 10, y / 6, 16) * 2);
      const crack = periodicNoise(x / 3, y / 18, 32);
      return tone(ridge * 0.65 + crack * 0.35, [72, 48, 28], [70, 42, 22]);
    });
  }
  return bark;
}

export function hideTexture() {
  if (!hide) {
    hide = makeTexture(128, 128, (x, y) => {
      const grain = periodicNoise(x / 6, y / 3, 32);
      const crease = Math.abs(Math.sin(y * 0.18 + periodicNoise(x / 12, y / 12, 16) * 3));
      return tone(grain * 0.6 + crease * 0.4, [92, 64, 40], [70, 48, 28]);
    });
  }
  return hide;
}

export function hornTexture() {
  if (!horn) {
    horn = makeTexture(128, 128, (x, y) => {
      const band = 0.5 + 0.5 * Math.sin(y * 0.7);
      const scuff = periodicNoise(x / 5, y / 5, 32);
      return tone(band * 0.75 + scuff * 0.25, [120, 96, 58], [80, 60, 30]);
    });
  }
  return horn;
}

export function featherTexture() {
  if (!feather) {
    feather = makeTexture(128, 128, (x, y) => {
      const barb = 0.55 + 0.45 * Math.abs(Math.sin(x * 0.8 + y * 0.15));
      const vane = periodicNoise(x / 8, y / 4, 32);
      return tone(barb * 0.7 + vane * 0.3, [168, 168, 162], [70, 70, 66]);
    });
  }
  return feather;
}

export function metalTexture() {
  if (!metal) {
    metal = makeTexture(128, 128, (x, y) => {
      const brush = 0.5 + 0.5 * Math.sin(y * 1.4 + periodicNoise(x / 16, y / 8, 16));
      const seam = Math.abs(wrapCoord(x, 32) - 16) < 1.2 ? 0.15 : 0;
      return tone(brush * 0.85 + seam, [108, 112, 116], [80, 82, 86]);
    });
  }
  return metal;
}

export function leafTexture() {
  if (!leaf) {
    leaf = makeTexture(128, 128, (x, y) => {
      const vein = Math.abs(Math.sin(x * 0.35)) < 0.18 ? 0.25 : 0;
      const blade = periodicNoise(x / 5, y / 9, 32);
      return tone(blade * 0.8 + vein, [48, 92, 36], [50, 80, 30]);
    });
  }
  return leaf;
}

export function scaleTexture() {
  if (!scales) {
    scales = makeTexture(128, 128, (x, y) => {
      const row = Math.floor(y / 8);
      const u = wrapCoord(x + (row % 2) * 6, 12);
      const v = wrapCoord(y, 8);
      const edge = u < 1.3 || v < 1.2 ? 0.22 : 0.9;
      const grain = periodicNoise(x / 3, y / 3, 32);
      return tone(edge * 0.72 + grain * 0.28, [108, 104, 92], [62, 52, 40]);
    });
  }
  return scales;
}

export function hairTexture() {
  if (!hair) {
    hair = makeTexture(128, 128, (x, y) => {
      const strand = 0.4 + 0.6 * Math.abs(Math.sin(x * 1.15 + periodicNoise(x / 18, y / 7, 16) * 1.4));
      const glint = periodicNoise(x / 2, y / 11, 32);
      return tone(strand * 0.78 + glint * 0.22, [96, 90, 82], [64, 54, 46]);
    });
  }
  return hair;
}
