import { PAL, TILE, SPRITE_SCALE } from '../utils/SnesPalettes.js';
import { SnesUI } from '../utils/SnesUI.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(PAL.uiShadow);

    this.drawSky(width, height);
    this.drawTileBorder(width, height);
    this.drawTitle(width);
    this.drawMenuBox(width, height);
    this.drawHeroPreview(width, height);

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  /** SNES title screens use flat color bands, not gradients. */
  drawSky(width, height) {
    const bands = [
      { y: 0, h: 0.35, color: 0x3880c8 },
      { y: 0.35, h: 0.15, color: 0x5090d0 },
      { y: 0.5, h: 0.15, color: 0x68a0d8 },
      { y: 0.65, h: 0.35, color: 0x287028 },
    ];
    const g = this.add.graphics().setDepth(0);
    for (const band of bands) {
      g.fillStyle(band.color);
      g.fillRect(0, height * band.y, width, height * band.h);
    }

    // Pixel clouds
    const cloudColor = 0xf0f0f8;
    const drawCloud = (cx, cy, s) => {
      g.fillStyle(cloudColor);
      g.fillRect(cx, cy, 4 * s, 2 * s);
      g.fillRect(cx + s, cy - s, 3 * s, 2 * s);
      g.fillRect(cx + 3 * s, cy, 3 * s, 2 * s);
    };
    drawCloud(80, 60, 4);
    drawCloud(320, 40, 3);
    drawCloud(600, 70, 5);
    drawCloud(780, 50, 3);

    // Distant mountain silhouettes
    g.fillStyle(0x185818);
    for (let i = 0; i < 8; i++) {
      const mx = i * 130 - 20;
      const mh = 40 + (i % 3) * 20;
      g.fillTriangle(mx, height * 0.65, mx + 60, height * 0.65, mx + 30, height * 0.65 - mh);
    }
  }

  drawTileBorder(width, height) {
    const displayTile = TILE * SPRITE_SCALE;

    // Grass strip along bottom third
    for (let col = 0; col < Math.ceil(width / displayTile); col++) {
      const frame = col % 2;
      this.add.image(col * displayTile, height * 0.65, 'tileset')
        .setOrigin(0, 0)
        .setDisplaySize(displayTile, displayTile)
        .setDepth(1)
        .setCrop(frame * TILE, 0, TILE, TILE);
    }
    for (let col = 0; col < Math.ceil(width / displayTile); col++) {
      this.add.image(col * displayTile, height * 0.65 + displayTile, 'tileset')
        .setOrigin(0, 0)
        .setDisplaySize(displayTile, displayTile)
        .setDepth(1)
        .setCrop((col % 2) * TILE, 0, TILE, TILE);
    }
  }

  drawTitle(width) {
    const titleY = this.scale.height * 0.18;

    // Title shadow
    this.add.text(width / 2 + 2, titleY + 2, 'ELDERGROVE', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '48px',
      color: '#001030',
      resolution: 2,
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, titleY, 'ELDERGROVE', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '48px',
      color: PAL.uiGold,
      resolution: 2,
    }).setOrigin(0.5).setDepth(11);

    this.add.text(width / 2, titleY + 44, 'Chronicles of the Arcane', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '14px',
      color: PAL.uiText,
      resolution: 2,
    }).setOrigin(0.5).setDepth(11);
  }

  drawMenuBox(width, height) {
    const boxW = 280;
    const boxH = 120;
    const boxX = width / 2 - boxW / 2;
    const boxY = height * 0.52;

    SnesUI.drawWindow(this, boxX, boxY, boxW, boxH, 20);

    SnesUI.createMenuItem(this, boxX + 20, boxY + 20, '▶  Start New Game', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('GameScene'));
    });

    SnesUI.snesText(this, boxX + 20, boxY + 70, 'WASD / Arrows — Move', {
      size: '12px',
      color: PAL.uiTextDim,
      depth: 21,
    });
    SnesUI.snesText(this, boxX + 20, boxY + 88, 'Auto-attack nearest enemy', {
      size: '12px',
      color: PAL.uiTextDim,
      depth: 21,
    });
  }

  drawHeroPreview(width, height) {
    const hero = this.add.sprite(width / 2, height * 0.38, 'player', 0)
      .setScale(SPRITE_SCALE * 2)
      .setDepth(15);

    this.tweens.add({
      targets: hero,
      y: height * 0.38 - 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Stepped',
    });

    this.add.image(width / 2, height * 0.38 + 28, 'shadow')
      .setScale(SPRITE_SCALE * 2)
      .setDepth(14)
      .setAlpha(0.7);
  }
}
