import { SCENES } from '../config/GameConfig.js';

/**
 * Safe scene transitions — resets camera FX so we never get stuck on a black screen.
 */
export class SceneTransition {
  static to(scene, targetKey, opts = {}) {
    const { fadeMs = 300 } = opts;
    const cam = scene.cameras.main;

    cam.resetFX();
    cam.setAlpha(1);

    if (fadeMs <= 0) {
      scene.scene.start(targetKey);
      return;
    }

    cam.fadeOut(fadeMs, 0, 0, 0);
    scene.time.delayedCall(fadeMs, () => {
      scene.scene.start(targetKey);
    });
  }

  static onEnter(scene, fadeMs = 300) {
    const cam = scene.cameras.main;
    cam.resetFX();
    if (fadeMs <= 0) {
      cam.setAlpha(1);
      return;
    }
    cam.setAlpha(1);
    cam.fadeIn(fadeMs, 0, 0, 0);
  }

  static toMenu(scene) {
    SceneTransition.to(scene, SCENES.MENU);
  }

  static toGame(scene) {
    SceneTransition.to(scene, SCENES.GAME);
  }
}
