import { PLAYER, XP } from './GameConfig.js';

/**
 * Data-driven upgrade definitions — Phase 5 VS progression.
 * Each upgrade can be picked multiple times up to maxRank.
 */
export const UPGRADES = {
  swift_boots: {
    id: 'swift_boots',
    name: 'Swift Boots',
    description: '+15% move speed',
    icon: '⚡',
    accent: 0x70c0ff,
    maxRank: 5,
  },
  arcane_bolt: {
    id: 'arcane_bolt',
    name: 'Arcane Bolt',
    description: '+1 projectile per attack',
    icon: '✦',
    accent: 0xf0a830,
    maxRank: 4,
  },
  quick_cast: {
    id: 'quick_cast',
    name: 'Quick Cast',
    description: '−15% attack cooldown',
    icon: '⟡',
    accent: 0xa878f0,
    maxRank: 5,
  },
  wide_arc: {
    id: 'wide_arc',
    name: 'Wide Arc',
    description: 'Pierce +1 enemy per shot',
    icon: '➤',
    accent: 0xf87858,
    maxRank: 3,
  },
  vitality: {
    id: 'vitality',
    name: 'Vitality',
    description: '+20 max HP & heal 20',
    icon: '♥',
    accent: 0xf05068,
    maxRank: 5,
  },
  magnet_charm: {
    id: 'magnet_charm',
    name: 'Magnet Charm',
    description: '+40% XP pickup radius',
    icon: '◎',
    accent: 0xf0d050,
    maxRank: 4,
  },
  heavy_hit: {
    id: 'heavy_hit',
    name: 'Heavy Hit',
    description: '+25% projectile damage',
    icon: '⚔',
    accent: 0xe89040,
    maxRank: 4,
  },
  orbit_blade: {
    id: 'orbit_blade',
    name: 'Orbiting Blade',
    description: 'Spinning blades damage foes',
    icon: '◈',
    accent: 0x88d0f0,
    maxRank: 3,
  },
};

export const UPGRADE_LIST = Object.values(UPGRADES);

/** Apply one rank of an upgrade to the player. Call after runState.recordUpgrade. */
export function applyUpgrade(player, upgradeId) {
  const def = UPGRADES[upgradeId];
  if (!def) return;

  const rank = getUpgradeRank(player, upgradeId);

  switch (upgradeId) {
    case 'swift_boots':
      player.speed = PLAYER.SPEED * (1 + 0.15 * rank);
      break;
    case 'quick_cast':
      player.attackCooldown = Math.max(
        180,
        PLAYER.ATTACK_COOLDOWN * Math.pow(0.85, rank)
      );
      break;
    case 'vitality':
      player.maxHealth += 20;
      player.health = Math.min(player.health + 20, player.maxHealth);
      break;
    case 'orbit_blade':
      player.ensureOrbitBlades(rank);
      break;
    default:
      break;
  }
}

export function getUpgradeRank(player, upgradeId) {
  return player.scene.runState.getUpgradeRank(upgradeId);
}

export function getProjectileCount(player) {
  return 1 + getUpgradeRank(player, 'arcane_bolt');
}

export function getPierceCount(player) {
  return getUpgradeRank(player, 'wide_arc');
}

export function getProjectileDamage(player) {
  const rank = getUpgradeRank(player, 'heavy_hit');
  return Math.floor(PLAYER.PROJECTILE_DAMAGE * (1 + 0.25 * rank));
}

export function getPickupRadius(player) {
  const magnetRank = getUpgradeRank(player, 'magnet_charm');
  return XP.PICKUP_RADIUS * (1 + 0.4 * magnetRank);
}

export function getOrbitBladeCount(player) {
  return getUpgradeRank(player, 'orbit_blade');
}

/** Pick `count` random upgrades the player can still take. */
export function pickRandomUpgrades(player, runState, count = 3) {
  const available = UPGRADE_LIST.filter((u) => {
    const rank = runState.getUpgradeRank(u.id);
    return rank < u.maxRank;
  });

  const shuffled = Phaser.Utils.Array.Shuffle([...available]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
