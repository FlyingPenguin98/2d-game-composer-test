/** Central game constants — single source of truth. */
export const SCENES = {
  BOOT: 'BootScene',
  MENU: 'MainMenuScene',
  GAME: 'GameScene',
};

export const GAME = {
  WIDTH: 960,
  HEIGHT: 640,
  TILE: 16,
  SPRITE_SCALE: 2,
};

/** World map — 3× viewport screens (confirmed sufficient). */
export const WORLD = {
  SCREENS_W: 3,
  SCREENS_H: 3,
  get COLS() {
    return Math.floor((GAME.WIDTH / (GAME.TILE * GAME.SPRITE_SCALE)) * WORLD.SCREENS_W);
  },
  get ROWS() {
    return Math.floor((GAME.HEIGHT / (GAME.TILE * GAME.SPRITE_SCALE)) * WORLD.SCREENS_H);
  },
  get DISPLAY_TILE() {
    return GAME.TILE * GAME.SPRITE_SCALE;
  },
  CAMERA_LERP: 0.1,
  SPAWN_MARGIN: 48,
};

export const PLAYER = {
  SPEED: 130,
  MAX_HEALTH: 100,
  ATTACK_COOLDOWN: 450,
  ATTACK_RANGE: 280,
  PROJECTILE_DAMAGE: 25,
  INVINCIBLE_MS: 900,
};

export const WAVES = {
  INITIAL_SPAWN_INTERVAL: 2800,
  MIN_SPAWN_INTERVAL: 700,
  SPAWN_INTERVAL_STEP: 150,
  KILLS_PER_WAVE: 5,
  INITIAL_ENEMIES: 3,
  BASE_ENEMY_CAP: 45,
  MAX_ENEMIES: 120,
};

/** Upgrade slot limits — Phase 6 / 7. */
export const UPGRADE_LIMITS = {
  MAX_STAT_ITEMS: 6,
  MAX_WEAPONS: 6,
};

export const COMBAT = {
  HIT_STUN_MS: 110,
  KNOCKBACK_FORCE: 150,
  KNOCKBACK_DECAY: 0.8,
  HIT_SHAKE_MS: 50,
  HIT_SHAKE_INTENSITY: 0.003,
};

/** XP, leveling, and pickup — Phase 5. */
export const XP = {
  /** Gems auto-collect within this radius (display px). */
  PICKUP_RADIUS: 56,
  /** Chance per kill to drop a vacuum item (0–1). */
  VACUUM_DROP_CHANCE: 0.015,
  /** Orbiting blade tick interval (ms). */
  ORBIT_TICK_MS: 350,
  ORBIT_RADIUS: 38,
  ORBIT_DAMAGE: 14,
};

/** XP required to advance from `level` to level + 1. */
export function xpToReachNextLevel(level) {
  return Math.floor(20 + level * 25 + level * level * 2);
}

export const TEXTURES = {
  TILESET: 'tileset',
  PLAYER: 'player',
  SLIME: 'enemy_slime',
  SKELETON: 'enemy_skeleton',
  BAT: 'enemy_bat',
  PROJECTILE: 'projectile',
  PARTICLE: 'particle',
  SHADOW: 'shadow',
  HEART: 'heart',
  HEART_EMPTY: 'heart_empty',
  XP_GEM: 'xp_gem',
  VACUUM_ITEM: 'vacuum_item',
};

export const FONTS = {
  TITLE: '"Cinzel", Georgia, "Times New Roman", serif',
  BODY: '"Nunito Sans", "Segoe UI", system-ui, sans-serif',
  /** Legacy — avoid for new UI. */
  PIXEL: '"Courier New", Courier, monospace',
};
