import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { XpGem } from '../entities/XpGem.js';
import { VacuumItem } from '../entities/VacuumItem.js';
import { WorldMap } from '../world/WorldMap.js';
import { WorldRenderer } from '../world/WorldRenderer.js';
import { RunState, getSpawnIntervalForTime } from '../services/RunState.js';
import { PAL } from '../utils/SnesPalettes.js';
import { SnesUI } from '../utils/SnesUI.js';
import { SceneTransition } from '../utils/SceneTransition.js';
import { AssetService } from '../services/AssetService.js';
import { UpgradePicker } from '../ui/UpgradePicker.js';
import {
  applyUpgrade,
  pickRandomUpgrades,
  getPickupRadius,
} from '../config/UpgradeRegistry.js';
import {
  PLAYER as PLAYER_CFG,
  WAVES,
  SCENES,
  WORLD,
  GAME,
  COMBAT,
  XP,
  FONTS,
} from '../config/GameConfig.js';
import {
  Hitboxes,
  HIT_TEST,
  segmentHitsCircle,
} from '../utils/Hitboxes.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  create() {
    try {
      AssetService.assertReady(this.game);

      const { width, height } = this.scale;

      this.runState = new RunState();
      this.spawnTimer = 0;
      this.gameOver = false;
      this.levelUpActive = false;
      this.upgradePicker = null;

      this.cameras.main.setBackgroundColor(PAL.grassDark);

      Enemy.registerAnims(this);
      this.createWorld();
      this.createPlayer();
      this.createUI(width, height);
      this.setupInput();
      this.setupCollisions();

      this.events.on('playerDied', this.handleGameOver, this);
      SceneTransition.onEnter(this, 300);
    } catch (err) {
      console.error('[GameScene] create failed:', err);
      this.showFatalError(err);
    }
  }

  shutdown() {
    this.events.off('playerDied', this.handleGameOver, this);
    if (this.escHandler) {
      this.input.keyboard.off('keydown-ESC', this.escHandler);
    }
    this.upgradePicker?.destroy();
    this.worldRenderer?.destroy();
  }

  showFatalError(err) {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#200010');
    this.add.text(width / 2, height / 2, `Error: ${err.message}\nPress ESC for menu`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ff8080',
      align: 'center',
    }).setOrigin(0.5);
  }

  createWorld() {
    this.worldMap = new WorldMap(WORLD.COLS, WORLD.ROWS);
    this.worldRenderer = new WorldRenderer(this, this.worldMap);

    this.physics.world.setBounds(0, 0, this.worldMap.widthPx, this.worldMap.heightPx);
    this.cameras.main.setBounds(0, 0, this.worldMap.widthPx, this.worldMap.heightPx);
    this.cameras.main.setZoom(1);
  }

  createPlayer() {
    const spawn = this.worldMap.getSpawnPixel();
    this.player = new Player(this, spawn.x, spawn.y);

    this.worldRenderer.setupPlayerCollision(this.player.sprite);

    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.xpGems = this.physics.add.group();
    this.vacuumItems = this.physics.add.group();

    this.cameras.main.startFollow(this.player.sprite, true, WORLD.CAMERA_LERP, WORLD.CAMERA_LERP);
    this.cameras.main.setDeadzone(80, 60);

    for (let i = 0; i < WAVES.INITIAL_ENEMIES; i++) {
      Enemy.spawnOutsideCamera(this);
    }
  }

  createUI(width, _height) {
    SnesUI.drawWindow(this, 8, 8, width - 16, 52, 100);

    this.hearts = [];
    for (let i = 0; i < 10; i++) {
      const heart = this.add.image(24 + i * 18, 26, 'heart')
        .setScale(2).setDepth(101).setScrollFactor(0);
      this.hearts.push(heart);
    }

    this.timerText = SnesUI.snesText(this, width / 2, 16, '0:00', {
      size: '16px', color: PAL.uiGold, depth: 101,
    }).setOrigin(0.5, 0);

    this.levelText = SnesUI.snesText(this, width / 2, 32, 'LV 1', {
      size: '10px', color: PAL.uiTextDim, depth: 101,
    }).setOrigin(0.5, 0);

    this.scoreText = SnesUI.snesText(this, width - 24, 18, 'SCORE 0000', {
      size: '14px', color: PAL.uiGold, depth: 101,
    }).setOrigin(1, 0);

    this.killsText = SnesUI.snesText(this, width - 24, 34, 'KILLS 0', {
      size: '10px', color: PAL.uiTextDim, depth: 101,
    }).setOrigin(1, 0);

    const barX = 20;
    const barY = 48;
    const barW = width - 40;
    this.xpBarBg = this.add.graphics().setDepth(101).setScrollFactor(0);
    this.xpBarFill = this.add.graphics().setDepth(102).setScrollFactor(0);
    this.xpBarBounds = { x: barX, y: barY, w: barW, h: 6 };
    this.drawXpBar();
  }

  drawXpBar() {
    const { x, y, w, h } = this.xpBarBounds;
    const rs = this.runState;
    const ratio = rs.xpToNext > 0 ? Phaser.Math.Clamp(rs.xp / rs.xpToNext, 0, 1) : 0;

    this.xpBarBg.clear();
    this.xpBarBg.fillStyle(parseInt(PAL.uiShadow.slice(1), 16));
    this.xpBarBg.fillRect(x, y, w, h);

    this.xpBarFill.clear();
    if (ratio > 0) {
      this.xpBarFill.fillStyle(parseInt(PAL.slime1.slice(1), 16));
      this.xpBarFill.fillRect(x, y, Math.max(2, w * ratio), h);
    }
  }

  updateXpHud() {
    this.levelText.setText(`LV ${this.runState.level}`);
    this.drawXpBar();
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey('W'),
      A: this.input.keyboard.addKey('A'),
      S: this.input.keyboard.addKey('S'),
      D: this.input.keyboard.addKey('D'),
    };

    this.escHandler = () => {
      if (this.levelUpActive || this.gameOver) return;
      SceneTransition.toMenu(this);
    };
    this.input.keyboard.on('keydown-ESC', this.escHandler);
  }

  setupCollisions() {
    this.physics.add.overlap(this.player.sprite, this.enemies, (_p, enemySprite) => {
      if (!enemySprite.active || this.player.invincible || this.levelUpActive) return;
      const cfg = enemySprite.enemyRef?.config;
      if (cfg) {
        this.player.takeDamage(cfg.damage);
        this.player.invincible = true;
        this.time.delayedCall(PLAYER_CFG.INVINCIBLE_MS, () => {
          this.player.invincible = false;
        });
      }
    });
  }

  spawnLoot(x, y, config) {
    XpGem.spawn(this, x, y, config.xp ?? 10);

    if (Math.random() < XP.VACUUM_DROP_CHANCE) {
      VacuumItem.spawn(this, x + Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(-8, 8));
    }
  }

  collectXpGem(gem) {
    if (!gem?.active) return;
    const value = gem.xpValue ?? 1;
    gem.destroy();
    this.runState.addXp(value);
    this.updateXpHud();

    if (this.runState.pendingLevelUps > 0) {
      this.showLevelUpPicker();
    }
  }

  checkXpPickup() {
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const radius = getPickupRadius(this.player);

    for (const gem of this.xpGems.getChildren()) {
      if (!gem.active) continue;
      const dist = Phaser.Math.Distance.Between(px, py, gem.x, gem.y);
      if (dist <= radius) {
        this.collectXpGem(gem);
      }
    }
  }

  checkVacuumPickup() {
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;

    for (const item of this.vacuumItems.getChildren()) {
      if (!item.active) continue;
      const dist = Phaser.Math.Distance.Between(px, py, item.x, item.y);
      if (dist <= 24) {
        VacuumItem.activate(this, item, px, py);
      }
    }
  }

  spawnVacuumVfx(x, y) {
    const ring = this.add.circle(x, y, 8, 0xf878a8, 0.5).setDepth(20);
    this.tweens.add({
      targets: ring,
      scaleX: 8,
      scaleY: 8,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  showLevelUpPicker() {
    if (this.levelUpActive) return;

    this.levelUpActive = true;
    this.runState.isPaused = true;
    this.physics.pause();

    const choices = pickRandomUpgrades(this.player, this.runState, 3);
    if (choices.length === 0) {
      this.runState.pendingLevelUps = 0;
      this.finishLevelUp();
      return;
    }

    const upgradeIds = choices.map((c) => c.id);
    this.upgradePicker = new UpgradePicker(this, upgradeIds, (upgradeId) => {
      this.runState.recordUpgrade(upgradeId);
      applyUpgrade(this.player, upgradeId);
      this.updateXpHud();
      this.updateHearts();
      this.finishLevelUp();
    });
  }

  finishLevelUp() {
    this.upgradePicker?.destroy();
    this.upgradePicker = null;

    if (this.runState.pendingLevelUps > 0) {
      this.showLevelUpPicker();
      return;
    }

    this.levelUpActive = false;
    this.runState.isPaused = false;
    if (!this.gameOver) {
      this.physics.resume();
    }
  }

  checkProjectileHits() {
    const enemies = this.enemies.getChildren();

    for (const proj of this.projectiles.getChildren()) {
      if (!proj.active) continue;

      const px = proj.x;
      const py = proj.y;
      const prevX = proj.prevX ?? px;
      const prevY = proj.prevY ?? py;

      for (const enemySprite of enemies) {
        if (!enemySprite.active) continue;
        const ref = enemySprite.enemyRef;
        if (!ref || ref.state === 'dead') continue;
        if (proj.hitIds?.has(enemySprite)) continue;

        if (segmentHitsCircle(prevX, prevY, px, py, enemySprite.x, enemySprite.y, HIT_TEST.ENEMY_RADIUS)) {
          const dmg = proj.damage ?? PLAYER_CFG.PROJECTILE_DAMAGE;
          if (!proj.hitIds) proj.hitIds = new Set();
          proj.hitIds.add(enemySprite);
          ref.takeDamage(dmg, px, py);

          const pierceLeft = proj.pierceRemaining ?? 0;
          if (pierceLeft <= 0) {
            proj.destroy();
            break;
          }
          proj.pierceRemaining = pierceLeft - 1;
        }
      }

      if (proj.active) {
        proj.prevX = px;
        proj.prevY = py;
      }
    }
  }

  checkOrbitBladeHits(blades) {
    const enemies = this.enemies.getChildren();
    const hitRadius = 18;

    for (const blade of blades) {
      for (const enemySprite of enemies) {
        if (!enemySprite.active) continue;
        const ref = enemySprite.enemyRef;
        if (!ref || ref.state === 'dead') continue;

        const dist = Phaser.Math.Distance.Between(
          blade.x, blade.y, enemySprite.x, enemySprite.y
        );
        if (dist <= hitRadius) {
          ref.takeDamage(XP.ORBIT_DAMAGE, blade.x, blade.y);
        }
      }
    }
  }

  fireProjectile(x, y, dirX, dirY, opts = {}) {
    const proj = this.projectiles.create(x, y, 'projectile');
    proj.setDepth(12).setScale(GAME.SPRITE_SCALE);
    proj.damage = opts.damage ?? PLAYER_CFG.PROJECTILE_DAMAGE;
    proj.pierceRemaining = opts.pierce ?? 0;
    proj.prevX = x;
    proj.prevY = y;
    proj.body.setVelocity(dirX * 280, dirY * 280);
    Hitboxes.configureProjectile(proj);

    this.time.delayedCall(1800, () => { if (proj.active) proj.destroy(); });
  }

  onEnemyHit(x, y, damage, color) {
    this.cameras.main.shake(COMBAT.HIT_SHAKE_MS, COMBAT.HIT_SHAKE_INTENSITY);
    this.spawnHitParticles(x, y, color);
    this.spawnDamageNumber(x, y, damage);
  }

  spawnDamageNumber(x, y, damage) {
    const txt = this.add.text(x, y - 10, String(damage), {
      fontFamily: FONTS.PIXEL,
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      resolution: 2,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: txt,
      y: y - 28,
      alpha: 0,
      duration: 450,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  spawnHitParticles(x, y, color) {
    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 60, max: 140 },
      scale: { start: 2.5, end: 0 },
      lifespan: 300,
      quantity: 8,
      tint: color,
      emitting: false,
      angle: { min: 0, max: 360 },
    });
    emitter.setDepth(15).explode(8);
    this.time.delayedCall(350, () => emitter.destroy());
  }

  spawnDeathParticles(x, y, color) {
    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 120 },
      scale: { start: 3, end: 0 },
      lifespan: 400,
      quantity: 14,
      tint: color,
      emitting: false,
      angle: { min: 0, max: 360 },
    });
    emitter.setDepth(15).explode(14);
    this.time.delayedCall(450, () => emitter.destroy());
  }

  addScore(points) {
    this.runState.addKill(points);
    this.scoreText.setText(`SCORE ${String(this.runState.score).padStart(4, '0')}`);
    this.killsText.setText(`KILLS ${this.runState.kills}`);
  }

  updateHearts() {
    const maxHearts = Math.ceil(this.player.maxHealth / 10);
    const filled = Math.ceil(this.player.health / 10);
    for (let i = 0; i < this.hearts.length; i++) {
      if (i >= maxHearts) {
        this.hearts[i].setVisible(false);
      } else {
        this.hearts[i].setVisible(true);
        this.hearts[i].setTexture(i < filled ? 'heart' : 'heart_empty');
      }
    }
  }

  updateTimerHud() {
    this.timerText.setText(this.runState.getFormattedTime());
  }

  handleGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.levelUpActive = false;
    this.upgradePicker?.destroy();
    this.runState.endDefeat();
    this.physics.pause();

    const { width, height } = this.scale;
    const rs = this.runState;

    SnesUI.drawWindow(this, width / 2 - 170, height / 2 - 110, 340, 220, 200);

    SnesUI.snesText(this, width / 2, height / 2 - 85, 'YOU DIED', {
      size: '24px', color: PAL.boneEye, depth: 201,
    }).setOrigin(0.5);

    SnesUI.snesText(this, width / 2, height / 2 - 52, `TIME  ${rs.getFormattedTime()}`, {
      size: '14px', color: PAL.uiGold, depth: 201,
    }).setOrigin(0.5);

    SnesUI.snesText(this, width / 2, height / 2 - 28, `LEVEL ${rs.level}`, {
      size: '14px', depth: 201,
    }).setOrigin(0.5);

    SnesUI.snesText(this, width / 2, height / 2 - 4, `SCORE ${String(rs.score).padStart(4, '0')}`, {
      size: '14px', depth: 201,
    }).setOrigin(0.5);

    SnesUI.snesText(this, width / 2, height / 2 + 20, `KILLS ${rs.kills}`, {
      size: '14px', depth: 201,
    }).setOrigin(0.5);

    const retry = SnesUI.snesText(this, width / 2, height / 2 + 55, '▶ Press R to Retry', {
      size: '14px', color: PAL.uiGold, depth: 201,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retry.on('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-R', () => this.scene.restart());

    SnesUI.snesText(this, width / 2, height / 2 + 80, 'ESC — Main Menu', {
      size: '12px', color: PAL.uiTextDim, depth: 201,
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver || !this.player?.sprite?.active) return;
    if (this.levelUpActive) return;

    this.runState.update(delta);
    this.updateTimerHud();

    this.player.update(time, this.cursors, this.wasd);
    this.updateHearts();
    this.checkXpPickup();
    this.checkVacuumPickup();

    for (const enemySprite of this.enemies.getChildren()) {
      if (enemySprite.active && enemySprite.enemyRef) {
        enemySprite.enemyRef.update(time, this.player.sprite.x, this.player.sprite.y);
      }
    }

    this.checkProjectileHits();

    const spawnInterval = getSpawnIntervalForTime(this.runState.elapsedMs);
    this.spawnTimer += delta;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      Enemy.spawnOutsideCamera(this);
    }
  }
}
