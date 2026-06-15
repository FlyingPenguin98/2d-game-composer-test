export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0a1020');

    // Ambient particles
    this.createAmbientParticles();

    // Parallax forest background layers
    this.createBackground(width, height);

    // Title
    const titleY = height * 0.28;
    this.add
      .text(width / 2, titleY, 'ELDERGROVE', {
        fontFamily: 'Georgia, serif',
        fontSize: '72px',
        color: '#f0e8d0',
        stroke: '#2a1840',
        strokeThickness: 6,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#000000',
          blur: 8,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(width / 2, titleY + 55, '— Chronicles of the Arcane —', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#d4a830',
        fontStyle: 'italic',
      })
      .setOrigin(0.5)
      .setDepth(20);

    // Decorative line
    const line = this.add.graphics().setDepth(20);
    line.lineStyle(2, 0xd4a830, 0.8);
    line.lineBetween(width / 2 - 180, titleY + 85, width / 2 + 180, titleY + 85);

    // Start button
    const btnY = height * 0.55;
    this.createButton(width / 2, btnY, 'Start New Game', () => {
      this.cameras.main.fadeOut(600, 10, 16, 32);
      this.time.delayedCall(600, () => {
        this.scene.start('GameScene');
      });
    });

    // Controls hint
    this.add
      .text(width / 2, height * 0.78, 'WASD / Arrow Keys to move  •  Auto-attack nearest foe', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#607090',
      })
      .setOrigin(0.5)
      .setDepth(20);

    // Floating mage preview
    this.createMagePreview(width / 2, height * 0.42);

    this.cameras.main.fadeIn(800, 10, 16, 32);
  }

  createBackground(width, height) {
    // Sky gradient via graphics
    const sky = this.add.graphics().setDepth(0);
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const r = Math.floor(10 + t * 15);
      const g = Math.floor(16 + t * 20);
      const b = Math.floor(32 + t * 30);
      sky.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      sky.fillRect(0, y, width, 1);
    }

    // Distant trees (silhouettes)
    const trees = this.add.graphics().setDepth(1);
    trees.fillStyle(0x0a1808, 0.8);
    for (let i = 0; i < 20; i++) {
      const tx = (i / 20) * width + Phaser.Math.Between(-30, 30);
      const th = Phaser.Math.Between(80, 160);
      const tw = Phaser.Math.Between(30, 60);
      trees.fillTriangle(tx, height * 0.65, tx - tw / 2, height * 0.65, tx, height * 0.65 - th);
      trees.fillTriangle(tx, height * 0.65, tx + tw / 2, height * 0.65, tx, height * 0.65 - th);
    }

    // Ground
    const ground = this.add.graphics().setDepth(2);
    ground.fillStyle(0x1a3018);
    ground.fillRect(0, height * 0.65, width, height * 0.35);

    // Fireflies / magic motes
    for (let i = 0; i < 30; i++) {
      const mote = this.add
        .circle(
          Phaser.Math.Between(0, width),
          Phaser.Math.Between(height * 0.3, height * 0.7),
          Phaser.Math.Between(1, 3),
          0x80c0ff,
          Phaser.Math.FloatBetween(0.3, 0.8)
        )
        .setDepth(3);

      this.tweens.add({
        targets: mote,
        x: mote.x + Phaser.Math.Between(-60, 60),
        y: mote.y + Phaser.Math.Between(-40, 40),
        alpha: { from: 0.2, to: 0.9 },
        duration: Phaser.Math.Between(2000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  createButton(x, y, label, onClick) {
    const container = this.add.container(x, y).setDepth(25);

    const bg = this.add.graphics();
    const drawBg = (hover) => {
      bg.clear();
      bg.fillStyle(hover ? 0x3a5090 : 0x2a3868, 1);
      bg.fillRoundedRect(-140, -28, 280, 56, 8);
      bg.lineStyle(2, hover ? 0xf0d060 : 0xd4a830, 1);
      bg.strokeRoundedRect(-140, -28, 280, 56, 8);
    };
    drawBg(false);

    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
        color: '#f0e8d0',
      })
      .setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(280, 56);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      drawBg(true);
      text.setColor('#ffffff');
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 150 });
    });

    container.on('pointerout', () => {
      drawBg(false);
      text.setColor('#f0e8d0');
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 150 });
    });

    container.on('pointerdown', onClick);

    // Pulse glow
    this.tweens.add({
      targets: container,
      alpha: { from: 0.85, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return container;
  }

  createMagePreview(x, y) {
    const mage = this.add.sprite(x, y, 'player').setDepth(15).setScale(2.5);
    this.tweens.add({
      targets: mage,
      y: y - 8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glow beneath mage
    const glow = this.add.image(x, y + 20, 'glow').setDepth(14).setScale(1.5).setAlpha(0.4);
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.3, to: 0.6 },
      scaleX: { from: 1.3, to: 1.7 },
      scaleY: { from: 1.3, to: 1.7 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
  }

  createAmbientParticles() {
    const particles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: this.scale.width },
      y: { min: 0, max: this.scale.height },
      scale: { min: 0.3, max: 0.8 },
      alpha: { min: 0.1, max: 0.4 },
      speed: { min: 5, max: 20 },
      angle: { min: 260, max: 280 },
      lifespan: 4000,
      frequency: 200,
      tint: [0x6090ff, 0xd4a830, 0x80ffa0],
      blendMode: 'ADD',
    });
    particles.setDepth(4);
  }
}
