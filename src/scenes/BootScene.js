import { TextureGenerator } from '../utils/TextureGenerator.js';
import { AssetService } from '../services/AssetService.js';
import { PAL } from '../utils/SnesPalettes.js';
import { FONTS } from '../config/GameConfig.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(PAL.uiShadow);

    const label = this.add.text(width / 2, height / 2 - 24, 'ELDERGROVE', {
      fontFamily: FONTS.PIXEL,
      fontSize: '20px',
      color: PAL.uiGold,
      resolution: 2,
    }).setOrigin(0.5);

    const sub = this.add.text(width / 2, height / 2, 'Loading...', {
      fontFamily: FONTS.PIXEL,
      fontSize: '12px',
      color: PAL.uiTextDim,
      resolution: 2,
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(parseInt(PAL.uiShadow.slice(1), 16));
    barBg.fillRect(width / 2 - 80, height / 2 + 20, 160, 12);
    barBg.lineStyle(1, parseInt(PAL.uiWhite.slice(1), 16));
    barBg.strokeRect(width / 2 - 80, height / 2 + 20, 160, 12);

    const bar = this.add.graphics();
    bar.fillStyle(parseInt(PAL.uiHighlight.slice(1), 16));
    bar.fillRect(width / 2 - 78, height / 2 + 22, 80, 8);

    try {
      AssetService.bootstrap(this.game);
    } catch (err) {
      console.error('[BootScene] Asset bootstrap failed:', err);
      sub.setText('Load failed — refresh page');
      sub.setColor(PAL.boneEye);
      return;
    }

    this.time.delayedCall(300, () => {
      label.destroy();
      sub.destroy();
      bar.destroy();
      barBg.destroy();
      this.scene.start('MainMenuScene');
    });
  }
}
