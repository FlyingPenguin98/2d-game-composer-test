/**
 * Consistent arcade hitboxes aligned to 16×16 art at SPRITE_SCALE.
 * Bodies use unscaled texture-space coordinates; Phaser scales with the sprite.
 */
export const Hitboxes = {
  /** Apply after setScale on player sprite. */
  configurePlayer(sprite) {
    sprite.body.setCircle(7, 1, 7);
  },

  /** Apply after setScale on enemy sprite. */
  configureEnemy(sprite) {
    sprite.body.setCircle(8, 0, 4);
  },

  /** Apply after setScale on projectile sprite. */
  configureProjectile(sprite) {
    sprite.body.setCircle(5, 0, 0);
  },
};

/** Radii for reliable distance-based hit tests (display pixels). */
export const HIT_TEST = {
  PROJECTILE_RADIUS: 14,
  ENEMY_RADIUS: 16,
  PLAYER_RADIUS: 14,
};

/** Max movement per frame before we sweep projectiles (prevents tunneling). */
export const PROJECTILE_TUNNEL_THRESHOLD = 12;

/**
 * Circle-vs-circle hit test in world space (display pixels).
 */
export function circlesOverlap(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const sum = r1 + r2;
  return dx * dx + dy * dy <= sum * sum;
}

/**
 * Segment-vs-circle — catches fast projectiles between frames.
 */
export function segmentHitsCircle(x0, y0, x1, y1, cx, cy, radius) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return circlesOverlap(x0, y0, HIT_TEST.PROJECTILE_RADIUS, cx, cy, radius);
  }
  let t = ((cx - x0) * dx + (cy - y0) * dy) / lenSq;
  t = Phaser.Math.Clamp(t, 0, 1);
  const px = x0 + t * dx;
  const py = y0 + t * dy;
  return circlesOverlap(px, py, HIT_TEST.PROJECTILE_RADIUS, cx, cy, radius);
}
