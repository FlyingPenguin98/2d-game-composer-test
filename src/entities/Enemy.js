import { SPRITE_SCALE } from '../utils/SnesPalettes.js';
import { WORLD, COMBAT } from '../config/GameConfig.js';
import { Hitboxes } from '../utils/Hitboxes.js';

const ENEMY_STATE = {
  CHASE: 'chase',
  HIT: 'hit',
};

const ENEMY_TYPES = {
  slime: {
    texture: 'enemy_slime',
    health: 30,
    speed: 45,
    damage: 10,
    score: 10,
    scale: SPRITE_SCALE,
    animKey: 'slime_bounce',
    hitFrame: 2,
    hitColor: 0x5090f8,
  },
  skeleton: {
    texture: 'enemy_skeleton',
    health: 50,
    speed: 65,
    damage: 15,
    score: 25,
    scale: SPRITE_SCALE,
    animKey: null,
    hitFrame: 1,
    idleFrame: 0,
    hitColor: 0xf8f0d8,
  },
  bat: {
    texture: 'enemy_bat',
    health: 20,
    speed: 90,
    damage: 8,
    score: 15,
    scale: SPRITE_SCALE,
    animKey: 'bat_flap',
    hitFrame: 2,
    hitColor: 0x7868a8,
  },
};

export class Enemy {
  constructor(scene, x, y, typeKey) {
    this.scene = scene;
    this.typeKey = typeKey;
    this.config = ENEMY_TYPES[typeKey];
    this.state = ENEMY_STATE.CHASE;
    this.stunUntil = 0;
    this.knockbackVx = 0;
    this.knockbackVy = 0;

    this.sprite = scene.physics.add.sprite(x, y, this.config.texture, 0);
    this.sprite.setScale(this.config.scale);
    this.sprite.setDepth(8);
    this.sprite.enemyRef = this;

    Hitboxes.configureEnemy(this.sprite);
    this.sprite.setCollideWorldBounds(true);

    this.health = this.config.health;
    this.maxHealth = this.config.health;

    this.shadow = scene.add.image(x, y + 12, 'shadow').setDepth(4).setScale(SPRITE_SCALE * 0.8);
    this.shadow.setAlpha(0.6);

    this.playIdleAnim();
  }

  static registerAnims(scene) {
    if (!scene.anims.exists('slime_bounce')) {
      scene.anims.create({
        key: 'slime_bounce',
        frames: scene.anims.generateFrameNumbers('enemy_slime', { start: 0, end: 1 }),
        frameRate: 4,
        repeat: -1,
      });
    }
    if (!scene.anims.exists('bat_flap')) {
      scene.anims.create({
        key: 'bat_flap',
        frames: scene.anims.generateFrameNumbers('enemy_bat', { start: 0, end: 1 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  playIdleAnim() {
    if (this.config.animKey && this.scene.anims.exists(this.config.animKey)) {
      this.sprite.anims.play(this.config.animKey, true);
    } else if (this.config.idleFrame !== undefined) {
      this.sprite.setFrame(this.config.idleFrame);
    }
  }

  showHitFrame() {
    this.sprite.anims.stop();
    this.sprite.setFrame(this.config.hitFrame);
    this.sprite.setTint(0xffffff);
  }

  update(time, playerX, playerY) {
    if (!this.sprite.active) return;

    this.shadow.setPosition(this.sprite.x, this.sprite.y + 12);
    this.sprite.setDepth(8 + this.sprite.y * 0.001);

    if (this.state === ENEMY_STATE.HIT) {
      if (time < this.stunUntil) {
        this.sprite.setVelocity(this.knockbackVx, this.knockbackVy);
        this.knockbackVx *= COMBAT.KNOCKBACK_DECAY;
        this.knockbackVy *= COMBAT.KNOCKBACK_DECAY;
        return;
      }
      this.sprite.clearTint();
      this.state = ENEMY_STATE.CHASE;
      this.playIdleAnim();
    }

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y, playerX, playerY
    );
    this.sprite.setVelocity(
      Math.cos(angle) * this.config.speed,
      Math.sin(angle) * this.config.speed
    );

    if (Math.cos(angle) < 0) this.sprite.setFlipX(true);
    else if (Math.cos(angle) > 0) this.sprite.setFlipX(false);
  }

  takeDamage(amount, fromX, fromY) {
    if (!this.sprite.active || this.state === 'dead') return;

    this.health -= amount;

    const angle = Phaser.Math.Angle.Between(fromX, fromY, this.sprite.x, this.sprite.y);
    this.knockbackVx = Math.cos(angle) * COMBAT.KNOCKBACK_FORCE;
    this.knockbackVy = Math.sin(angle) * COMBAT.KNOCKBACK_FORCE;
    this.state = ENEMY_STATE.HIT;
    this.stunUntil = this.scene.time.now + COMBAT.HIT_STUN_MS;

    this.showHitFrame();
    this.scene.onEnemyHit(this.sprite.x, this.sprite.y, amount, this.config.hitColor);

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.state = 'dead';
    this.scene.cameras.main.shake(COMBAT.HIT_SHAKE_MS, COMBAT.HIT_SHAKE_INTENSITY * 2);
    this.scene.spawnDeathParticles(this.sprite.x, this.sprite.y, this.config.hitColor);
    this.scene.addScore(this.config.score);
    this.destroy();
  }

  destroy() {
    this.shadow.destroy();
    this.sprite.destroy();
  }

  static getRandomType() {
    const types = ['slime', 'skeleton', 'bat'];
    const weights = [0.5, 0.3, 0.2];
    const roll = Math.random();
    let cumulative = 0;
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) return types[i];
    }
    return 'slime';
  }

  static spawnOutsideCamera(scene) {
    const worldMap = scene.worldMap;
    if (!worldMap) {
      return Enemy.spawnAtEdgeLegacy(scene);
    }

    const cam = scene.cameras.main;
    const margin = WORLD.SPAWN_MARGIN;
    const view = new Phaser.Geom.Rectangle(
      cam.scrollX - margin,
      cam.scrollY - margin,
      cam.width + margin * 2,
      cam.height + margin * 2
    );

    for (let attempt = 0; attempt < 30; attempt++) {
      const edge = Phaser.Math.Between(0, 3);
      let x;
      let y;

      switch (edge) {
        case 0:
          x = Phaser.Math.Between(margin, worldMap.widthPx - margin);
          y = cam.scrollY - margin;
          break;
        case 1:
          x = cam.scrollX + cam.width + margin;
          y = Phaser.Math.Between(margin, worldMap.heightPx - margin);
          break;
        case 2:
          x = Phaser.Math.Between(margin, worldMap.widthPx - margin);
          y = cam.scrollY + cam.height + margin;
          break;
        default:
          x = cam.scrollX - margin;
          y = Phaser.Math.Between(margin, worldMap.heightPx - margin);
      }

      x = Phaser.Math.Clamp(x, margin, worldMap.widthPx - margin);
      y = Phaser.Math.Clamp(y, margin, worldMap.heightPx - margin);

      if (!Phaser.Geom.Rectangle.Contains(view, x, y) && !worldMap.isBlockedWorld(x, y)) {
        const enemy = new Enemy(scene, x, y, Enemy.getRandomType());
        scene.enemies.add(enemy.sprite);
        return enemy;
      }
    }

    return Enemy.spawnAtEdgeLegacy(scene);
  }

  static spawnAtEdgeLegacy(scene) {
    const margin = 40;
    const cam = scene.cameras.main;
    const edge = Phaser.Math.Between(0, 3);
    let x;
    let y;

    switch (edge) {
      case 0:
        x = cam.scrollX + Phaser.Math.Between(margin, cam.width - margin);
        y = cam.scrollY - margin;
        break;
      case 1:
        x = cam.scrollX + cam.width + margin;
        y = cam.scrollY + Phaser.Math.Between(margin, cam.height - margin);
        break;
      case 2:
        x = cam.scrollX + Phaser.Math.Between(margin, cam.width - margin);
        y = cam.scrollY + cam.height + margin;
        break;
      default:
        x = cam.scrollX - margin;
        y = cam.scrollY + Phaser.Math.Between(margin, cam.height - margin);
    }

    const enemy = new Enemy(scene, x, y, Enemy.getRandomType());
    scene.enemies.add(enemy.sprite);
    return enemy;
  }

  static spawnAtEdge(scene) {
    return Enemy.spawnOutsideCamera(scene);
  }
}

export { ENEMY_TYPES };
