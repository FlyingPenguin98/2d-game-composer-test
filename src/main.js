import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GAME, SCENES } from './config/GameConfig.js';

const config = {
  type: Phaser.AUTO,
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#185818',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MainMenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};

new Phaser.Game(config);

// Export scene keys for debugging in console
window.__ELDERGROVE__ = { SCENES };
