import { GAME } from '../config/GameConfig.js';

/** XP gem dropped on enemy death — idle until collected. */
export class XpGem {
  static spawn(scene, x, y, value) {
    const gem = scene.physics.add.sprite(x, y, 'xp_gem');
    gem.setScale(GAME.SPRITE_SCALE * 0.75);
    gem.setDepth(3);
    gem.xpValue = value;
    gem.body.setCircle(5, 3, 3);
    gem.body.setAllowGravity(false);

    scene.tweens.add({
      targets: gem,
      y: y - 4,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    scene.xpGems.add(gem);
    return gem;
  }
}
