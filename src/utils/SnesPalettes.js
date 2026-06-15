/** SNES-inspired 15-bit color palettes (FF6 / LTTP / DQ style). */
export const PAL = {
  // UI window (FF6 blue box)
  uiWhite: '#f8f8f8',
  uiBorder: '#082050',
  uiFill: '#1040a0',
  uiHighlight: '#5090e0',
  uiShadow: '#001030',
  uiText: '#f8f8f8',
  uiTextDim: '#90b0d0',
  uiGold: '#f8d878',

  // Environment
  grass1: '#40a040',
  grass2: '#388838',
  grass3: '#287028',
  grassDark: '#185818',
  dirt1: '#a07040',
  dirt2: '#885830',
  dirt3: '#684020',
  stone1: '#9090a0',
  stone2: '#686878',
  stone3: '#484858',
  water1: '#3888c8',
  water2: '#2060a0',
  water3: '#104080',
  trunk1: '#684020',
  trunk2: '#503018',
  trunk3: '#382010',
  leaf1: '#208030',
  leaf2: '#186828',
  leaf3: '#085018',
  leaf4: '#004010',
  flower1: '#f878a8',
  flower2: '#f8d030',

  // Hero (green tunic, like classic fantasy)
  outline: '#101010',
  skin1: '#f8c898',
  skin2: '#d8a070',
  skin3: '#b87850',
  hair1: '#684020',
  hair2: '#503018',
  tunic1: '#38a838',
  tunic2: '#288028',
  tunic3: '#186018',
  boot1: '#684020',
  boot2: '#503018',
  sword1: '#d0d0e0',
  sword2: '#9090a8',
  sword3: '#686880',

  // Slime (DQ blue)
  slime1: '#5090f8',
  slime2: '#3070d8',
  slime3: '#1850b0',
  slimeHi: '#90c8ff',

  // Skeleton
  bone1: '#f8f0d8',
  bone2: '#d0c8b0',
  bone3: '#a8a090',
  boneEye: '#f83838',

  // Bat
  bat1: '#584880',
  bat2: '#403060',
  bat3: '#281848',
  batEye: '#f83838',
  batWing: '#7868a8',

  // Magic bolt
  bolt1: '#f8f878',
  bolt2: '#f8a830',
  bolt3: '#e87020',

  // FX
  white: '#f8f8f8',
  black: '#101010',
  shadow: '#000000',
};

/** Shared pixel-drawing helpers for procedural SNES sprites. */
export class PixelCanvas {
  constructor(w, h, scale = 1) {
    this.w = w;
    this.h = h;
    this.scale = scale;
    this.canvas = document.createElement('canvas');
    this.canvas.width = w * scale;
    this.canvas.height = h * scale;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.buf = new Array(w * h).fill(null);
  }

  set(x, y, color) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.buf[y * this.w + x] = color;
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.buf[y * this.w + x];
  }

  rect(x, y, rw, rh, color) {
    for (let dy = 0; dy < rh; dy++) {
      for (let dx = 0; dx < rw; dx++) {
        this.set(x + dx, y + dy, color);
      }
    }
  }

  /** 2x2 Bayer dither between two colors. */
  ditherRect(x, y, rw, rh, c1, c2) {
    const bayer = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];
    for (let dy = 0; dy < rh; dy++) {
      for (let dx = 0; dx < rw; dx++) {
        const t = bayer[(dy + y) % 4][(dx + x) % 4];
        this.set(x + dx, y + dy, t < 8 ? c1 : c2);
      }
    }
  }

  outline(color = PAL.outline) {
    const copy = [...this.buf];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (copy[y * this.w + x]) continue;
        const n =
          copy[(y - 1) * this.w + x] ||
          copy[(y + 1) * this.w + x] ||
          copy[y * this.w + (x - 1)] ||
          copy[y * this.w + (x + 1)];
        if (n) this.buf[y * this.w + x] = color;
      }
    }
  }

  flush() {
    const { ctx, scale, w, h, buf } = this;
    ctx.clearRect(0, 0, w * scale, h * scale);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = buf[y * w + x];
        if (c) {
          ctx.fillStyle = c;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    return this.canvas;
  }
}

export const TILE = 16;
export const SPRITE_SCALE = 2;
