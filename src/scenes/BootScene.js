import { TextureGenerator } from '../utils/TextureGenerator.js';
import { PAL } from '../utils/SnesPalettes.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const { width, height } = this.scale;

    // SNES-style loading text
    const label = this.add.text(width / 2, height / 2 - 20, 'LOADING...', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '16px',
      color: PAL.uiText,
      resolution: 2,
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(parseInt(PAL.uiShadow.slice(1), 16));
    barBg.fillRect(width / 2 - 100, height / 2, 200, 16);
    barBg.lineStyle(2, parseInt(PAL.uiWhite.slice(1), 16));
    barBg.strokeRect(width / 2 - 100, height / 2, 200, 16);

    const bar = this.add.graphics();

    let progress = 0;
    this.time.addEvent({
      delay: 30,
      repeat: 10,
      callback: () => {
        progress++;
        bar.clear();
        bar.fillStyle(parseInt(PAL.uiHighlight.slice(1), 16));
        bar.fillRect(width / 2 - 96, height / 2 + 4, (192 * progress) / 10, 8);
      },
    });

    this.time.delayedCall(400, () => {
      TextureGenerator.generateAll(this);
      TextureGenerator.registerFrames(this);
      label.destroy();
      bar.destroy();
      barBg.destroy();
      this.scene.start('MainMenuScene');
    });
  }
}
