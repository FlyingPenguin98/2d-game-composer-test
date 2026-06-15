import { GameUI, UI } from '../utils/GameUI.js';
import { UPGRADES, rankToRoman } from '../config/UpgradeRegistry.js';

/**
 * Level-up modal — Attributes and Arms shown in separate columns.
 */
export class UpgradePicker {
  constructor(scene, choices, onPick) {
    this.scene = scene;
    this.onPick = onPick;
    this.elements = [];
    this.keyHandlers = [];

    const statIds = choices.stats ?? [];
    const weaponIds = choices.weapons ?? [];
    const allIds = [...statIds, ...weaponIds];

    const { width, height } = scene.scale;
    const panelW = 720;
    const panelH = 400;
    const px = (width - panelW) / 2;
    const py = (height - panelH) / 2;

    this.elements.push(GameUI.drawOverlay(scene, 299));
    this.elements.push(GameUI.drawPanel(scene, px, py, panelW, panelH, 300));

    this.elements.push(
      GameUI.titleText(scene, width / 2, py + 18, 'Level Up!', {
        size: '34px', depth: 301, origin: 0.5,
      })
    );

    this.elements.push(
      GameUI.labelText(scene, width / 2, py + 58, 'Choose one blessing — keys 1–4', {
        size: '14px', depth: 301, origin: 0.5,
      })
    );

    const cardW = 158;
    const cardH = 200;
    const colGap = 24;
    const statColX = px + 32;
    const weaponColX = px + panelW / 2 + 16;
    const cardY = py + 88;

    this.elements.push(
      GameUI.headingText(scene, statColX + cardW, cardY - 8, 'Attributes', {
        size: '16px', color: UI.textGold, depth: 301, origin: 0.5,
      })
    );
    this.elements.push(
      GameUI.headingText(scene, weaponColX + cardW, cardY - 8, 'Arms', {
        size: '16px', color: UI.textGold, depth: 301, origin: 0.5,
      })
    );

    statIds.forEach((id, i) => {
      this.buildCard(id, statColX + i * (cardW + colGap), cardY, cardW, cardH, i + 1);
    });

    weaponIds.forEach((id, i) => {
      this.buildCard(id, weaponColX + i * (cardW + colGap), cardY, cardW, cardH, statIds.length + i + 1);
    });

    if (allIds.length === 0) {
      this.elements.push(
        GameUI.bodyText(scene, width / 2, py + panelH / 2, 'All upgrades maxed!', {
          depth: 301, origin: 0.5,
        })
      );
      scene.time.delayedCall(600, () => this.select(null));
    }
  }

  buildCard(upgradeId, cx, cy, cardW, cardH, keyNum) {
    const def = UPGRADES[upgradeId];
    if (!def) return;

    const rank = this.scene.runState.getUpgradeRank(upgradeId);

    const cardGfx = this.scene.add.graphics().setDepth(301).setScrollFactor(0);
    GameUI.fillCard(cardGfx, cx, cy, cardW, cardH, false);
    this.elements.push(cardGfx);

    const iconGfx = this.scene.add.graphics().setDepth(302).setScrollFactor(0);
    GameUI.drawIconBadge(iconGfx, cx + cardW / 2, cy + 32, 20, def.accent ?? UI.accent);
    this.elements.push(iconGfx);

    this.elements.push(
      GameUI.titleText(this.scene, cx + cardW / 2, cy + 32, def.icon ?? '✦', {
        size: '20px', depth: 303, origin: 0.5, stroke: 2,
      })
    );

    const badge = GameUI.drawKeyBadge(this.scene, cx + 20, cy + 16, String(keyNum), 303);
    this.elements.push(badge.g, badge.txt);

    this.elements.push(
      GameUI.headingText(this.scene, cx + cardW / 2, cy + 58, def.name, {
        size: '15px', depth: 303, origin: 0.5,
        align: 'center', wordWrap: cardW - 16, maxLines: 2,
      })
    );

    this.elements.push(
      GameUI.bodyText(this.scene, cx + cardW / 2, cy + 98, def.description, {
        size: '13px',
        color: UI.textSecondary,
        depth: 303,
        origin: 0.5,
        align: 'center',
        wordWrap: cardW - 20,
        maxLines: 3,
      })
    );

    const rankLabel = rank > 0
      ? `Lv ${rank} → ${rank + 1}`
      : `New · max ${def.maxRank}`;
    this.elements.push(
      GameUI.labelText(this.scene, cx + cardW / 2, cy + cardH - 36, rankLabel, {
        size: '11px', color: UI.textGold, depth: 303, origin: 0.5,
      })
    );

    this.elements.push(
      GameUI.labelText(this.scene, cx + cardW / 2, cy + cardH - 18, rankToRoman(Math.min(rank + 1, def.maxRank)), {
        size: '10px', color: UI.textMuted, depth: 303, origin: 0.5,
      })
    );

    const hit = this.scene.add.zone(cx, cy, cardW, cardH)
      .setOrigin(0, 0)
      .setDepth(304)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => GameUI.fillCard(cardGfx, cx, cy, cardW, cardH, true));
    hit.on('pointerout', () => GameUI.fillCard(cardGfx, cx, cy, cardW, cardH, false));
    hit.on('pointerdown', () => this.select(upgradeId));
    this.elements.push(hit);

    const key = this.scene.input.keyboard.addKey(`${keyNum}`);
    const handler = () => this.select(upgradeId);
    key.on('down', handler);
    this.keyHandlers.push({ key, handler });
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
