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
  MIN_SPAWN_INTERVAL: 900,
  SPAWN_INTERVAL_STEP: 150,
  KILLS_PER_WAVE: 5,
  INITIAL_ENEMIES: 3,
};

export const COMBAT = {
  HIT_STUN_MS: 110,
  KNOCKBACK_FORCE: 150,
  KNOCKBACK_DECAY: 0.8,
  HIT_SHAKE_MS: 50,
  HIT_SHAKE_INTENSITY: 0.003,
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
