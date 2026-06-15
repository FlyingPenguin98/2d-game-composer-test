import { GAME } from '../config/GameConfig.js';

/** Rare pickup — pulls all XP gems on the map to the player. */
export class VacuumItem {
  static spawn(scene, x, y) {
    const item = scene.physics.add.sprite(x, y, 'vacuum_item');
    item.setScale(GAME.SPRITE_SCALE);
    item.setDepth(4);
    item.body.setCircle(6, 2, 2);
    item.body.setAllowGravity(false);

    scene.tweens.add({
      targets: item,
      scaleX: GAME.SPRITE_SCALE * 1.1,
      scaleY: GAME.SPRITE_SCALE * 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    scene.vacuumItems.add(item);
    return item;
  }

  static activate(scene, item, playerX, playerY) {
    item.destroy();

    const gems = scene.xpGems.getChildren().filter((g) => g.active);
    if (gems.length === 0) return;

    scene.spawnVacuumVfx(playerX, playerY);

    let remaining = gems.length;
    for (const gem of gems) {
      scene.tweens.add({
        targets: gem,
        x: playerX,
        y: playerY,
        scaleX: 0,
        scaleY: 0,
        duration: 350,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          if (gem.active) {
            scene.collectXpGem(gem);
          }
          remaining -= 1;
        },
      });
    }
  }
}
