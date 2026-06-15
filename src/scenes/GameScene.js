import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { WorldMap } from '../world/WorldMap.js';
import { WorldRenderer } from '../world/WorldRenderer.js';
import { RunState, getSpawnIntervalForTime } from '../services/RunState.js';
import { PAL } from '../utils/SnesPalettes.js';
import { SnesUI } from '../utils/SnesUI.js';
import { SceneTransition } from '../utils/SceneTransition.js';
import { AssetService } from '../services/AssetService.js';
import {
  PLAYER as PLAYER_CFG,
  WAVES,
  SCENES,
  WORLD,
  GAME,
  COMBAT,
  FONTS,
} from '../config/GameConfig.js';

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

    this.cameras.main.startFollow(this.player.sprite, true, WORLD.CAMERA_LERP, WORLD.CAMERA_LERP);
    this.cameras.main.setDeadzone(80, 60);

    for (let i = 0; i < WAVES.INITIAL_ENEMIES; i++) {
      Enemy.spawnOutsideCamera(this);
    }
  }

  createUI(width, _height) {
    SnesUI.drawWindow(this, 8, 8, width - 16, 36, 100);

    this.hearts = [];
    for (let i = 0; i < 10; i++) {
      const heart = this.add.image(24 + i * 18, 26, 'heart')
        .setScale(2).setDepth(101).setScrollFactor(0);
      this.hearts.push(heart);
    }

    this.timerText = SnesUI.snesText(this, width / 2, 16, '0:00', {
      size: '16px', color: PAL.uiGold, depth: 101,
    }).setOrigin(0.5, 0);

    SnesUI.snesText(this, width / 2, 32, 'ELDERGROVE', {
      size: '9px', color: PAL.uiTextDim, depth: 101,
    }).setOrigin(0.5, 0);

    this.scoreText = SnesUI.snesText(this, width - 24, 18, 'SCORE 0000', {
      size: '14px', color: PAL.uiGold, depth: 101,
    }).setOrigin(1, 0);

    this.killsText = SnesUI.snesText(this, width - 24, 34, 'KILLS 0', {
      size: '10px', color: PAL.uiTextDim, depth: 101,
    }).setOrigin(1, 0);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey('W'),
      A: this.input.keyboard.addKey('A'),
      S: this.input.keyboard.addKey('S'),
      D: this.input.keyboard.addKey('D'),
    };

    this.escHandler = () => SceneTransition.toMenu(this);
    this.input.keyboard.on('keydown-ESC', this.escHandler);
  }

  setupCollisions() {
    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemySprite) => {
      if (!proj.active || !enemySprite.active) return;
      const hx = proj.x;
      const hy = proj.y;
      const dmg = proj.damage ?? PLAYER_CFG.PROJECTILE_DAMAGE;
      proj.destroy();
      enemySprite.enemyRef?.takeDamage(dmg, hx, hy);
    });

    this.physics.add.overlap(this.player.sprite, this.enemies, (_p, enemySprite) => {
      if (!enemySprite.active || this.player.invincible) return;
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

  fireProjectile(x, y, dirX, dirY) {
    const proj = this.projectiles.create(x, y, 'projectile');
    proj.setDepth(12).setScale(GAME.SPRITE_SCALE);
    proj.damage = PLAYER_CFG.PROJECTILE_DAMAGE;
    proj.body.setVelocity(dirX * 280, dirY * 280);
    proj.body.setSize(8, 8);

    this.time.delayedCall(1800, () => { if (proj.active) proj.destroy(); });
  }

  /** Phase 4 — hit feedback: particles, damage number, micro shake. */
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
    const filled = Math.ceil(this.player.health / 10);
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setTexture(i < filled ? 'heart' : 'heart_empty');
    }
  }

  updateTimerHud() {
    this.timerText.setText(this.runState.getFormattedTime());
  }

  handleGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.runState.endDefeat();
    this.physics.pause();

    const { width, height } = this.scale;
    const rs = this.runState;

    SnesUI.drawWindow(this, width / 2 - 170, height / 2 - 95, 340, 190, 200);

    SnesUI.snesText(this, width / 2, height / 2 - 70, 'YOU DIED', {
      size: '24px', color: PAL.boneEye, depth: 201,
    }).setOrigin(0.5);

    SnesUI.snesText(this, width / 2, height / 2 - 35, `TIME  ${rs.getFormattedTime()}`, {
      size: '14px', color: PAL.uiGold, depth: 201,
    }).setOrigin(0.5);

    SnesUI.snesText(this, width / 2, height / 2 - 10, `SCORE ${String(rs.score).padStart(4, '0')}`, {
      size: '14px', depth: 201,
    }).setOrigin(0.5);

    SnesUI.snesText(this, width / 2, height / 2 + 15, `KILLS ${rs.kills}`, {
      size: '14px', depth: 201,
    }).setOrigin(0.5);

    const retry = SnesUI.snesText(this, width / 2, height / 2 + 50, '▶ Press R to Retry', {
      size: '14px', color: PAL.uiGold, depth: 201,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retry.on('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-R', () => this.scene.restart());

    SnesUI.snesText(this, width / 2, height / 2 + 75, 'ESC — Main Menu', {
      size: '12px', color: PAL.uiTextDim, depth: 201,
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver || !this.player?.sprite?.active) return;

    this.runState.update(delta);
    this.updateTimerHud();

    this.player.update(time, this.cursors, this.wasd);
    this.updateHearts();

    for (const enemySprite of this.enemies.getChildren()) {
      if (enemySprite.active && enemySprite.enemyRef) {
        enemySprite.enemyRef.update(time, this.player.sprite.x, this.player.sprite.y);
      }
    }

    const spawnInterval = getSpawnIntervalForTime(this.runState.elapsedMs);
    this.spawnTimer += delta;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      Enemy.spawnOutsideCamera(this);
    }
  }
}
