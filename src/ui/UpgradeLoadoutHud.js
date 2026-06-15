import { GameUI, UI } from '../utils/GameUI.js';
import {
  UPGRADE_KIND,
  getOwnedUpgrades,
  rankToRoman,
} from '../config/UpgradeRegistry.js';

/** Compact HUD showing owned stats & weapons with levels. */
export class UpgradeLoadoutHud {
  constructor(scene) {
    this.scene = scene;
    this.x = 12;
    this.width = 210;
    this.height = 112;
    this.reposition();
    this.refresh();
  }

  reposition() {
    this.y = this.scene.scale.height - this.height - 12;
  }

  refresh() {
    this.destroy();
    this.elements = [];

    const g = this.scene.add.graphics().setDepth(95).setScrollFactor(0);
    GameUI.drawHudBar(g, this.x, this.y, this.width, this.height);
    this.elements.push(g);

    this.elements.push(
      GameUI.labelText(this.scene, this.x + 10, this.y + 6, 'Loadout', {
        size: '11px', color: UI.textGold, depth: 96,
      })
    );

    const owned = getOwnedUpgrades(this.scene.runState);
    const stats = owned.filter((u) => u.kind === UPGRADE_KIND.STAT);
    const weapons = owned.filter((u) => u.kind === UPGRADE_KIND.WEAPON);

    this.elements.push(
      GameUI.labelText(this.scene, this.x + 10, this.y + 22, 'Attributes', {
        size: '10px', depth: 96,
      })
    );

    if (stats.length === 0) {
      this.elements.push(
        GameUI.labelText(this.scene, this.x + 10, this.y + 36, '—', {
          size: '10px', depth: 96,
        })
      );
    } else {
      stats.slice(0, 4).forEach((u, i) => {
        this.elements.push(
          GameUI.bodyText(this.scene, this.x + 10, this.y + 36 + i * 13,
            `${u.icon} ${u.name} ${rankToRoman(u.rank)}`,
            { size: '11px', depth: 96, wordWrap: this.width - 20, maxLines: 1 }
          )
        );
      });
    }

    const armsY = this.y + 58;
    this.elements.push(
      GameUI.labelText(this.scene, this.x + 10, armsY, 'Arms', {
        size: '10px', depth: 96,
      })
    );

    if (weapons.length === 0) {
      this.elements.push(
        GameUI.labelText(this.scene, this.x + 10, armsY + 14, '—', {
          size: '10px', depth: 96,
        })
      );
    } else {
      weapons.slice(0, 4).forEach((u, i) => {
        this.elements.push(
          GameUI.bodyText(this.scene, this.x + 10, armsY + 14 + i * 13,
            `${u.icon} ${u.name} ${rankToRoman(u.rank)}`,
            { size: '11px', depth: 96, wordWrap: this.width - 20, maxLines: 1 }
          )
        );
      });
    }
  }

  destroy() {
    for (const el of this.elements ?? []) el.destroy();
    this.elements = [];
  }
}
