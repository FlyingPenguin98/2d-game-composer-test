import { PAL, TILE, SPRITE_SCALE } from '../utils/SnesPalettes.js';
import { SnesUI } from '../utils/SnesUI.js';
import { SceneTransition } from '../utils/SceneTransition.js';
import { AssetService } from '../services/AssetService.js';
import { FONTS } from '../config/GameConfig.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    AssetService.assertReady(this.game);

    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(PAL.uiShadow);

    this.drawBackground(width, height);
    this.drawTitlePanel(width);
    this.drawMenuPanel(width, height);
    this.drawHeroPreview(width, height);
    SnesUI.drawScreenBorder(this, width, height);

    SceneTransition.onEnter(this, 300);
  }

  drawBackground(width, height) {
    const g = this.add.graphics().setDepth(0);

    // SNES sky — 3 flat bands
    g.fillStyle(0x3070b8);
    g.fillRect(0, 0, width, height * 0.45);
    g.fillStyle(0x4890d0);
    g.fillRect(0, height * 0.45, width, height * 0.12);
    g.fillStyle(0x287028);
    g.fillRect(0, height * 0.57, width, height * 0.43);

    // Pixel clouds
    const drawCloud = (cx, cy) => {
      g.fillStyle(0xf0f0f8);
      g.fillRect(cx, cy, 24, 8);
      g.fillRect(cx + 8, cy - 8, 16, 8);
      g.fillRect(cx + 16, cy, 20, 8);
    };
    drawCloud(60, 50);
    drawCloud(280, 30);
    drawCloud(520, 55);
    drawCloud(740, 35);

    // Mountains
    g.fillStyle(0x185818);
    for (let i = 0; i < 7; i++) {
      const mx = i * 150 - 10;
      const mh = 50 + (i % 3) * 16;
      g.fillTriangle(mx, height * 0.57, mx + 70, height * 0.57, mx + 35, height * 0.57 - mh);
    }

    // Tiled meadow
    const displayTile = TILE * SPRITE_SCALE;
    const groundY = height * 0.57;
    const rows = Math.ceil((height - groundY) / displayTile) + 1;
    const cols = Math.ceil(width / displayTile) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileIdx = (col + row) % 2 === 0 ? 0 : 1;
        if ((col + row) % 5 === 0) {
          this.add.image(col * displayTile, groundY + row * displayTile, 'tileset', `tile_2`)
            .setOrigin(0, 0).setDisplaySize(displayTile, displayTile).setDepth(1);
        } else {
          this.add.image(col * displayTile, groundY + row * displayTile, 'tileset', `tile_${tileIdx}`)
            .setOrigin(0, 0).setDisplaySize(displayTile, displayTile).setDepth(1);
        }
      }
    }
  }

  drawTitlePanel(width) {
    const panelW = 420;
    const panelH = 72;
    const panelX = width / 2 - panelW / 2;
    const panelY = 48;

    SnesUI.drawWindow(this, panelX, panelY, panelW, panelH, 10);

    this.add.text(width / 2, panelY + 22, 'ELDERGROVE', {
      fontFamily: FONTS.PIXEL,
      fontSize: '32px',
      color: PAL.uiGold,
      resolution: 2,
    }).setOrigin(0.5).setDepth(11);

    this.add.text(width / 2, panelY + 50, 'Chronicles of the Arcane', {
      fontFamily: FONTS.PIXEL,
      fontSize: '11px',
      color: PAL.uiTextDim,
      resolution: 2,
    }).setOrigin(0.5).setDepth(11);
  }

  drawMenuPanel(width, height) {
    const boxW = 300;
    const boxH = 130;
    const boxX = width / 2 - boxW / 2;
    const boxY = height * 0.58;

    SnesUI.drawWindow(this, boxX, boxY, boxW, boxH, 20);

    SnesUI.createMenuItem(this, boxX + 16, boxY + 16, 'Start New Game', () => {
      SceneTransition.toGame(this);
    });

    SnesUI.snesText(this, boxX + 24, boxY + 58, 'WASD / Arrows — Move', {
      size: '11px', color: PAL.uiTextDim, depth: 21,
    });
    SnesUI.snesText(this, boxX + 24, boxY + 76, 'Auto-attack nearest foe', {
      size: '11px', color: PAL.uiTextDim, depth: 21,
    });
    SnesUI.snesText(this, boxX + 24, boxY + 98, 'ESC — Menu (in game)', {
      size: '11px', color: PAL.uiTextDim, depth: 21,
    });
  }

  drawHeroPreview(width, height) {
    const heroY = height * 0.36;

    this.add.image(width / 2, heroY + 24, 'shadow')
      .setScale(SPRITE_SCALE * 2).setDepth(14).setAlpha(0.7);

    const hero = this.add.sprite(width / 2, heroY, 'player', 0)
      .setScale(SPRITE_SCALE * 2).setDepth(15);

    this.tweens.add({
      targets: hero,
      y: heroY - 4,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
