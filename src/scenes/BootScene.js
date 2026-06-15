import { TextureGenerator } from '../utils/TextureGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const bar = this.add.graphics();
    const box = this.add.graphics();
    box.fillStyle(0x1a2040, 0.9);
    box.fillRect(380, 330, 200, 40);
    bar.fillStyle(0x6090ff, 1);

    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillRect(390, 340, 180 * value, 20);
    });
  }

  create() {
    TextureGenerator.generateAll(this);
    this.scene.start('MainMenuScene');
  }
}
