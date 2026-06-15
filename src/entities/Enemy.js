const ENEMY_TYPES = {
  slime: {
    texture: 'enemy_slime',
    health: 30,
    speed: 60,
    damage: 10,
    score: 10,
    scale: 1.2,
    tint: null,
    lightColor: 0x40ff80,
    lightRadius: 60,
    lightIntensity: 0.3,
  },
  skeleton: {
    texture: 'enemy_skeleton',
    health: 50,
    speed: 90,
    damage: 15,
    score: 25,
    scale: 1.1,
    tint: null,
    lightColor: 0x8040ff,
    lightRadius: 50,
    lightIntensity: 0.25,
  },
  wisp: {
    texture: 'enemy_wisp',
    health: 20,
    speed: 120,
    damage: 8,
    score: 15,
    scale: 1.0,
    tint: null,
    lightColor: 0xff8040,
    lightRadius: 70,
    lightIntensity: 0.5,
  },
};

export class Enemy {
  constructor(scene, x, y, typeKey) {
    this.scene = scene;
    this.typeKey = typeKey;
    this.config = ENEMY_TYPES[typeKey];

    this.sprite = scene.physics.add.sprite(x, y, this.config.texture);
    this.sprite.setPipeline('Light2D');
    this.sprite.setScale(this.config.scale);
    this.sprite.setDepth(8);
    this.sprite.enemyRef = this;

    this.sprite.body.setSize(
      this.sprite.width * 0.6,
      this.sprite.height * 0.5
    );
    this.sprite.body.setOffset(
      this.sprite.width * 0.2,
      this.sprite.height * 0.4
    );

    this.health = this.config.health;
    this.maxHealth = this.config.health;

    this.shadow = scene.add.ellipse(x, y + 20, 36, 12, 0x000000, 0.3);
    this.shadow.setDepth(4);

    this.light = scene.lights.addLight(
      x,
      y,
      this.config.lightRadius,
      this.config.lightColor,
      this.config.lightIntensity
    );

    // Floating animation offset
    this.floatOffset = Math.random() * Math.PI * 2;
  }

  update(time, playerX, playerY) {
    if (!this.sprite.active) return;

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      playerX,
      playerY
    );

    const vx = Math.cos(angle) * this.config.speed;
    const vy = Math.sin(angle) * this.config.speed;
    this.sprite.setVelocity(vx, vy);

    // Flip based on direction
    if (vx < 0) this.sprite.setFlipX(true);
    else if (vx > 0) this.sprite.setFlipX(false);

    const bob = Math.sin(time / 300 + this.floatOffset) * 4;
    this.sprite.setOrigin(0.5, 0.5 + bob * 0.001);

    this.shadow.setPosition(this.sprite.x, this.sprite.y + 20);
    this.light.setPosition(this.sprite.x, this.sprite.y);
  }

  takeDamage(amount) {
    this.health -= amount;

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 1, to: 0.4 },
      duration: 50,
      yoyo: true,
    });

    // Hit particles
    this.scene.spawnHitParticles(this.sprite.x, this.sprite.y, this.config.lightColor);

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.scene.spawnDeathParticles(this.sprite.x, this.sprite.y, this.config.lightColor);
    this.scene.addScore(this.config.score);
    this.destroy();
  }

  destroy() {
    this.shadow.destroy();
    this.scene.lights.removeLight(this.light);
    this.sprite.destroy();
  }

  static getRandomType() {
    const types = ['slime', 'skeleton', 'wisp'];
    const weights = [0.5, 0.3, 0.2];
    const roll = Math.random();
    let cumulative = 0;
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) return types[i];
    }
    return 'slime';
  }

  static spawnAtEdge(scene, playerX, playerY) {
    const margin = 80;
    const w = scene.scale.width;
    const h = scene.scale.height;
    const edge = Phaser.Math.Between(0, 3);
    let x, y;

    switch (edge) {
      case 0:
        x = Phaser.Math.Between(margin, w - margin);
        y = -margin;
        break;
      case 1:
        x = w + margin;
        y = Phaser.Math.Between(margin, h - margin);
        break;
      case 2:
        x = Phaser.Math.Between(margin, w - margin);
        y = h + margin;
        break;
      default:
        x = -margin;
        y = Phaser.Math.Between(margin, h - margin);
    }

    const type = Enemy.getRandomType();
    const enemy = new Enemy(scene, x, y, type);
    scene.enemies.add(enemy.sprite);
    return enemy;
  }
}

export { ENEMY_TYPES };
