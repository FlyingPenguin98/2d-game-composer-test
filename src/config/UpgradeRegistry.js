import { PLAYER, XP, UPGRADE_LIMITS } from './GameConfig.js';

export const UPGRADE_KIND = {
  STAT: 'stat',
  WEAPON: 'weapon',
};

/** Visual config per weapon for projectiles / passives. */
export const WEAPON_VISUALS = {
  arcane_bolt: {
    texture: 'proj_arcane',
    tint: 0xffffff,
    trailColor: 0xf8d878,
    scale: 1,
  },
  wide_arc: {
    texture: 'proj_pierce',
    tint: 0xffffff,
    trailColor: 0xf87858,
    scale: 1.1,
  },
  ember_lance: {
    texture: 'proj_ember',
    tint: 0xffffff,
    trailColor: 0xff6020,
    scale: 1.05,
  },
  orbit_blade: {
    texture: 'weapon_blade',
    tint: 0xffffff,
    trailColor: 0x88d0f0,
    scale: 1,
  },
};

export const UPGRADES = {
  swift_boots: {
    id: 'swift_boots',
    kind: UPGRADE_KIND.STAT,
    name: 'Swift Boots',
    description: '+15% move speed',
    icon: '⚡',
    accent: 0x70c0ff,
    maxRank: 5,
  },
  quick_cast: {
    id: 'quick_cast',
    kind: UPGRADE_KIND.STAT,
    name: 'Quick Cast',
    description: '−15% attack cooldown',
    icon: '⟡',
    accent: 0xa878f0,
    maxRank: 5,
  },
  vitality: {
    id: 'vitality',
    kind: UPGRADE_KIND.STAT,
    name: 'Vitality',
    description: '+20 max HP & heal 20',
    icon: '♥',
    accent: 0xf05068,
    maxRank: 5,
  },
  magnet_charm: {
    id: 'magnet_charm',
    kind: UPGRADE_KIND.STAT,
    name: 'Magnet Charm',
    description: '+40% XP pickup radius',
    icon: '◎',
    accent: 0xf0d050,
    maxRank: 4,
  },
  heavy_hit: {
    id: 'heavy_hit',
    kind: UPGRADE_KIND.STAT,
    name: 'Heavy Hit',
    description: '+25% projectile damage',
    icon: '⚔',
    accent: 0xe89040,
    maxRank: 4,
  },
  arcane_bolt: {
    id: 'arcane_bolt',
    kind: UPGRADE_KIND.WEAPON,
    name: 'Arcane Bolt',
    description: '+1 magic bolt per volley',
    icon: '✦',
    accent: 0xf0a830,
    maxRank: 4,
  },
  wide_arc: {
    id: 'wide_arc',
    kind: UPGRADE_KIND.WEAPON,
    name: 'Wide Arc',
    description: 'Shots pierce +1 foe',
    icon: '➤',
    accent: 0xf87858,
    maxRank: 3,
  },
  ember_lance: {
    id: 'ember_lance',
    kind: UPGRADE_KIND.WEAPON,
    name: 'Ember Lance',
    description: 'Fire lance bolts',
    icon: '🔥',
    accent: 0xff6020,
    maxRank: 4,
  },
  orbit_blade: {
    id: 'orbit_blade',
    kind: UPGRADE_KIND.WEAPON,
    name: 'Orbiting Blade',
    description: 'Spinning blade aura',
    icon: '◈',
    accent: 0x88d0f0,
    maxRank: 3,
  },
};

export const UPGRADE_LIST = Object.values(UPGRADES);
export const STAT_UPGRADES = UPGRADE_LIST.filter((u) => u.kind === UPGRADE_KIND.STAT);
export const WEAPON_UPGRADES = UPGRADE_LIST.filter((u) => u.kind === UPGRADE_KIND.WEAPON);

/** Starting weapon for every run. */
export const STARTING_WEAPONS = ['arcane_bolt'];

export function getUpgradeRank(player, upgradeId) {
  return player.scene.runState.getUpgradeRank(upgradeId);
}

export function canPickUpgrade(runState, upgradeId) {
  const def = UPGRADES[upgradeId];
  if (!def) return false;
  const rank = runState.getUpgradeRank(upgradeId);
  if (rank >= def.maxRank) return false;
  if (rank > 0) return true;

  const owned = UPGRADE_LIST.filter(
    (u) => u.kind === def.kind && runState.getUpgradeRank(u.id) > 0
  );
  const cap = def.kind === UPGRADE_KIND.WEAPON
    ? UPGRADE_LIMITS.MAX_WEAPONS
    : UPGRADE_LIMITS.MAX_STAT_ITEMS;
  return owned.length < cap;
}

function pickFromPool(runState, pool, count) {
  const available = pool.filter((u) => canPickUpgrade(runState, u.id));
  const shuffled = Phaser.Utils.Array.Shuffle([...available]);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((u) => u.id);
}

/** Level-up offers: 2 stat + 2 weapon choices (when available). */
export function pickLevelUpChoices(runState) {
  return {
    stats: pickFromPool(runState, STAT_UPGRADES, 2),
    weapons: pickFromPool(runState, WEAPON_UPGRADES, 2),
  };
}

export function getOwnedUpgrades(runState) {
  const owned = [];
  for (const def of UPGRADE_LIST) {
    const rank = runState.getUpgradeRank(def.id);
    if (rank > 0) owned.push({ ...def, rank });
  }
  return owned;
}

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
    case 'ember_lance':
    case 'wide_arc':
      player.primaryWeaponId = upgradeId;
      break;
    case 'arcane_bolt':
      break;
    default:
      break;
  }
}

export function applyStartingLoadout(player, runState) {
  for (const id of STARTING_WEAPONS) {
    if (runState.getUpgradeRank(id) === 0) {
      runState.upgrades.push(id);
    }
  }
  player.primaryWeaponId = 'arcane_bolt';
  applyUpgrade(player, 'arcane_bolt');
}

export function getProjectileCount(player) {
  return 1 + getUpgradeRank(player, 'arcane_bolt');
}

export function getPierceCount(player) {
  return getUpgradeRank(player, 'wide_arc');
}

export function getProjectileDamage(player) {
  const rank = getUpgradeRank(player, 'heavy_hit');
  const emberRank = getUpgradeRank(player, 'ember_lance');
  const base = PLAYER.PROJECTILE_DAMAGE * (1 + 0.25 * rank);
  return Math.floor(base * (1 + 0.1 * emberRank));
}

export function getPickupRadius(player) {
  const magnetRank = getUpgradeRank(player, 'magnet_charm');
  return XP.PICKUP_RADIUS * (1 + 0.4 * magnetRank);
}

export function getPrimaryWeaponVisual(player) {
  const id = player.primaryWeaponId ?? 'arcane_bolt';
  if (getUpgradeRank(player, 'wide_arc') > 0 && id !== 'ember_lance') {
    return WEAPON_VISUALS.wide_arc;
  }
  return WEAPON_VISUALS[id] ?? WEAPON_VISUALS.arcane_bolt;
}

export function rankToRoman(rank) {
  const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];
  return numerals[rank] ?? String(rank);
}
