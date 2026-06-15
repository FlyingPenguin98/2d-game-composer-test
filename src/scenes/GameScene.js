import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { PAL, TILE, SPRITE_SCALE } from '../utils/SnesPalettes.js';
import { SnesUI } from '../utils/SnesUI.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.score = 0;
    this.enemiesKilled = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2800;
    this.gameOver = false;

    this.cameras.main.setBackgroundColor(PAL.grassDark);

    Enemy.registerAnims(this);
    this.createWorld(width, height);
    this.createPlayer(width, height);
    this.createUI(width, height);
    this.setupInput();
    this.setupCollisions();

    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.events.on('playerDied', () => this.handleGameOver());
  }

  createWorld(width, height) {
    const displayTile = TILE * SPRITE_SCALE;
    const cols = Math.ceil(width / displayTile) + 1;
    const rows = Math.ceil(height / displayTile) + 1;

    // Deterministic tile map — SNES games never use random tiles
    const map = [];
    for (let row = 0; row < rows; row++) {
      map[row] = [];
      for (let col = 0; col < cols; col++) {
        map[row][col] = this.pickTile(col, row, cols, rows);
      }
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileIdx = map[row][col];
        const tx = (tileIdx % 8) * TILE;
        const ty = Math.floor(tileIdx / 8) * TILE;

        this.add.image(col * displayTile, row * displayTile, 'tileset')
          .setOrigin(0, 0)
          .setDisplaySize(displayTile, displayTile)
          .setDepth(0)
          .setCrop(tx, ty, TILE, TILE);
      }
    }

    // Place tree clusters at fixed positions
    const treeSpots = [
      [2, 2], [4, 1], [cols - 3, 2], [cols - 5, 1],
      [2, rows - 3], [5, rows - 2], [cols - 3, rows - 3],
    ];
    for (const [tc, tr] of treeSpots) {
      if (tc >= 1 && tr >= 1 && tc < cols - 1 && tr < rows - 1) {
        this.placeTree(tc, tr, displayTile);
      }
    }
  }

  pickTile(col, row, cols, rows) {
    // Border: darker grass
    if (col === 0 || row === 0 || col === cols - 1 || row === rows - 1) return 3;
    // Center cross path
    const midC = Math.floor(cols / 2);
    const midR = Math.floor(rows / 2);
    if (col === midC || row === midR) return 15;
    // Flower patches
    if ((col + row) % 7 === 0) return 2;
    // Checkerboard grass
    return (col + row) % 2 === 0 ? 0 : 1;
  }

  placeTree(col, row, displayTile) {
    const x = col * displayTile;
    const y = row * displayTile;
    const canopy = 12; // tile index for full canopy
    const trunk = 6;

    this.add.image(x, y, 'tileset')
      .setOrigin(0, 0).setDisplaySize(displayTile, displayTile)
      .setDepth(6).setCrop((canopy % 8) * TILE, Math.floor(canopy / 8) * TILE, TILE, TILE);
    this.add.image(x, y + displayTile, 'tileset')
      .setOrigin(0, 0).setDisplaySize(displayTile, displayTile)
      .setDepth(5).setCrop((trunk % 8) * TILE, Math.floor(trunk / 8) * TILE, TILE, TILE);
  }

  createPlayer(width, height) {
    this.player = new Player(this, width / 2, height / 2);
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();

    for (let i = 0; i < 3; i++) {
      Enemy.spawnAtEdge(this, width / 2, height / 2);
    }
  }

  createUI(width, _height) {
    // SNES HUD bar at top
    SnesUI.drawWindow(this, 8, 8, width - 16, 36, 100);

    // Heart containers (10 HP each, 10 hearts = 100 HP)
    this.hearts = [];
    for (let i = 0; i < 10; i++) {
      const heart = this.add.image(24 + i * 18, 26, 'heart')
        .setScale(2)
        .setDepth(101)
        .setScrollFactor(0);
      this.hearts.push(heart);
    }

    this.scoreText = SnesUI.snesText(this, width - 24, 18, 'SCORE 0000', {
      size: '14px',
      color: PAL.uiGold,
      depth: 101,
    }).setOrigin(1, 0);

    this.waveText = SnesUI.snesText(this, width / 2, 18, 'DEFEND THE GROVE', {
      size: '12px',
      color: PAL.uiTextDim,
      depth: 101,
    }).setOrigin(0.5, 0);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey('W'),
      A: this.input.keyboard.addKey('A'),
      S: this.input.keyboard.addKey('S'),
      D: this.input.keyboard.addKey('D'),
    };
    this.input.keyboard.addKey('ESC').on('down', () => {
      this.scene.start('MainMenuScene');
    });
  }

  setupCollisions() {
    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemySprite) => {
      if (!proj.active || !enemySprite.active) return;
      proj.destroy();
      enemySprite.enemyRef?.takeDamage(proj.damage || 25);
    });

    this.physics.add.overlap(this.player.sprite, this.enemies, (_p, enemySprite) => {
      if (!enemySprite.active || this.player.invincible) return;
      const cfg = enemySprite.enemyRef?.config;
      if (cfg) {
        this.player.takeDamage(cfg.damage);
        this.player.invincible = true;
        this.time.delayedCall(900, () => { this.player.invincible = false; });
      }
    });
  }

  fireProjectile(x, y, dirX, dirY) {
    const proj = this.projectiles.create(x, y, 'projectile');
    proj.setDepth(12).setScale(SPRITE_SCALE);
    proj.damage = 25;
    proj.body.setVelocity(dirX * 280, dirY * 280);
    proj.body.setSize(8, 8);

    this.time.delayedCall(1800, () => { if (proj.active) proj.destroy(); });
  }

  spawnHitParticles(x, y, color) {
    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 30, max: 70 },
      scale: { start: 2, end: 0 },
      lifespan: 250,
      quantity: 4,
      tint: color,
      emitting: false,
    });
    emitter.setDepth(15);
    emitter.explode(4);
    this.time.delayedCall(300, () => emitter.destroy());
  }

  spawnDeathParticles(x, y, color) {
    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 40, max: 90 },
      scale: { start: 2, end: 0 },
      lifespan: 350,
      quantity: 8,
      tint: color,
      emitting: false,
    });
    emitter.setDepth(15);
    emitter.explode(8);
    this.time.delayedCall(400, () => emitter.destroy());
  }

  addScore(points) {
    this.score += points;
    this.enemiesKilled += 1;
    this.scoreText.setText(`SCORE ${String(this.score).padStart(4, '0')}`);

    if (this.enemiesKilled % 5 === 0) {
      this.spawnInterval = Math.max(900, this.spawnInterval - 150);
      this.waveText.setText(`WAVE ${Math.floor(this.enemiesKilled / 5) + 1}`);
    }
  }

  updateHearts() {
    const filled = Math.ceil(this.player.health / 10);
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setTexture(i < filled ? 'heart' : 'heart_empty');
    }
  }

  handleGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();

    const { width, height } = this.scale;

    SnesUI.drawWindow(this, width / 2 - 160, height / 2 - 80, 320, 160, 200);

    SnesUI.snesText(this, width / 2, height / 2 - 50, 'YOU DIED', {
      size: '24px',
      color: PAL.boneEye,
      depth: 201,
    }).setOrigin(0.5);

    SnesUI.snesText(this, width / 2, height / 2 - 10, `SCORE ${String(this.score).padStart(4, '0')}`, {
      size: '16px',
      depth: 201,
    }).setOrigin(0.5);

    const retry = SnesUI.snesText(this, width / 2, height / 2 + 30, '▶ Press R to Retry', {
      size: '14px',
      color: PAL.uiGold,
      depth: 201,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retry.on('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-R', () => this.scene.restart());

    SnesUI.snesText(this, width / 2, height / 2 + 55, 'ESC — Main Menu', {
      size: '12px',
      color: PAL.uiTextDim,
      depth: 201,
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) return;

    this.player.update(time, this.cursors, this.wasd);
    this.updateHearts();

    for (const enemySprite of this.enemies.getChildren()) {
      if (enemySprite.active && enemySprite.enemyRef) {
        enemySprite.enemyRef.update(time, this.player.sprite.x, this.player.sprite.y);
      }
    }

    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      Enemy.spawnAtEdge(this, this.player.sprite.x, this.player.sprite.y);
    }
  }
}
