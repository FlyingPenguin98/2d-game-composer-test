import { GameUI, UI } from '../utils/GameUI.js';
import { UPGRADES } from '../config/UpgradeRegistry.js';

/**
 * Level-up modal — legible fantasy cards with keyboard shortcuts.
 */
export class UpgradePicker {
  constructor(scene, choices, onPick) {
    this.scene = scene;
    this.onPick = onPick;
    this.elements = [];
    this.keyHandlers = [];
    this.cardGfx = [];

    const { width, height } = scene.scale;
    const panelW = 680;
    const panelH = 360;
    const px = (width - panelW) / 2;
    const py = (height - panelH) / 2;

    this.elements.push(GameUI.drawOverlay(scene, 299));
    this.elements.push(GameUI.drawPanel(scene, px, py, panelW, panelH, 300));

    this.elements.push(
      GameUI.titleText(scene, width / 2, py + 22, 'Level Up!', {
        size: '36px', depth: 301, origin: 0.5,
      })
    );

    this.elements.push(
      GameUI.labelText(scene, width / 2, py + 68, 'Choose a blessing — press 1, 2, or 3', {
        size: '15px', depth: 301, origin: 0.5,
      })
    );

    const cardW = 196;
    const cardH = 220;
    const gap = 18;
    const startX = px + (panelW - (cardW * 3 + gap * 2)) / 2;
    const cardY = py + 100;

    choices.forEach((upgradeId, i) => {
      const def = UPGRADES[upgradeId];
      if (!def) return;

      const cx = startX + i * (cardW + gap);
      const rank = scene.runState.getUpgradeRank(upgradeId);

      const cardGfx = scene.add.graphics().setDepth(301).setScrollFactor(0);
      GameUI.fillCard(cardGfx, cx, cardY, cardW, cardH, false);
      this.elements.push(cardGfx);
      this.cardGfx.push({ g: cardGfx, x: cx, y: cardY, w: cardW, h: cardH });

      const iconGfx = scene.add.graphics().setDepth(302).setScrollFactor(0);
      GameUI.drawIconBadge(iconGfx, cx + cardW / 2, cardY + 36, 22, def.accent ?? UI.accent);
      this.elements.push(iconGfx);

      this.elements.push(
        GameUI.titleText(scene, cx + cardW / 2, cardY + 36, def.icon ?? '✦', {
          size: '22px', depth: 303, origin: 0.5, stroke: 2,
        })
      );

      const badge = GameUI.drawKeyBadge(scene, cx + 22, cardY + 18, String(i + 1), 303);
      this.elements.push(badge.g, badge.txt);

      this.elements.push(
        GameUI.headingText(scene, cx + cardW / 2, cardY + 72, def.name, {
          size: '17px', depth: 303, origin: 0.5,
          align: 'center', wordWrap: cardW - 20,
        })
      );

      this.elements.push(
        GameUI.bodyText(scene, cx + cardW / 2, cardY + 108, def.description, {
          size: '15px',
          color: UI.textSecondary,
          depth: 303,
          origin: 0.5,
          align: 'center',
          wordWrap: cardW - 24,
        })
      );

      if (rank > 0) {
        this.elements.push(
          GameUI.labelText(scene, cx + cardW / 2, cardY + 178, `Rank ${rank} → ${rank + 1}`, {
            size: '13px', color: UI.textGold, depth: 303, origin: 0.5,
          })
        );
      }

      this.elements.push(
        GameUI.labelText(scene, cx + cardW / 2, cardY + cardH - 22, 'Click to select', {
          size: '12px', color: UI.textMuted, depth: 303, origin: 0.5,
        })
      );

      const hit = scene.add.zone(cx, cardY, cardW, cardH)
        .setOrigin(0, 0)
        .setDepth(304)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      hit.on('pointerover', () => GameUI.fillCard(cardGfx, cx, cardY, cardW, cardH, true));
      hit.on('pointerout', () => GameUI.fillCard(cardGfx, cx, cardY, cardW, cardH, false));
      hit.on('pointerdown', () => this.select(upgradeId));
      this.elements.push(hit);

      const key = scene.input.keyboard.addKey(`${i + 1}`);
      const handler = () => this.select(upgradeId);
      key.on('down', handler);
      this.keyHandlers.push({ key, handler });
    });
  }

  select(upgradeId) {
    if (this.destroyed) return;
    this.destroy();
    this.onPick(upgradeId);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const { key, handler } of this.keyHandlers) {
      key.off('down', handler);
    }
    for (const el of this.elements) {
      el.destroy();
    }
    this.elements = [];
  }
}
