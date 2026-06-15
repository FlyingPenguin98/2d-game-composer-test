import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.score = 0;
    this.enemiesKilled = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2500;
    this.gameOver = false;

    // Enable lighting pipeline for HD-2D effect
    this.lights.enable().setAmbientColor(0x304060);

    this.createWorld(width, height);
    this.createPlayer(width, height);
    this.createUI(width, height);
    this.setupInput();
    this.setupCollisions();

    this.cameras.main.fadeIn(600, 10, 16, 32);

    this.events.on('playerDied', () => this.handleGameOver());
  }

  createWorld(width, height) {
    // Tilemap from generated texture
    const tileSize = 32;
    const cols = Math.ceil(width / tileSize) + 2;
    const rows = Math.ceil(height / tileSize) + 2;

    this.groundLayer = this.add.group();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * tileSize;
        const y = row * tileSize;

        // Mix grass and path tiles
        const isPath =
          (col > 2 && col < cols - 3 && row > 2 && row < rows - 3) &&
          (col === Math.floor(cols / 2) || row === Math.floor(rows / 2));

        const frame = isPath ? 4 : Phaser.Math.Between(0, 3);
        const tile = this.add
          .image(x, y, 'tiles')
          .setOrigin(0, 0)
          .setCrop(
            (frame % 4) * tileSize,
            Math.floor(frame / 4) * tileSize,
            tileSize,
            tileSize
          )
          .setDepth(0);

        this.groundLayer.add(tile);
      }
    }

    // Decorative trees around edges
    for (let i = 0; i < 12; i++) {
      this.createTree(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(20, 60)
      );
    }
    for (let i = 0; i < 8; i++) {
      this.createTree(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(height - 60, height - 20)
      );
    }

    // Ambient light sources (lanterns / mushrooms)
    const lanternPositions = [
      [width * 0.15, height * 0.2],
      [width * 0.85, height * 0.2],
      [width * 0.15, height * 0.8],
      [width * 0.85, height * 0.8],
    ];
    for (const [lx, ly] of lanternPositions) {
      this.lights.addLight(lx, ly, 100, 0xffa040, 0.4);
      const lantern = this.add.circle(lx, ly, 6, 0xff8040, 0.8).setDepth(6);
      this.tweens.add({
        targets: lantern,
        alpha: { from: 0.6, to: 1 },
        duration: Phaser.Math.Between(800, 1500),
        yoyo: true,
        repeat: -1,
      });
    }

    // Floating particles
    this.ambientParticles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      scale: { min: 0.2, max: 0.6 },
      alpha: { min: 0.05, max: 0.25 },
      speed: { min: 3, max: 12 },
      lifespan: 6000,
      frequency: 300,
      tint: [0x6090ff, 0x80ffa0],
      blendMode: 'ADD',
    });
    this.ambientParticles.setDepth(3);
  }

  createTree(x, y) {
    const tree = this.add.container(x, y).setDepth(7);

    const trunk = this.add.rectangle(0, 10, 10, 24, 0x4a3020);
    const foliage1 = this.add.triangle(0, -20, -28, 10, 28, 10, 0, -40, 0x1a5020);
    const foliage2 = this.add.triangle(0, -8, -22, 8, 22, 8, 0, -28, 0x2a6830);

    tree.add([trunk, foliage1, foliage2]);
    return tree;
  }

  createPlayer(width, height) {
    this.player = new Player(this, width / 2, height / 2);

    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();

    // Spawn initial enemies
    for (let i = 0; i < 3; i++) {
      Enemy.spawnAtEdge(this, width / 2, height / 2);
    }
  }

  createUI(width, height) {
    // Health bar
    this.healthBarBg = this.add
      .rectangle(20, 20, 204, 20, 0x1a2040, 0.8)
      .setOrigin(0, 0)
      .setDepth(100)
      .setScrollFactor(0);

    this.healthBar = this.add
      .rectangle(22, 22, 200, 16, 0x40c060)
      .setOrigin(0, 0)
      .setDepth(101)
      .setScrollFactor(0);

    this.add
      .text(22, 44, 'HP', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#80a0c0',
      })
      .setDepth(101)
      .setScrollFactor(0);

    // Score
    this.scoreText = this.add
      .text(width - 20, 20, 'Score: 0', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#f0e8d0',
        stroke: '#1a1020',
        strokeThickness: 3,
      })
      .setOrigin(1, 0)
      .setDepth(101)
      .setScrollFactor(0);

    // Wave info
    this.waveText = this.add
      .text(width / 2, 20, 'Defend the Grove', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#d4a830',
      })
      .setOrigin(0.5, 0)
      .setDepth(101)
      .setScrollFactor(0);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey('W'),
      A: this.input.keyboard.addKey('A'),
      S: this.input.keyboard.addKey('S'),
      D: this.input.keyboard.addKey('D'),
    };
    this.escKey = this.input.keyboard.addKey('ESC');
    this.escKey.on('down', () => {
      this.scene.start('MainMenuScene');
    });
  }

  setupCollisions() {
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (projectile, enemySprite) => {
        if (!projectile.active || !enemySprite.active) return;
        projectile.destroy();
        if (enemySprite.enemyRef) {
          enemySprite.enemyRef.takeDamage(projectile.damage || 25);
        }
      }
    );

    this.physics.add.overlap(
      this.player.sprite,
      this.enemies,
      (_player, enemySprite) => {
        if (!enemySprite.active || this.player.invincible) return;
        const config = enemySprite.enemyRef?.config;
        if (config) {
          this.player.takeDamage(config.damage);
          this.player.invincible = true;
          this.time.delayedCall(800, () => {
            this.player.invincible = false;
          });
        }
      }
    );
  }

  fireProjectile(x, y, dirX, dirY) {
    const proj = this.projectiles.create(x, y, 'projectile');
    proj.setDepth(12);
    proj.setScale(0.8);
    proj.damage = 25;

    const speed = 400;
    proj.body.setVelocity(dirX * speed, dirY * speed);
    proj.body.setSize(20, 20);

    // Trail particles
    const trail = this.add.particles(x, y, 'particle', {
      speed: { min: 10, max: 30 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 300,
      tint: 0x6090ff,
      blendMode: 'ADD',
      emitting: false,
    });
    trail.setDepth(11);
    trail.startFollow(proj);

    proj.trail = trail;

    // Auto destroy after 2 seconds
    this.time.delayedCall(2000, () => {
      if (proj.active) {
        proj.trail?.destroy();
        proj.destroy();
      }
    });
  }

  spawnHitParticles(x, y, color) {
    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 40, max: 100 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 6,
      tint: color,
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.setDepth(15);
    emitter.explode(6);
    this.time.delayedCall(500, () => emitter.destroy());
  }

  spawnDeathParticles(x, y, color) {
    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 60, max: 150 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 12,
      tint: color,
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.setDepth(15);
    emitter.explode(12);
    this.time.delayedCall(700, () => emitter.destroy());
  }

  addScore(points) {
    this.score += points;
    this.enemiesKilled += 1;
    this.scoreText.setText(`Score: ${this.score}`);

    // Increase difficulty
    if (this.enemiesKilled % 5 === 0) {
      this.spawnInterval = Math.max(800, this.spawnInterval - 200);
      this.waveText.setText(`Wave intensifies! (${this.enemiesKilled} slain)`);
    }
  }

  handleGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;

    const { width, height } = this.scale;

    this.physics.pause();

    const overlay = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
      .setDepth(200)
      .setScrollFactor(0);

    this.add
      .text(width / 2, height / 2 - 40, 'You Have Fallen', {
        fontFamily: 'Georgia, serif',
        fontSize: '48px',
        color: '#ff6040',
        stroke: '#1a0810',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setScrollFactor(0);

    this.add
      .text(width / 2, height / 2 + 20, `Final Score: ${this.score}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
        color: '#f0e8d0',
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setScrollFactor(0);

    const restartBtn = this.add
      .text(width / 2, height / 2 + 80, '[ Press R to Retry ]', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#d4a830',
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    restartBtn.on('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-R', () => this.scene.restart());

    const menuBtn = this.add
      .text(width / 2, height / 2 + 120, '[ ESC for Main Menu ]', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#607090',
      })
      .setOrigin(0.5)
      .setDepth(201)
      .setScrollFactor(0);
  }

  update(time, delta) {
    if (this.gameOver) return;

    this.player.update(time, this.cursors, this.wasd);

    // Update health bar
    const hpRatio = this.player.health / this.player.maxHealth;
    this.healthBar.width = 200 * hpRatio;
    const hpColor = hpRatio > 0.5 ? 0x40c060 : hpRatio > 0.25 ? 0xf0a040 : 0xff4040;
    this.healthBar.setFillStyle(hpColor);

    // Update enemies
    const enemyChildren = this.enemies.getChildren();
    for (const enemySprite of enemyChildren) {
      if (enemySprite.active && enemySprite.enemyRef) {
        enemySprite.enemyRef.update(time, this.player.sprite.x, this.player.sprite.y);
      }
    }

    // Spawn new enemies
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      Enemy.spawnAtEdge(this, this.player.sprite.x, this.player.sprite.y);
    }
  }
}
