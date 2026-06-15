export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setPipeline('Light2D');
    this.sprite.setDepth(10);
    this.sprite.body.setSize(40, 30);
    this.sprite.body.setOffset(12, 40);
    this.sprite.setCollideWorldBounds(true);

    this.speed = 200;
    this.maxHealth = 100;
    this.health = 100;
    this.attackCooldown = 400;
    this.lastAttack = 0;
    this.facing = { x: 0, y: 1 };

    this.shadow = scene.add.ellipse(x, y + 28, 50, 16, 0x000000, 0.35);
    this.shadow.setDepth(5);

    this.light = scene.lights.addLight(x, y, 120, 0x6090ff, 0.6);
  }

  update(time, cursors, wasd) {
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown || wasd.A.isDown) vx = -1;
    else if (cursors.right.isDown || wasd.D.isDown) vx = 1;
    if (cursors.up.isDown || wasd.W.isDown) vy = -1;
    else if (cursors.down.isDown || wasd.S.isDown) vy = 1;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.sprite.setVelocity(vx * this.speed, vy * this.speed);

    if (vx !== 0 || vy !== 0) {
      this.facing = { x: vx, y: vy };
    }

    // Subtle bob animation while moving
    const moving = vx !== 0 || vy !== 0;
    this.sprite.setScale(1, moving ? 1 + Math.sin(time / 100) * 0.03 : 1);

    this.shadow.setPosition(this.sprite.x, this.sprite.y + 28);
    this.light.setPosition(this.sprite.x, this.sprite.y - 10);

    // Auto-attack nearest enemy
    if (time - this.lastAttack >= this.attackCooldown) {
      const target = this.findNearestEnemy();
      if (target) {
        this.attack(target, time);
      }
    }
  }

  findNearestEnemy() {
    const enemies = this.scene.enemies.getChildren();
    let nearest = null;
    let minDist = 350;

    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        enemy.x,
        enemy.y
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  attack(target, time) {
    this.lastAttack = time;

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      target.x,
      target.y
    );

    const fx = Math.cos(angle);
    const fy = Math.sin(angle);
    this.facing = { x: fx, y: fy };

    this.scene.fireProjectile(this.sprite.x, this.sprite.y - 10, fx, fy);

    // Attack flash on staff
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 1, to: 0.7 },
      duration: 80,
      yoyo: true,
    });
  }

  takeDamage(amount) {
    this.health -= amount;
    this.scene.cameras.main.flash(100, 80, 20, 20);

    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0xff4040,
      duration: 100,
      yoyo: true,
      onComplete: () => this.sprite.clearTint(),
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.scene.events.emit('playerDied');
  }

  destroy() {
    this.shadow.destroy();
    this.sprite.destroy();
    this.scene.lights.removeLight(this.light);
  }
}
