import { GameUI, UI } from '../utils/GameUI.js';
import { SceneTransition } from '../utils/SceneTransition.js';

/** ESC pause overlay — resume or exit to main menu. */
export class PauseMenu {
  constructor(scene, onResume) {
    this.scene = scene;
    this.onResume = onResume;
    this.elements = [];
    this.escKey = scene.input.keyboard.addKey('ESC');

    const { width, height } = scene.scale;
    const panelW = 340;
    const panelH = 220;
    const px = (width - panelW) / 2;
    const py = (height - panelH) / 2;

    this.elements.push(GameUI.drawOverlay(scene, 289, 0.65));
    this.elements.push(GameUI.drawPanel(scene, px, py, panelW, panelH, 290));

    this.elements.push(
      GameUI.titleText(scene, width / 2, py + 22, 'Paused', {
        size: '32px', depth: 291, origin: 0.5,
      })
    );

    this.elements.push(
      GameUI.labelText(scene, width / 2, py + 62, 'ESC — Resume', {
        size: '14px', depth: 291, origin: 0.5,
      })
    );

    const resume = GameUI.createMenuItem(
      scene, px + 40, py + 88, 'Resume', () => this.resume(),
      { width: panelW - 80 }
    );
    this.elements.push(resume.bg, resume.text, resume.hitZone);

    const exit = GameUI.createMenuItem(
      scene, px + 40, py + 132, 'Exit to Main Menu', () => this.exit(),
      { width: panelW - 80 }
    );
    this.elements.push(exit.bg, exit.text, exit.hitZone);

    this.escHandler = () => this.resume();
    this.escKey.on('down', this.escHandler);
  }

  resume() {
    if (this.destroyed) return;
    this.destroy();
    this.onResume();
  }

  exit() {
    if (this.destroyed) return;
    this.destroy();
    SceneTransition.toMenu(this.scene);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.escKey.off('down', this.escHandler);
    for (const el of this.elements) {
      el.destroy();
    }
    this.elements = [];
  }
}
