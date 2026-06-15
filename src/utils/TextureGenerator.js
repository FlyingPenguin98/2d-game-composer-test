import { PAL, PixelCanvas, TILE } from './SnesPalettes.js';

/**
 * Procedural SNES-style 16×16 tile and sprite generator.
 * Limited palettes, 1px outlines, dithered shading — no HD lighting.
 */
export class TextureGenerator {
  static generateAll(textures) {
    this._tex = textures.textures ?? textures;
    this.generateTileset();
    this.generatePlayerSheet();
    this.generateEnemies();
    this.generateProjectiles();
    this.generateFX();
    this.generateUI();
  }

  static addCanvas(key, canvas) {
    const tex = this._tex;
    if (tex.exists(key)) tex.remove(key);
    tex.addCanvas(key, canvas);
  }

  /** Split canvas textures into proper 16×16 animation frames. */
  static registerFrames(textures) {
    const tex = textures.textures ?? textures;
    const sheets = [
      { key: 'player', fw: 16, fh: 16, count: 8 },
      { key: 'enemy_slime', fw: 16, fh: 16, count: 2 },
      { key: 'enemy_bat', fw: 16, fh: 16, count: 2 },
    ];
    for (const { key, fw, fh, count } of sheets) {
      const sheet = tex.get(key);
      for (let i = 0; i < count; i++) {
        if (!sheet.has(i)) {
          sheet.add(i, 0, i * fw, 0, fw, fh);
        }
      }
    }
  }

  /** Register individual tile frames for reliable rendering (avoids setCrop bugs). */
  static registerTileFrames(textures) {
    const tex = textures.textures ?? textures;
    const sheet = tex.get('tileset');
    const cols = 8;
    const tileCount = 16;
    for (let i = 0; i < tileCount; i++) {
      const name = `tile_${i}`;
      if (!sheet.has(name)) {
        sheet.add(name, 0, (i % cols) * TILE, Math.floor(i / cols) * TILE, TILE, TILE);
      }
    }
  }

  // ── Tileset (16×16 tiles in a sheet) ──────────────────────────────

  static generateTileset() {
    const cols = 8;
    const rows = 4;
    const canvas = document.createElement('canvas');
    canvas.width = cols * TILE;
    canvas.height = rows * TILE;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const tiles = [
      () => this.tileGrass(PAL.grass1, PAL.grass2),
      () => this.tileGrass(PAL.grass2, PAL.grass3),
      () => this.tileGrassFlowers(),
      () => this.tileGrassDark(),
      () => this.tileDirt(),
      () => this.tileStone(),
      () => this.tileTrunk(),
      () => this.tileBush(),
      () => this.tileCanopyNW(),
      () => this.tileCanopyNE(),
      () => this.tileCanopySW(),
      () => this.tileCanopySE(),
      () => this.tileCanopyFull(),
      () => this.tileWater(0),
      () => this.tileWater(1),
      () => this.tilePath(),
    ];

    tiles.forEach((fn, i) => {
      const tx = (i % cols) * TILE;
      const ty = Math.floor(i / cols) * TILE;
      const tileCanvas = fn();
      ctx.drawImage(tileCanvas, tx, ty);
    });

    this.addCanvas( 'tileset', canvas);
  }

  static tileGrass(c1, c2) {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, c1, c2);
    // Tiny grass tufts
    pc.set(3, 5, PAL.grass3);
    pc.set(4, 4, PAL.grass1);
    pc.set(10, 8, PAL.grass3);
    pc.set(11, 7, PAL.grass1);
    pc.set(7, 12, PAL.grass3);
    return pc.flush();
  }

  static tileGrassFlowers() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.grass1, PAL.grass2);
    pc.set(4, 6, PAL.flower1);
    pc.set(4, 5, PAL.flower2);
    pc.set(11, 10, PAL.flower2);
    pc.set(11, 9, PAL.flower1);
    return pc.flush();
  }

  static tileGrassDark() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.grass2, PAL.grassDark);
    return pc.flush();
  }

  static tileDirt() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.dirt1, PAL.dirt2);
    pc.set(2, 3, PAL.dirt3);
    pc.set(9, 7, PAL.dirt3);
    pc.set(13, 12, PAL.dirt3);
    pc.set(6, 14, PAL.dirt3);
    return pc.flush();
  }

  static tileStone() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.rect(0, 0, TILE, TILE, PAL.stone2);
    // Cobble pattern
    for (let y = 0; y < TILE; y += 4) {
      for (let x = (y / 4) % 2 === 0 ? 0 : 4; x < TILE; x += 8) {
        pc.rect(x, y, 7, 3, PAL.stone1);
        pc.set(x, y, PAL.stone3);
        pc.set(x + 6, y + 2, PAL.stone3);
      }
    }
    return pc.flush();
  }

  static tilePath() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.dirt1, PAL.dirt2);
    pc.rect(0, 0, TILE, 1, PAL.grass2);
    pc.rect(0, TILE - 1, TILE, 1, PAL.grass2);
    return pc.flush();
  }

  static tileTrunk() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.grass1, PAL.grass2);
    pc.rect(6, 4, 4, 12, PAL.trunk2);
    pc.rect(7, 4, 2, 12, PAL.trunk1);
    pc.set(6, 4, PAL.trunk3);
    pc.set(9, 4, PAL.trunk3);
    return pc.flush();
  }

  static tileBush() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.grass1, PAL.grass2);
    pc.rect(4, 8, 8, 6, PAL.leaf2);
    pc.rect(3, 6, 10, 4, PAL.leaf1);
    pc.rect(5, 5, 6, 2, PAL.leaf1);
    pc.set(4, 8, PAL.leaf3);
    pc.set(11, 9, PAL.leaf3);
    pc.set(7, 5, PAL.leaf4);
    return pc.flush();
  }

  static tileCanopyFull() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.rect(0, 0, TILE, TILE, PAL.leaf2);
    pc.rect(1, 1, TILE - 2, TILE - 2, PAL.leaf1);
    pc.rect(3, 3, TILE - 6, TILE - 6, PAL.leaf3);
    pc.set(5, 5, PAL.leaf4);
    pc.set(10, 7, PAL.leaf4);
    pc.set(7, 10, PAL.leaf4);
    // Highlight dots
    pc.set(4, 4, PAL.leaf1);
    pc.set(11, 5, PAL.leaf1);
    return pc.flush();
  }

  static tileCanopyNW() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.grass1, PAL.grass2);
    pc.rect(0, 0, TILE, 10, PAL.leaf2);
    pc.rect(0, 0, TILE, 8, PAL.leaf1);
    pc.rect(0, 0, 10, 6, PAL.leaf3);
    pc.set(2, 3, PAL.leaf4);
    return pc.flush();
  }

  static tileCanopyNE() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.grass1, PAL.grass2);
    pc.rect(0, 0, TILE, 10, PAL.leaf2);
    pc.rect(0, 0, TILE, 8, PAL.leaf1);
    pc.rect(6, 0, 10, 6, PAL.leaf3);
    pc.set(12, 3, PAL.leaf4);
    return pc.flush();
  }

  static tileCanopySW() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.grass1, PAL.grass2);
    pc.rect(0, 6, TILE, 10, PAL.leaf2);
    pc.rect(0, 8, TILE, 8, PAL.leaf1);
    pc.rect(0, 10, 10, 6, PAL.leaf3);
    return pc.flush();
  }

  static tileCanopySE() {
    const pc = new PixelCanvas(TILE, TILE, 1);
    pc.ditherRect(0, 0, TILE, TILE, PAL.grass1, PAL.grass2);
    pc.rect(0, 6, TILE, 10, PAL.leaf2);
    pc.rect(0, 8, TILE, 8, PAL.leaf1);
    pc.rect(6, 10, 10, 6, PAL.leaf3);
    return pc.flush();
  }

  static tileWater(frame) {
    const pc = new PixelCanvas(TILE, TILE, 1);
    const light = frame === 0 ? PAL.water1 : PAL.water2;
    const dark = frame === 0 ? PAL.water2 : PAL.water3;
    pc.ditherRect(0, 0, TILE, TILE, light, dark);
    // Wave lines
    for (let x = 0; x < TILE; x++) {
      pc.set(x, 4 + (frame ? 1 : 0), PAL.water1);
      pc.set(x, 11 + (frame ? 0 : 1), PAL.water3);
    }
    return pc.flush();
  }

  // ── Player sprite sheet (16×16, 4 dirs × 2 walk frames) ───────────

  static generatePlayerSheet() {
    const fw = 16;
    const fh = 16;
    const frames = 8; // down0, down1, up0, up1, left0, left1, right0, right1
    const canvas = document.createElement('canvas');
    canvas.width = fw * frames;
    canvas.height = fh;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const dirs = ['down', 'up', 'left', 'right'];
    dirs.forEach((dir, di) => {
      for (let step = 0; step < 2; step++) {
        const pc = this.drawHero(dir, step);
        ctx.drawImage(pc.flush(), (di * 2 + step) * fw, 0);
      }
    });

    this.addCanvas( 'player', canvas);
  }

  static drawHero(dir, step) {
    const pc = new PixelCanvas(16, 16, 1);

    // Legs (animate on step)
    const legOff = step === 1 ? 1 : 0;
    pc.set(6 - legOff, 13, PAL.boot2);
    pc.set(7 - legOff, 13, PAL.boot1);
    pc.set(8 + legOff, 13, PAL.boot1);
    pc.set(9 + legOff, 13, PAL.boot2);
    pc.set(6, 12, PAL.boot2);
    pc.set(7, 12, PAL.boot1);
    pc.set(8, 12, PAL.boot1);
    pc.set(9, 12, PAL.boot2);

    // Tunic body
    pc.rect(5, 8, 6, 5, PAL.tunic2);
    pc.rect(6, 8, 4, 5, PAL.tunic1);
    pc.set(5, 8, PAL.tunic3);
    pc.set(10, 8, PAL.tunic3);
    pc.set(7, 8, PAL.tunic1);
    pc.set(8, 8, PAL.tunic1);

    // Belt
    pc.rect(5, 11, 6, 1, PAL.boot1);

    // Head
    pc.rect(6, 4, 4, 4, PAL.skin2);
    pc.rect(7, 4, 2, 4, PAL.skin1);
    // Hair
    pc.rect(6, 3, 4, 2, PAL.hair1);
    pc.set(5, 4, PAL.hair2);
    pc.set(10, 4, PAL.hair2);
    pc.set(7, 3, PAL.hair2);

    // Face direction
    if (dir === 'down') {
      pc.set(7, 6, PAL.black);
      pc.set(8, 6, PAL.black);
      pc.set(7, 7, PAL.skin3);
    } else if (dir === 'up') {
      pc.rect(6, 4, 4, 3, PAL.hair1);
      pc.set(7, 3, PAL.hair2);
    } else if (dir === 'left') {
      pc.set(6, 6, PAL.black);
      pc.set(7, 7, PAL.skin3);
    } else {
      pc.set(9, 6, PAL.black);
      pc.set(8, 7, PAL.skin3);
    }

    // Sword on side
    if (dir === 'left' || dir === 'up') {
      pc.set(4, 7, PAL.sword1);
      pc.set(4, 6, PAL.sword2);
      pc.set(4, 5, PAL.sword3);
      pc.set(4, 4, PAL.sword1);
    } else {
      pc.set(11, 7, PAL.sword1);
      pc.set(11, 6, PAL.sword2);
      pc.set(11, 5, PAL.sword3);
      pc.set(11, 4, PAL.sword1);
    }

    pc.outline();
    return pc;
  }

  // ── Enemies ───────────────────────────────────────────────────────

  static generateEnemies() {
    this.generateSlime();
    this.generateSkeleton();
    this.generateBat();
  }

  static generateSlime() {
    const fw = 16;
    const frames = 2;
    const canvas = document.createElement('canvas');
    canvas.width = fw * frames;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < frames; f++) {
      const pc = new PixelCanvas(16, 16, 1);
      const squash = f === 1 ? 1 : 0;
      const yOff = squash ? 1 : 0;

      // DQ-style slime dome
      for (let y = 6 + yOff; y < 14; y++) {
        const prog = (y - 6) / 8;
        const halfW = Math.floor(2 + prog * 5);
        for (let x = 8 - halfW; x <= 8 + halfW; x++) {
          const c = y < 9 ? PAL.slime1 : y < 12 ? PAL.slime2 : PAL.slime3;
          pc.set(x, y, c);
        }
      }
      // Highlight
      pc.set(6, 8 + yOff, PAL.slimeHi);
      pc.set(7, 7 + yOff, PAL.slimeHi);
      // Eyes
      pc.set(6, 10 + yOff, PAL.black);
      pc.set(9, 10 + yOff, PAL.black);
      pc.set(6, 11 + yOff, PAL.white);
      pc.set(9, 11 + yOff, PAL.white);

      pc.outline();
      ctx.drawImage(pc.flush(), f * fw, 0);
    }

    this.addCanvas( 'enemy_slime', canvas);
  }

  static generateSkeleton() {
    const pc = new PixelCanvas(16, 16, 1);

    // Skull
    pc.rect(5, 2, 6, 5, PAL.bone1);
    pc.rect(6, 3, 4, 3, PAL.bone2);
    pc.set(6, 4, PAL.boneEye);
    pc.set(9, 4, PAL.boneEye);
    pc.set(7, 6, PAL.bone3);
    pc.set(8, 6, PAL.bone3);
    // Jaw
    pc.set(6, 7, PAL.bone2);
    pc.set(9, 7, PAL.bone2);

    // Spine & ribs
    pc.rect(7, 7, 2, 6, PAL.bone2);
    for (let y = 8; y < 12; y += 2) {
      pc.set(5, y, PAL.bone1);
      pc.set(10, y, PAL.bone1);
    }

    // Arms
    pc.set(4, 9, PAL.bone2);
    pc.set(3, 9, PAL.bone1);
    pc.set(11, 9, PAL.bone2);
    pc.set(12, 9, PAL.bone1);

    // Legs
    pc.set(6, 13, PAL.bone2);
    pc.set(7, 14, PAL.bone1);
    pc.set(8, 14, PAL.bone1);
    pc.set(9, 13, PAL.bone2);

    pc.outline();
    this.addCanvas( 'enemy_skeleton', pc.flush());
  }

  static generateBat() {
    const fw = 16;
    const frames = 2;
    const canvas = document.createElement('canvas');
    canvas.width = fw * frames;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < frames; f++) {
      const pc = new PixelCanvas(16, 16, 1);
      const wingUp = f === 0;

      // Wings
      if (wingUp) {
        pc.set(2, 6, PAL.batWing);
        pc.set(3, 5, PAL.bat2);
        pc.set(4, 4, PAL.batWing);
        pc.set(12, 6, PAL.batWing);
        pc.set(11, 5, PAL.bat2);
        pc.set(10, 4, PAL.batWing);
      } else {
        pc.set(2, 8, PAL.batWing);
        pc.set(3, 9, PAL.bat2);
        pc.set(4, 10, PAL.batWing);
        pc.set(12, 8, PAL.batWing);
        pc.set(11, 9, PAL.bat2);
        pc.set(10, 10, PAL.batWing);
      }

      // Body
      pc.rect(6, 6, 4, 5, PAL.bat2);
      pc.rect(7, 7, 2, 3, PAL.bat1);
      // Ears
      pc.set(6, 5, PAL.bat3);
      pc.set(9, 5, PAL.bat3);
      // Eyes
      pc.set(7, 7, PAL.batEye);
      pc.set(8, 7, PAL.batEye);

      pc.outline();
      ctx.drawImage(pc.flush(), f * fw, 0);
    }

    this.addCanvas( 'enemy_bat', canvas);
  }

  // ── Projectiles & FX ──────────────────────────────────────────────

  static generateProjectiles() {
    const pc = new PixelCanvas(8, 8, 1);
    pc.set(3, 3, PAL.bolt1);
    pc.set(4, 3, PAL.bolt1);
    pc.set(3, 4, PAL.bolt2);
    pc.set(4, 4, PAL.bolt2);
    pc.set(2, 3, PAL.bolt3);
    pc.set(5, 4, PAL.bolt3);
    pc.set(3, 2, PAL.bolt3);
    pc.set(4, 5, PAL.bolt3);
    this.addCanvas( 'projectile', pc.flush());
  }

  static generateFX() {
    const pc = new PixelCanvas(4, 4, 1);
    pc.rect(1, 1, 2, 2, PAL.white);
    this.addCanvas( 'particle', pc.flush());

    // 8×8 SNES shadow blob
    const sh = new PixelCanvas(8, 4, 1);
    sh.set(2, 1, '#00000055');
    sh.set(3, 1, '#00000055');
    sh.set(4, 1, '#00000055');
    sh.set(5, 1, '#00000055');
    sh.set(1, 2, '#00000044');
    sh.set(2, 2, '#00000066');
    sh.set(3, 2, '#00000066');
    sh.set(4, 2, '#00000066');
    sh.set(5, 2, '#00000066');
    sh.set(6, 2, '#00000044');
    // Use solid colors since canvas won't do alpha in pixel buf well
    const sh2 = new PixelCanvas(8, 4, 1);
    sh2.set(2, 1, '#283028');
    sh2.set(3, 1, '#283028');
    sh2.set(4, 1, '#283028');
    sh2.set(5, 1, '#283028');
    sh2.set(1, 2, '#203020');
    sh2.set(2, 2, '#303830');
    sh2.set(3, 2, '#303830');
    sh2.set(4, 2, '#303830');
    sh2.set(5, 2, '#303830');
    sh2.set(6, 2, '#203020');
    this.addCanvas( 'shadow', sh2.flush());

    // Heart icon for HUD
    const heart = new PixelCanvas(8, 8, 1);
    heart.set(2, 2, PAL.boneEye);
    heart.set(5, 2, PAL.boneEye);
    heart.set(1, 3, PAL.boneEye);
    heart.set(2, 3, PAL.boneEye);
    heart.set(3, 3, PAL.boneEye);
    heart.set(4, 3, PAL.boneEye);
    heart.set(5, 3, PAL.boneEye);
    heart.set(6, 3, PAL.boneEye);
    heart.set(1, 4, PAL.boneEye);
    heart.set(6, 4, PAL.boneEye);
    heart.set(2, 5, PAL.boneEye);
    heart.set(5, 5, PAL.boneEye);
    heart.set(3, 6, PAL.boneEye);
    heart.set(4, 6, PAL.boneEye);
    heart.set(3, 7, PAL.boneEye);
    heart.set(4, 7, PAL.boneEye);
    this.addCanvas( 'heart', heart.flush());

    // Empty heart
    const heartEmpty = new PixelCanvas(8, 8, 1);
    heartEmpty.set(2, 2, PAL.bone3);
    heartEmpty.set(5, 2, PAL.bone3);
    heartEmpty.rect(1, 3, 6, 2, PAL.bone3);
    heartEmpty.set(1, 5, PAL.bone3);
    heartEmpty.set(6, 5, PAL.bone3);
    heartEmpty.set(2, 6, PAL.bone3);
    heartEmpty.set(5, 6, PAL.bone3);
    heartEmpty.set(3, 7, PAL.bone3);
    heartEmpty.set(4, 7, PAL.bone3);
    this.addCanvas( 'heart_empty', heartEmpty.flush());
  }

  static generateUI() {
    // 32×32 SNES window corner tile (FF6 style)
    const pc = new PixelCanvas(32, 32, 1);
    // Outer white border
    pc.rect(0, 0, 32, 32, PAL.uiWhite);
    // Dark blue body
    pc.rect(2, 2, 28, 28, PAL.uiFill);
    // Inner highlight/shadow bevel
    pc.rect(2, 2, 28, 2, PAL.uiHighlight);
    pc.rect(2, 2, 2, 28, PAL.uiHighlight);
    pc.rect(28, 2, 2, 28, PAL.uiShadow);
    pc.rect(2, 28, 28, 2, PAL.uiShadow);
    this.addCanvas( 'ui_window', pc.flush());
  }
}
