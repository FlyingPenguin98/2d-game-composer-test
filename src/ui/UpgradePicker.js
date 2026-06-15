import { PAL } from '../utils/SnesPalettes.js';
import { SnesUI } from '../utils/SnesUI.js';
import { FONTS } from '../config/GameConfig.js';
import { UPGRADES } from '../config/UpgradeRegistry.js';

/**
 * Level-up modal — 3 random upgrade choices, SNES window style.
 */
export class UpgradePicker {
  constructor(scene, choices, onPick) {
    this.scene = scene;
    this.onPick = onPick;
    this.elements = [];
    this.keyHandlers = [];

    const { width, height } = scene.scale;
    const panelW = 520;
    const panelH = 280;
    const px = (width - panelW) / 2;
    const py = (height - panelH) / 2;

    this.elements.push(SnesUI.drawWindow(scene, px, py, panelW, panelH, 300));

    this.elements.push(
      SnesUI.snesText(scene, width / 2, py + 18, 'LEVEL UP!', {
        size: '22px', color: PAL.uiGold, depth: 301,
      }).setOrigin(0.5, 0)
    );

    this.elements.push(
      SnesUI.snesText(scene, width / 2, py + 48, 'Choose an upgrade', {
        size: '11px', color: PAL.uiTextDim, depth: 301,
      }).setOrigin(0.5, 0)
    );

    const cardW = 150;
    const gap = 16;
    const startX = px + (panelW - (cardW * 3 + gap * 2)) / 2;
    const cardY = py + 80;

    choices.forEach((upgradeId, i) => {
      const def = UPGRADES[upgradeId];
      if (!def) return;

      const cx = startX + i * (cardW + gap);
      const rank = scene.runState.getUpgradeRank(upgradeId);

      const cardGfx = scene.add.graphics().setDepth(301).setScrollFactor(0);
      SnesUI.fillWindow(cardGfx, cx, cardY, cardW, 160);
      this.elements.push(cardGfx);

      this.elements.push(
        SnesUI.snesText(scene, cx + cardW / 2, cardY + 14, `[${i + 1}]`, {
          size: '12px', color: PAL.uiGold, depth: 302,
        }).setOrigin(0.5, 0)
      );

      this.elements.push(
        SnesUI.snesText(scene, cx + cardW / 2, cardY + 36, def.name, {
          size: '13px', color: PAL.uiText, depth: 302,
        }).setOrigin(0.5, 0)
      );

      const desc = scene.add.text(cx + cardW / 2, cardY + 62, def.description, {
        fontFamily: FONTS.PIXEL,
        fontSize: '10px',
        color: PAL.uiTextDim,
        align: 'center',
        wordWrap: { width: cardW - 16 },
        resolution: 2,
      }).setOrigin(0.5, 0).setDepth(302).setScrollFactor(0);
      this.elements.push(desc);

      if (rank > 0) {
        this.elements.push(
          SnesUI.snesText(scene, cx + cardW / 2, cardY + 130, `Rank ${rank} → ${rank + 1}`, {
            size: '9px', color: PAL.uiGold, depth: 302,
          }).setOrigin(0.5, 0)
        );
      }

      const hit = scene.add.zone(cx, cardY, cardW, 160)
        .setOrigin(0, 0)
        .setDepth(303)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      hit.on('pointerover', () => {
        cardGfx.clear();
        cardGfx.fillStyle(parseInt(PAL.uiHighlight.slice(1), 16));
        cardGfx.fillRect(cx + 2, cardY + 2, cardW - 4, 156);
      });
      hit.on('pointerout', () => {
        cardGfx.clear();
        SnesUI.fillWindow(cardGfx, cx, cardY, cardW, 160);
      });
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
