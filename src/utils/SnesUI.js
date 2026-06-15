import { PAL } from './SnesPalettes.js';

/** Draw FF6-style SNES menu windows using 9-slice from ui_window texture. */
export class SnesUI {
  static drawWindow(scene, x, y, w, h, depth = 50) {
    const container = scene.add.container(x, y).setDepth(depth).setScrollFactor(0);
    const g = scene.add.graphics();
    this.fillWindow(g, 0, 0, w, h);
    container.add(g);
    return container;
  }

  static fillWindow(g, x, y, w, h) {
    const b = 2; // border width
    // Outer white
    g.fillStyle(parseInt(PAL.uiWhite.slice(1), 16));
    g.fillRect(x, y, w, h);
    // Blue fill
    g.fillStyle(parseInt(PAL.uiFill.slice(1), 16));
    g.fillRect(x + b, y + b, w - b * 2, h - b * 2);
    // Top/left highlight
    g.fillStyle(parseInt(PAL.uiHighlight.slice(1), 16));
    g.fillRect(x + b, y + b, w - b * 2, 1);
    g.fillRect(x + b, y + b, 1, h - b * 2);
    // Bottom/right shadow
    g.fillStyle(parseInt(PAL.uiShadow.slice(1), 16));
    g.fillRect(x + w - b - 1, y + b, 1, h - b * 2);
    g.fillRect(x + b, y + h - b - 1, w - b * 2, 1);
  }

  static snesText(scene, x, y, text, opts = {}) {
    return scene.add.text(x, y, text, {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: opts.size || '16px',
      color: opts.color || PAL.uiText,
      resolution: 2,
      ...opts.style,
    }).setDepth(opts.depth || 51).setScrollFactor(0);
  }

  static createMenuItem(scene, x, y, label, onSelect) {
    const bg = scene.add.graphics().setDepth(55).setScrollFactor(0);
    const text = scene.add.text(x, y, label, {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '18px',
      color: PAL.uiText,
      resolution: 2,
    }).setOrigin(0, 0).setDepth(56).setScrollFactor(0);

    const pad = 12;
    const w = text.width + pad * 2;
    const h = text.height + pad;

    const redraw = (selected) => {
      bg.clear();
      if (selected) {
        bg.fillStyle(parseInt(PAL.uiHighlight.slice(1), 16));
        bg.fillRect(x - pad, y - pad / 2, w, h);
        text.setColor(PAL.uiGold);
      } else {
        text.setColor(PAL.uiText);
      }
    };
    redraw(false);

    text.setInteractive({ useHandCursor: true });
    text.on('pointerover', () => redraw(true));
    text.on('pointerout', () => redraw(false));
    text.on('pointerdown', onSelect);

    return { text, bg };
  }
}
