import { PAL, SPRITE_SCALE } from '../utils/SnesPalettes.js';
import { PLAYER as PLAYER_CFG, XP } from '../config/GameConfig.js';
import { Hitboxes } from '../utils/Hitboxes.js';
import {
  getProjectileCount,
  getProjectileDamage,
  getPierceCount,
  getPrimaryWeaponVisual,
  WEAPON_VISUALS,
} from '../config/UpgradeRegistry.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.invincible = false;
    this.primaryWeaponId = 'arcane_bolt';

    Player.registerAnims(scene);

    this.sprite = scene.physics.add.sprite(x, y, 'player', 0);
    this.sprite.setScale(SPRITE_SCALE);
    this.sprite.setDepth(10);
    Hitboxes.configurePlayer(this.sprite);
    this.sprite.setCollideWorldBounds(true);

    this.speed = PLAYER_CFG.SPEED;
    this.maxHealth = PLAYER_CFG.MAX_HEALTH;
    this.health = PLAYER_CFG.MAX_HEALTH;
    this.attackCooldown = PLAYER_CFG.ATTACK_COOLDOWN;
    this.lastAttack = 0;
    this.facing = 'down';

    this.orbitBlades = [];
    this.orbitAngle = 0;
    this.lastOrbitTick = 0;

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

  ensureOrbitBlades(count) {
    const visual = WEAPON_VISUALS.orbit_blade;
    while (this.orbitBlades.length < count) {
      const blade = this.scene.add.image(0, 0, visual.texture)
        .setScale(SPRITE_SCALE * visual.scale)
        .setDepth(11);
      this.orbitBlades.push(blade);
    }
    while (this.orbitBlades.length > count) {
      this.orbitBlades.pop()?.destroy();
    }
  }

  updateOrbitBlades(time) {
    const count = this.orbitBlades.length;
    if (count === 0) return;

    this.orbitAngle += 0.045;
    const radius = XP.ORBIT_RADIUS;

    for (let i = 0; i < count; i++) {
      const angle = this.orbitAngle + (i / count) * Math.PI * 2;
      const blade = this.orbitBlades[i];
      blade.setPosition(
        this.sprite.x + Math.cos(angle) * radius,
        this.sprite.y + Math.sin(angle) * radius
      );
      blade.setRotation(angle + Math.PI / 2);
      blade.setDepth(8 + this.sprite.y * 0.001 + 0.5);
    }

    if (time - this.lastOrbitTick >= XP.ORBIT_TICK_MS) {
      this.lastOrbitTick = time;
      this.scene.checkOrbitBladeHits(this.orbitBlades);
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

    this.updateOrbitBlades(time);

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

    const baseAngle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y, target.x, target.y
    );
    const count = getProjectileCount(this);
    const spread = count > 1 ? 0.35 : 0;
    const visual = getPrimaryWeaponVisual(this);

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread;
      const angle = baseAngle + t;
      this.scene.fireProjectile(
        this.sprite.x,
        this.sprite.y - 4,
        Math.cos(angle),
        Math.sin(angle),
        {
          damage: getProjectileDamage(this),
          pierce: getPierceCount(this),
          texture: visual.texture,
          tint: visual.tint,
          trailColor: visual.trailColor,
          scale: visual.scale,
        }
      );
    }

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
    for (const b of this.orbitBlades) b.destroy();
    this.orbitBlades = [];
    this.shadow?.destroy();
    this.sprite?.destroy();
  }
}
