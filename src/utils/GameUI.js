import { FONTS } from '../config/GameConfig.js';

/** Modern fantasy UI palette — high contrast on gameplay backgrounds. */
export const UI = {
  overlay: 0x04060c,
  panel: 0x121824,
  panelBorder: 0xc9a227,
  panelInner: 0x1a2234,
  card: 0x1c2438,
  cardHover: 0x283450,
  cardBorder: 0x8a7020,
  cardBorderHover: 0xf0d060,
  accent: 0x5090f8,
  textPrimary: '#f2f6fc',
  textSecondary: '#b0bdd0',
  textGold: '#f0d878',
  textMuted: '#8898b0',
  stroke: '#080c14',
  xpFill: 0x48a8e8,
  xpTrack: 0x0a1018,
  hudBg: 0x0c1018,
};

/**
 * Legible fantasy UI — Cinzel titles, Nunito Sans body, stroked text, modern panels.
 */
export class GameUI {
  static drawOverlay(scene, depth = 250, alpha = 0.62) {
    const { width, height } = scene.scale;
    return scene.add.rectangle(width / 2, height / 2, width, height, UI.overlay, alpha)
      .setDepth(depth)
      .setScrollFactor(0);
  }

  static drawPanel(scene, x, y, w, h, depth = 50) {
    const g = scene.add.graphics().setDepth(depth).setScrollFactor(0);
    GameUI.fillPanel(g, x, y, w, h);
    return g;
  }

  static fillPanel(g, x, y, w, h) {
    g.fillStyle(UI.panel, 0.94);
    g.fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(2, UI.panelBorder, 1);
    g.strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, 9);
    g.lineStyle(1, UI.panelInner, 0.8);
    g.strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, 7);
  }

  static fillCard(g, x, y, w, h, hovered = false) {
    g.fillStyle(hovered ? UI.cardHover : UI.card, 0.96);
    g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, hovered ? UI.cardBorderHover : UI.cardBorder, 1);
    g.strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, 7);
  }

  static drawHudBar(g, x, y, w, h) {
    g.fillStyle(UI.hudBg, 0.88);
    g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(1, UI.panelBorder, 0.7);
    g.strokeRoundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 7);
  }

  static drawProgressBar(g, x, y, w, h, ratio, fillColor = UI.xpFill) {
    g.fillStyle(UI.xpTrack, 1);
    g.fillRoundedRect(x, y, w, h, h / 2);
    if (ratio > 0) {
      g.fillStyle(fillColor, 1);
      g.fillRoundedRect(x, y, Math.max(h, w * ratio), h, h / 2);
    }
    g.lineStyle(1, UI.panelBorder, 0.5);
    g.strokeRoundedRect(x + 0.5, y + 0.5, w - 1, h - 1, h / 2);
  }

  static titleText(scene, x, y, text, opts = {}) {
    return GameUI._text(scene, x, y, text, {
      fontFamily: FONTS.TITLE,
      fontSize: opts.size || '32px',
      fontStyle: 'bold',
      color: opts.color || UI.textGold,
      stroke: UI.stroke,
      strokeThickness: opts.stroke ?? 4,
      resolution: 3,
      ...opts.style,
    }, opts);
  }

  static headingText(scene, x, y, text, opts = {}) {
    return GameUI._text(scene, x, y, text, {
      fontFamily: FONTS.TITLE,
      fontSize: opts.size || '20px',
      fontStyle: '600',
      color: opts.color || UI.textPrimary,
      stroke: UI.stroke,
      strokeThickness: opts.stroke ?? 3,
      resolution: 3,
      ...opts.style,
    }, opts);
  }

  static bodyText(scene, x, y, text, opts = {}) {
    return GameUI._text(scene, x, y, text, {
      fontFamily: FONTS.BODY,
      fontSize: opts.size || '15px',
      fontStyle: opts.bold ? '700' : '600',
      color: opts.color || UI.textPrimary,
      stroke: UI.stroke,
      strokeThickness: opts.stroke ?? 2,
      resolution: 3,
      ...opts.style,
    }, opts);
  }

  static labelText(scene, x, y, text, opts = {}) {
    return GameUI._text(scene, x, y, text, {
      fontFamily: FONTS.BODY,
      fontSize: opts.size || '13px',
      fontStyle: '600',
      color: opts.color || UI.textSecondary,
      stroke: UI.stroke,
      strokeThickness: 2,
      resolution: 3,
      letterSpacing: opts.spacing ?? 1,
      ...opts.style,
    }, opts);
  }

  static _text(scene, x, y, text, style, opts) {
    const t = scene.add.text(x, y, text, style)
      .setDepth(opts.depth ?? 51)
      .setScrollFactor(0);
    if (opts.origin) t.setOrigin(...(Array.isArray(opts.origin) ? opts.origin : [opts.origin, 0]));
    if (opts.align) t.setAlign(opts.align);
    if (opts.wordWrap) t.setWordWrapWidth(opts.wordWrap);
    return t;
  }

  /** Key badge pill for upgrade cards / menus. */
  static drawKeyBadge(scene, x, y, key, depth = 302) {
    const g = scene.add.graphics().setDepth(depth).setScrollFactor(0);
    g.fillStyle(UI.panelBorder, 1);
    g.fillRoundedRect(x - 14, y - 12, 28, 24, 6);
    g.fillStyle(UI.panel, 1);
    g.fillRoundedRect(x - 12, y - 10, 24, 20, 5);
    const txt = GameUI.bodyText(scene, x, y, key, {
      size: '14px',
      color: UI.textGold,
      depth: depth + 1,
      origin: 0.5,
      stroke: 3,
    });
    return { g, txt };
  }

  /** Icon circle for upgrade cards. */
  static drawIconBadge(g, cx, cy, radius, accentColor, depth) {
    g.fillStyle(accentColor, 0.25);
    g.fillCircle(cx, cy, radius + 4);
    g.fillStyle(accentColor, 1);
    g.fillCircle(cx, cy, radius);
    g.lineStyle(2, UI.textGold, 0.8);
    g.strokeCircle(cx, cy, radius);
  }

  static createMenuItem(scene, x, y, label, onSelect, opts = {}) {
    const rowH = opts.height ?? 36;
    const rowW = opts.width ?? 260;

    const bg = scene.add.graphics().setDepth(55).setScrollFactor(0);
    const text = GameUI.bodyText(scene, x + 16, y + 8, label, {
      size: opts.size || '16px',
      depth: 56,
    });

    const hitZone = scene.add.zone(x, y, rowW, rowH)
      .setOrigin(0, 0)
      .setDepth(57)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    const redraw = (selected) => {
      bg.clear();
      if (selected) {
        bg.fillStyle(UI.cardHover, 0.95);
        bg.fillRoundedRect(x, y, rowW, rowH, 6);
        bg.lineStyle(2, UI.cardBorderHover, 1);
        bg.strokeRoundedRect(x + 1, y + 1, rowW - 2, rowH - 2, 5);
        text.setColor(UI.textGold);
      } else {
        text.setColor(UI.textPrimary);
      }
    };
    redraw(false);

    hitZone.on('pointerover', () => redraw(true));
    hitZone.on('pointerout', () => redraw(false));
    hitZone.on('pointerdown', onSelect);

    return { text, bg, hitZone };
  }

  /** Legacy alias — same panel API as old SnesUI. */
  static drawWindow(scene, x, y, w, h, depth = 50) {
    return GameUI.drawPanel(scene, x, y, w, h, depth);
  }

  static fillWindow(g, x, y, w, h) {
    GameUI.fillPanel(g, x, y, w, h);
  }

  static snesText(scene, x, y, text, opts = {}) {
    if (opts.title) return GameUI.titleText(scene, x, y, text, opts);
    if (opts.heading) return GameUI.headingText(scene, x, y, text, opts);
    if (opts.label) return GameUI.labelText(scene, x, y, text, opts);
    return GameUI.bodyText(scene, x, y, text, opts);
  }

  static drawScreenBorder(scene, width, height) {
    const g = scene.add.graphics().setDepth(100).setScrollFactor(0);
    const m = 10;
    g.lineStyle(2, UI.panelBorder, 0.35);
    g.strokeRoundedRect(m, m, width - m * 2, height - m * 2, 4);
    return g;
  }
}
