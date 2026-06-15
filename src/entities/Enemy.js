import { SPRITE_SCALE } from '../utils/SnesPalettes.js';

const ENEMY_TYPES = {
  slime: {
    texture: 'enemy_slime',
    health: 30,
    speed: 45,
    damage: 10,
    score: 10,
    scale: SPRITE_SCALE,
    animKey: 'slime_bounce',
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
    hitColor: 0x7868a8,
  },
};

export class Enemy {
  constructor(scene, x, y, typeKey) {
    this.scene = scene;
    this.typeKey = typeKey;
    this.config = ENEMY_TYPES[typeKey];

    this.sprite = scene.physics.add.sprite(x, y, this.config.texture, 0);
    this.sprite.setScale(this.config.scale);
    this.sprite.setDepth(8);
    this.sprite.enemyRef = this;

    this.sprite.body.setSize(10, 8);
    this.sprite.body.setOffset(11, 18);

    this.health = this.config.health;
    this.maxHealth = this.config.health;

    this.shadow = scene.add.image(x, y + 12, 'shadow').setDepth(4).setScale(SPRITE_SCALE * 0.8);
    this.shadow.setAlpha(0.6);

    if (this.config.animKey && scene.anims.exists(this.config.animKey)) {
      this.sprite.anims.play(this.config.animKey);
    }
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

  update(_time, playerX, playerY) {
    if (!this.sprite.active) return;

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y, playerX, playerY
    );
    this.sprite.setVelocity(
      Math.cos(angle) * this.config.speed,
      Math.sin(angle) * this.config.speed
    );

    if (Math.cos(angle) < 0) this.sprite.setFlipX(true);
    else if (Math.cos(angle) > 0) this.sprite.setFlipX(false);

    this.shadow.setPosition(this.sprite.x, this.sprite.y + 12);
  }

  takeDamage(amount) {
    this.health -= amount;

    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });

    this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, this.config.hitColor);

    if (this.health <= 0) this.die();
  }

  die() {
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

  static spawnAtEdge(scene, _playerX, _playerY) {
    const margin = 40;
    const w = scene.scale.width;
    const h = scene.scale.height;
    const edge = Phaser.Math.Between(0, 3);
    let x, y;

    switch (edge) {
      case 0: x = Phaser.Math.Between(margin, w - margin); y = -margin; break;
      case 1: x = w + margin; y = Phaser.Math.Between(margin, h - margin); break;
      case 2: x = Phaser.Math.Between(margin, w - margin); y = h + margin; break;
      default: x = -margin; y = Phaser.Math.Between(margin, h - margin);
    }

    const enemy = new Enemy(scene, x, y, Enemy.getRandomType());
    scene.enemies.add(enemy.sprite);
    return enemy;
  }
}

export { ENEMY_TYPES };
