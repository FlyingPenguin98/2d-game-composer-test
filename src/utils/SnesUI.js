import { PAL } from './SnesPalettes.js';
import { FONTS } from '../config/GameConfig.js';

/** FF6-style SNES menu windows and text helpers. */
export class SnesUI {
  static drawWindow(scene, x, y, w, h, depth = 50) {
    const g = scene.add.graphics().setDepth(depth).setScrollFactor(0);
    SnesUI.fillWindow(g, x, y, w, h);
    return g;
  }

  static fillWindow(g, x, y, w, h) {
    const b = 2;
    g.fillStyle(parseInt(PAL.uiWhite.slice(1), 16));
    g.fillRect(x, y, w, h);
    g.fillStyle(parseInt(PAL.uiFill.slice(1), 16));
    g.fillRect(x + b, y + b, w - b * 2, h - b * 2);
    g.fillStyle(parseInt(PAL.uiHighlight.slice(1), 16));
    g.fillRect(x + b, y + b, w - b * 2, 1);
    g.fillRect(x + b, y + b, 1, h - b * 2);
    g.fillStyle(parseInt(PAL.uiShadow.slice(1), 16));
    g.fillRect(x + w - b - 1, y + b, 1, h - b * 2);
    g.fillRect(x + b, y + h - b - 1, w - b * 2, 1);
  }

  /** Decorative screen border (letterbox frame). */
  static drawScreenBorder(scene, width, height) {
    const g = scene.add.graphics().setDepth(100).setScrollFactor(0);
    const m = 8;
    g.lineStyle(2, parseInt(PAL.uiWhite.slice(1), 16));
    g.strokeRect(m, m, width - m * 2, height - m * 2);
    g.lineStyle(1, parseInt(PAL.uiHighlight.slice(1), 16));
    g.strokeRect(m + 3, m + 3, width - (m + 3) * 2, height - (m + 3) * 2);
    return g;
  }

  static snesText(scene, x, y, text, opts = {}) {
    return scene.add.text(x, y, text, {
      fontFamily: FONTS.PIXEL,
      fontSize: opts.size || '16px',
      color: opts.color || PAL.uiText,
      resolution: 2,
      ...opts.style,
    }).setDepth(opts.depth ?? 51).setScrollFactor(0);
  }

  /**
   * SNES menu row with a blinking cursor and reliable hit area.
   */
  static createMenuItem(scene, x, y, label, onSelect) {
    const rowH = 28;
    const rowW = 240;

    const bg = scene.add.graphics().setDepth(55).setScrollFactor(0);
    const cursor = scene.add.text(x + 4, y + 4, '▶', {
      fontFamily: FONTS.PIXEL,
      fontSize: '16px',
      color: PAL.uiGold,
      resolution: 2,
    }).setDepth(56).setScrollFactor(0).setVisible(false);

    const text = scene.add.text(x + 24, y + 4, label, {
      fontFamily: FONTS.PIXEL,
      fontSize: '16px',
      color: PAL.uiText,
      resolution: 2,
    }).setDepth(56).setScrollFactor(0);

    const hitZone = scene.add.zone(x, y, rowW, rowH)
      .setOrigin(0, 0)
      .setDepth(57)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    const redraw = (selected) => {
      bg.clear();
      if (selected) {
        bg.fillStyle(parseInt(PAL.uiHighlight.slice(1), 16));
        bg.fillRect(x, y, rowW, rowH);
        text.setColor(PAL.uiGold);
        cursor.setVisible(true);
      } else {
        text.setColor(PAL.uiText);
        cursor.setVisible(false);
      }
    };
    redraw(false);

    hitZone.on('pointerover', () => redraw(true));
    hitZone.on('pointerout', () => redraw(false));
    hitZone.on('pointerdown', onSelect);

    scene.tweens.add({
      targets: cursor,
      alpha: { from: 1, to: 0 },
      duration: 400,
      yoyo: true,
      repeat: -1,
    });

    return { text, bg, cursor, hitZone };
  }
}
