import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { XpGem } from '../entities/XpGem.js';
import { VacuumItem } from '../entities/VacuumItem.js';
import { WorldMap } from '../world/WorldMap.js';
import { WorldRenderer } from '../world/WorldRenderer.js';
import { RunState } from '../services/RunState.js';
import { SpawnDirector } from '../services/SpawnDirector.js';
import { PAL } from '../utils/SnesPalettes.js';
import { GameUI, UI } from '../utils/GameUI.js';
import { SceneTransition } from '../utils/SceneTransition.js';
import { AssetService } from '../services/AssetService.js';
import { UpgradePicker } from '../ui/UpgradePicker.js';
import { PauseMenu } from '../ui/PauseMenu.js';
import { UpgradeLoadoutHud } from '../ui/UpgradeLoadoutHud.js';
import {
  applyUpgrade,
  applyStartingLoadout,
  pickLevelUpChoices,
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
      this.gameOver = false;
      this.levelUpActive = false;
      this.pauseActive = false;
      this.upgradePicker = null;
      this.pauseMenu = null;
      this.spawnDirector = null;

      this.cameras.main.setBackgroundColor(PAL.grassDark);

      Enemy.registerAnims(this);
      this.createWorld();
      this.createPlayer();
      this.createUI(width, height);
      this.setupInput();
      this.setupCollisions();

      this.spawnDirector = new SpawnDirector(this);
      applyStartingLoadout(this.player, this.runState);
      this.loadoutHud = new UpgradeLoadoutHud(this);

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
    this.pauseMenu?.destroy();
    this.loadoutHud?.destroy();
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
      Enemy.spawnOutsideCamera(this, 'slime');
    }
  }

  createUI(width, _height) {
    const hudX = 12;
    const hudY = 10;
    const hudW = width - 24;
    const hudH = 58;

    this.hudGfx = this.add.graphics().setDepth(100).setScrollFactor(0);
    GameUI.drawHudBar(this.hudGfx, hudX, hudY, hudW, hudH);

    this.hearts = [];
    for (let i = 0; i < 10; i++) {
      const heart = this.add.image(hudX + 16 + i * 18, hudY + 22, 'heart')
        .setScale(2).setDepth(101).setScrollFactor(0);
      this.hearts.push(heart);
    }

    this.timerText = GameUI.titleText(this, width / 2, hudY + 10, '0:00', {
      size: '22px', depth: 101, origin: 0.5,
    });

    this.levelText = GameUI.labelText(this, width / 2, hudY + 36, 'Level 1', {
      size: '14px', color: UI.textGold, depth: 101, origin: 0.5,
    });

    this.scoreText = GameUI.bodyText(this, hudX + hudW - 14, hudY + 12, '0', {
      size: '18px', color: UI.textGold, depth: 101, origin: [1, 0],
    });

    GameUI.labelText(this, hudX + hudW - 14, hudY + 34, 'SCORE', {
      size: '11px', depth: 101, origin: [1, 0],
    });

    this.killsText = GameUI.labelText(this, hudX + hudW - 14, hudY + 48, 'Kills 0', {
      size: '12px', depth: 101, origin: [1, 0],
    });

    const barX = hudX + 14;
    const barY = hudY + hudH + 6;
    const barW = hudW - 28;
    this.xpBarBg = this.add.graphics().setDepth(101).setScrollFactor(0);
    this.xpBarFill = this.add.graphics().setDepth(102).setScrollFactor(0);
    this.xpBarBounds = { x: barX, y: barY, w: barW, h: 8 };
    this.drawXpBar();
  }

  drawXpBar() {
    const { x, y, w, h } = this.xpBarBounds;
    const rs = this.runState;
    const ratio = rs.xpToNext > 0 ? Phaser.Math.Clamp(rs.xp / rs.xpToNext, 0, 1) : 0;

    this.xpBarBg.clear();
    GameUI.drawProgressBar(this.xpBarBg, x, y, w, h, 0);

    this.xpBarFill.clear();
    if (ratio > 0) {
      GameUI.drawProgressBar(this.xpBarFill, x, y, w, h, ratio);
    }
  }

  updateXpHud() {
    this.levelText.setText(`Level ${this.runState.level}`);
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
      if (this.gameOver) return;
      if (this.levelUpActive) return;
      if (this.pauseActive) {
        this.closePause();
        return;
      }
      this.openPause();
    };
    this.input.keyboard.on('keydown-ESC', this.escHandler);
  }

  openPause() {
    if (this.pauseActive || this.levelUpActive || this.gameOver) return;
    this.pauseActive = true;
    this.runState.isPaused = true;
    this.physics.pause();
    this.pauseMenu = new PauseMenu(this, () => this.closePause());
  }

  closePause() {
    this.pauseMenu?.destroy();
    this.pauseMenu = null;
    this.pauseActive = false;
    this.runState.isPaused = false;
    if (!this.gameOver && !this.levelUpActive) {
      this.physics.resume();
    }
  }

  showMilestoneToast(message) {
    const { width, height } = this.scale;
    const txt = GameUI.headingText(this, width / 2, height * 0.2, message, {
      size: '18px', color: UI.textGold, depth: 150, origin: 0.5,
    }).setAlpha(0);

    this.tweens.add({
      targets: txt,
      alpha: 1,
      y: height * 0.18,
      duration: 350,
      ease: 'Cubic.easeOut',
    });

    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: txt,
        alpha: 0,
        duration: 400,
        onComplete: () => txt.destroy(),
      });
    });
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

    const choices = pickLevelUpChoices(this.runState);
    if (choices.stats.length === 0 && choices.weapons.length === 0) {
      this.runState.pendingLevelUps = 0;
      this.finishLevelUp();
      return;
    }

    this.upgradePicker = new UpgradePicker(this, choices, (upgradeId) => {
      if (upgradeId) {
        this.runState.recordUpgrade(upgradeId);
        applyUpgrade(this.player, upgradeId);
        this.updateXpHud();
        this.updateHearts();
        this.loadoutHud?.refresh();
      }
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
    const texture = opts.texture ?? 'proj_arcane';
    const proj = this.projectiles.create(x, y, texture);
    proj.setDepth(12).setScale(GAME.SPRITE_SCALE * (opts.scale ?? 1));
    if (opts.tint) proj.setTint(opts.tint);
    proj.damage = opts.damage ?? PLAYER_CFG.PROJECTILE_DAMAGE;
    proj.pierceRemaining = opts.pierce ?? 0;
    proj.prevX = x;
    proj.prevY = y;
    proj.body.setVelocity(dirX * 280, dirY * 280);
    Hitboxes.configureProjectile(proj);

    if (opts.trailColor) {
      proj.trail = this.time.addEvent({
        delay: 40,
        loop: true,
        callback: () => {
          if (!proj.active) {
            proj.trail?.remove();
            return;
          }
          const spark = this.add.image(proj.x, proj.y, 'particle')
            .setTint(opts.trailColor)
            .setScale(1.5)
            .setDepth(11)
            .setAlpha(0.85);
          this.tweens.add({
            targets: spark,
            alpha: 0,
            scale: 0.2,
            duration: 200,
            onComplete: () => spark.destroy(),
          });
        },
      });
    }

    this.time.delayedCall(1800, () => {
      if (proj.active) {
        proj.trail?.remove();
        proj.destroy();
      }
    });
  }

  onEnemyHit(x, y, damage, color) {
    this.cameras.main.shake(COMBAT.HIT_SHAKE_MS, COMBAT.HIT_SHAKE_INTENSITY);
    this.spawnHitParticles(x, y, color);
    this.spawnDamageNumber(x, y, damage);
  }

  spawnDamageNumber(x, y, damage) {
    const txt = GameUI.bodyText(this, x, y - 10, String(damage), {
      size: '14px',
      color: '#ffffff',
      depth: 20,
      origin: 0.5,
      stroke: 3,
    });

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
    this.scoreText.setText(String(this.runState.score).padStart(4, '0'));
    this.killsText.setText(`Kills ${this.runState.kills}`);
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

    GameUI.drawOverlay(this, 199, 0.55);

    const panelW = 380;
    const panelH = 280;
    const px = (width - panelW) / 2;
    const py = (height - panelH) / 2;

    GameUI.drawPanel(this, px, py, panelW, panelH, 200);

    GameUI.titleText(this, width / 2, py + 24, 'You Died', {
      size: '34px', color: '#f05068', depth: 201, origin: 0.5,
    });

    const rows = [
      { label: 'Time', value: rs.getFormattedTime() },
      { label: 'Level', value: String(rs.level) },
      { label: 'Score', value: String(rs.score).padStart(4, '0') },
      { label: 'Kills', value: String(rs.kills) },
    ];

    rows.forEach((row, i) => {
      const y = py + 88 + i * 32;
      GameUI.labelText(this, px + 40, y, row.label, {
        size: '14px', depth: 201,
      });
      GameUI.bodyText(this, px + panelW - 40, y, row.value, {
        size: '16px', color: UI.textGold, depth: 201, origin: [1, 0],
      });
    });

    const retry = GameUI.bodyText(this, width / 2, py + panelH - 52, '▶  Press R to Retry', {
      size: '16px', color: UI.textGold, depth: 201, origin: 0.5,
    }).setInteractive({ useHandCursor: true });

    retry.on('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-R', () => this.scene.restart());

    GameUI.labelText(this, width / 2, py + panelH - 24, 'ESC — Main Menu', {
      size: '14px', depth: 201, origin: 0.5,
    });
  }

  update(time, delta) {
    if (this.gameOver || !this.player?.sprite?.active) return;
    if (this.levelUpActive || this.pauseActive) return;

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
    this.spawnDirector.update(delta, this.runState.elapsedMs);
  }
}
