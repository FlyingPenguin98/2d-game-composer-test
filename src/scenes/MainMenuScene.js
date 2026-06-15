import { PAL, TILE, SPRITE_SCALE } from '../utils/SnesPalettes.js';
import { GameUI, UI } from '../utils/GameUI.js';
import { SceneTransition } from '../utils/SceneTransition.js';
import { AssetService } from '../services/AssetService.js';

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
    GameUI.drawScreenBorder(this, width, height);

    SceneTransition.onEnter(this, 300);
  }

  drawBackground(width, height) {
    const g = this.add.graphics().setDepth(0);

    g.fillStyle(0x3070b8);
    g.fillRect(0, 0, width, height * 0.45);
    g.fillStyle(0x4890d0);
    g.fillRect(0, height * 0.45, width, height * 0.12);
    g.fillStyle(0x287028);
    g.fillRect(0, height * 0.57, width, height * 0.43);

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

    g.fillStyle(0x185818);
    for (let i = 0; i < 7; i++) {
      const mx = i * 150 - 10;
      const mh = 50 + (i % 3) * 16;
      g.fillTriangle(mx, height * 0.57, mx + 70, height * 0.57, mx + 35, height * 0.57 - mh);
    }

    const displayTile = TILE * SPRITE_SCALE;
    const groundY = height * 0.57;
    const rows = Math.ceil((height - groundY) / displayTile) + 1;
    const cols = Math.ceil(width / displayTile) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileIdx = (col + row) % 2 === 0 ? 0 : 1;
        if ((col + row) % 5 === 0) {
          this.add.image(col * displayTile, groundY + row * displayTile, 'tileset', 'tile_2')
            .setOrigin(0, 0).setDisplaySize(displayTile, displayTile).setDepth(1);
        } else {
          this.add.image(col * displayTile, groundY + row * displayTile, 'tileset', `tile_${tileIdx}`)
            .setOrigin(0, 0).setDisplaySize(displayTile, displayTile).setDepth(1);
        }
      }
    }
  }

  drawTitlePanel(width) {
    const panelW = 460;
    const panelH = 88;
    const panelX = width / 2 - panelW / 2;
    const panelY = 40;

    GameUI.drawPanel(this, panelX, panelY, panelW, panelH, 10);

    GameUI.titleText(this, width / 2, panelY + 22, 'Eldergrove', {
      size: '40px', depth: 11, origin: 0.5,
    });

    GameUI.labelText(this, width / 2, panelY + 58, 'Chronicles of the Arcane', {
      size: '15px', depth: 11, origin: 0.5,
    });
  }

  drawMenuPanel(width, height) {
    const boxW = 320;
    const boxH = 148;
    const boxX = width / 2 - boxW / 2;
    const boxY = height * 0.56;

    GameUI.drawPanel(this, boxX, boxY, boxW, boxH, 20);

    GameUI.createMenuItem(this, boxX + 20, boxY + 18, 'Start New Game', () => {
      SceneTransition.toGame(this);
    }, { width: boxW - 40 });

    GameUI.labelText(this, boxX + 24, boxY + 68, 'WASD / Arrows — Move', {
      size: '14px', depth: 21,
    });
    GameUI.labelText(this, boxX + 24, boxY + 88, 'Auto-attack nearest foe', {
      size: '14px', depth: 21,
    });
    GameUI.labelText(this, boxX + 24, boxY + 108, 'ESC — Menu (in game)', {
      size: '14px', depth: 21,
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
