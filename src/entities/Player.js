import { PAL, SPRITE_SCALE } from '../utils/SnesPalettes.js';
import { PLAYER as PLAYER_CFG } from '../config/GameConfig.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.invincible = false;

    Player.registerAnims(scene);

    this.sprite = scene.physics.add.sprite(x, y, 'player', 0);
    this.sprite.setScale(SPRITE_SCALE);
    this.sprite.setDepth(10);
    this.sprite.body.setSize(12, 8);
    this.sprite.body.setOffset(10, 20);
    this.sprite.setCollideWorldBounds(true);

    this.speed = PLAYER_CFG.SPEED;
    this.maxHealth = PLAYER_CFG.MAX_HEALTH;
    this.health = PLAYER_CFG.MAX_HEALTH;
    this.attackCooldown = PLAYER_CFG.ATTACK_COOLDOWN;
    this.lastAttack = 0;
    this.facing = 'down';

    this.shadow = scene.add.image(x, y + 14, 'shadow').setDepth(5).setScale(SPRITE_SCALE);
    this.shadow.setAlpha(0.7);
  }

  static registerAnims(scene) {
    const anims = [
      { key: 'hero_down', start: 0, end: 1 },
      { key: 'hero_up', start: 2, end: 3 },
      { key: 'hero_left', start: 4, end: 5 },
      { key: 'hero_right', start: 6, end: 7 },
    ];
    for (const { key, start, end } of anims) {
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers('player', { start, end }),
          frameRate: 6,
          repeat: -1,
        });
      }
    }
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

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      if (Math.abs(vy) >= Math.abs(vx)) {
        this.facing = vy < 0 ? 'up' : 'down';
      } else {
        this.facing = vx < 0 ? 'left' : 'right';
      }
      this.sprite.anims.play(`hero_${this.facing}`, true);
    } else {
      this.sprite.anims.stop();
      const idleFrame = { down: 0, up: 2, left: 4, right: 6 }[this.facing];
      this.sprite.setFrame(idleFrame);
    }

    this.shadow.setPosition(this.sprite.x, this.sprite.y + 14);
    this.sprite.setDepth(8 + this.sprite.y * 0.001);

    if (time - this.lastAttack >= this.attackCooldown) {
      const target = this.findNearestEnemy();
      if (target) this.attack(target, time);
    }
  }

  findNearestEnemy() {
    const enemies = this.scene.enemies?.getChildren() ?? [];
    let nearest = null;
    let minDist = PLAYER_CFG.ATTACK_RANGE;

    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y, enemy.x, enemy.y
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
      this.sprite.x, this.sprite.y, target.x, target.y
    );
    this.scene.fireProjectile(
      this.sprite.x,
      this.sprite.y - 4,
      Math.cos(angle),
      Math.sin(angle)
    );

    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.sprite?.active) this.sprite.clearTint();
    });
  }

  takeDamage(amount) {
    if (this.invincible) return;
    this.health = Math.max(0, this.health - amount);

    this.sprite.setTint(0xff8080);
    this.scene.time.delayedCall(120, () => {
      if (this.sprite?.active) this.sprite.clearTint();
    });

    if (this.health <= 0) this.die();
  }

  die() {
    this.scene.events.emit('playerDied');
  }

  destroy() {
    this.shadow?.destroy();
    this.sprite?.destroy();
  }
}
