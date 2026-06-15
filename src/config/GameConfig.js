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
  MIN_SPAWN_INTERVAL: 900,
  SPAWN_INTERVAL_STEP: 150,
  KILLS_PER_WAVE: 5,
  INITIAL_ENEMIES: 3,
};

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
};

export const FONTS = {
  PIXEL: '"Courier New", Courier, monospace',
};
