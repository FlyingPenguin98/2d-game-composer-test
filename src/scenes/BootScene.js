import { TextureGenerator } from '../utils/TextureGenerator.js';
import { AssetService } from '../services/AssetService.js';
import { PAL } from '../utils/SnesPalettes.js';
import { GameUI, UI } from '../utils/GameUI.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(PAL.uiShadow);

    GameUI.titleText(this, width / 2, height / 2 - 28, 'Eldergrove', {
      size: '28px', origin: 0.5,
    });

    const sub = GameUI.labelText(this, width / 2, height / 2 + 4, 'Loading...', {
      size: '15px', origin: 0.5,
    });

    const barBg = this.add.graphics();
    barBg.fillStyle(UI.xpTrack, 1);
    barBg.fillRoundedRect(width / 2 - 100, height / 2 + 28, 200, 14, 7);

    const bar = this.add.graphics();
    bar.fillStyle(UI.xpFill, 1);
    bar.fillRoundedRect(width / 2 - 98, height / 2 + 30, 120, 10, 5);

    try {
      AssetService.bootstrap(this.game);
    } catch (err) {
      console.error('[BootScene] Asset bootstrap failed:', err);
      sub.setText('Load failed — refresh page');
      sub.setColor('#f05068');
      return;
    }

    this.time.delayedCall(300, () => {
      sub.destroy();
      bar.destroy();
      barBg.destroy();
      this.scene.start('MainMenuScene');
    });
  }
}
