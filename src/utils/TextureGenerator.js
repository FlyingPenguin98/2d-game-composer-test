/**
 * Procedural pixel-art texture generator for HD-2D style sprites and tiles.
 */
export class TextureGenerator {
  static generateAll(scene) {
    this.generateTiles(scene);
    this.generatePlayer(scene);
    this.generateEnemies(scene);
    this.generateProjectiles(scene);
    this.generateParticles(scene);
    this.generateUI(scene);
  }

  static drawPixel(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
  }

  static generateTiles(scene) {
    const size = 32;
    const canvas = document.createElement('canvas');
    canvas.width = size * 4;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');

    // Grass tile
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 4; x++) {
        const base = (x + y) % 2 === 0 ? '#2d5a27' : '#347030';
        ctx.fillStyle = base;
        ctx.fillRect(x * size, y * size, size, size);
        // Grass blades
        for (let i = 0; i < 8; i++) {
          const gx = x * size + Math.random() * size;
          const gy = y * size + Math.random() * size;
          ctx.fillStyle = Math.random() > 0.5 ? '#4a9a3a' : '#3d7a32';
          ctx.fillRect(gx, gy, 2, 4);
        }
        // Flowers
        if (Math.random() > 0.85) {
          ctx.fillStyle = ['#e8a0bf', '#f0d060', '#a080e0'][Math.floor(Math.random() * 3)];
          ctx.fillRect(x * size + 10, y * size + 12, 4, 4);
        }
      }
    }

    // Dark grass / path
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#1a3018' : '#223820';
        ctx.fillRect((x + 2) * size, y * size, size, size);
      }
    }

    // Stone path tile
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        ctx.fillStyle = '#4a4a55';
        ctx.fillRect(x * size, (y + 2) * size, size, size);
        ctx.fillStyle = '#5a5a68';
        ctx.fillRect(x * size + 4, (y + 2) * size + 4, size - 8, size - 8);
        ctx.fillStyle = '#3a3a45';
        ctx.fillRect(x * size + 8, (y + 2) * size + 8, 6, 6);
      }
    }

    scene.textures.addCanvas('tiles', canvas);
  }

  static generatePlayer(scene) {
    const p = 4;
    const w = 16;
    const h = 20;
    const canvas = document.createElement('canvas');
    canvas.width = w * p;
    canvas.height = h * p;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const palette = {
      skin: '#f0c8a0',
      hair: '#3a2010',
      robe: '#2a4080',
      robeLight: '#4a68b0',
      robeDark: '#1a2860',
      gold: '#d4a830',
      staff: '#6a4030',
      staffGlow: '#80c0ff',
    };

    // Shadow blob
    for (let x = 4; x < 12; x++) {
      this.drawPixel(ctx, x, 18, p, 'rgba(0,0,0,0.3)');
    }

    // Robe body
    for (let y = 10; y < 17; y++) {
      for (let x = 5; x < 11; x++) {
        const c = y < 13 ? palette.robeLight : palette.robe;
        this.drawPixel(ctx, x, y, p, c);
      }
    }
    // Robe dark edges
    for (let y = 10; y < 17; y++) {
      this.drawPixel(ctx, 5, y, p, palette.robeDark);
      this.drawPixel(ctx, 10, y, p, palette.robeDark);
    }

    // Head
    for (let y = 4; y < 10; y++) {
      for (let x = 6; x < 10; x++) {
        this.drawPixel(ctx, x, y, p, palette.skin);
      }
    }

    // Hair
    for (let x = 5; x < 11; x++) this.drawPixel(ctx, x, 3, p, palette.hair);
    for (let x = 5; x < 11; x++) this.drawPixel(ctx, x, 4, p, palette.hair);
    this.drawPixel(ctx, 5, 5, p, palette.hair);
    this.drawPixel(ctx, 10, 5, p, palette.hair);

    // Eyes
    this.drawPixel(ctx, 7, 6, p, '#201010');
    this.drawPixel(ctx, 9, 6, p, '#201010');

    // Staff
    for (let y = 2; y < 16; y++) this.drawPixel(ctx, 12, y, p, palette.staff);
    // Staff orb
    for (let y = 0; y < 3; y++) {
      for (let x = 11; x < 14; x++) {
        this.drawPixel(ctx, x, y, p, palette.staffGlow);
      }
    }
    this.drawPixel(ctx, 12, 1, p, '#ffffff');

    // Gold trim
    for (let x = 5; x < 11; x++) this.drawPixel(ctx, x, 10, p, palette.gold);

    scene.textures.addCanvas('player', canvas);
  }

  static generateEnemies(scene) {
    this.generateSlime(scene);
    this.generateSkeleton(scene);
    this.generateWisp(scene);
  }

  static generateSlime(scene) {
    const p = 4;
    const w = 14;
    const h = 12;
    const canvas = document.createElement('canvas');
    canvas.width = w * p;
    canvas.height = h * p;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const colors = ['#40c060', '#30a050', '#208040'];

    // Body blob
    for (let y = 4; y < 10; y++) {
      const width = y < 6 ? 6 : y < 8 ? 8 : 10;
      const startX = 7 - Math.floor(width / 2);
      for (let x = startX; x < startX + width; x++) {
        const c = colors[(x + y) % 3];
        this.drawPixel(ctx, x, y, p, c);
      }
    }
    // Highlight
    this.drawPixel(ctx, 5, 5, p, '#80ffa0');
    this.drawPixel(ctx, 6, 4, p, '#80ffa0');
    // Eyes
    this.drawPixel(ctx, 5, 6, p, '#101010');
    this.drawPixel(ctx, 8, 6, p, '#101010');
    this.drawPixel(ctx, 5, 7, p, '#ffffff');
    this.drawPixel(ctx, 8, 7, p, '#ffffff');

    scene.textures.addCanvas('enemy_slime', canvas);
  }

  static generateSkeleton(scene) {
    const p = 4;
    const w = 14;
    const h = 18;
    const canvas = document.createElement('canvas');
    canvas.width = w * p;
    canvas.height = h * p;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const bone = '#d8d0c0';
    const boneDark = '#a09888';
    const glow = '#8040c0';

    // Skull
    for (let y = 2; y < 7; y++) {
      for (let x = 5; x < 10; x++) {
        this.drawPixel(ctx, x, y, p, bone);
      }
    }
    // Eye sockets
    this.drawPixel(ctx, 6, 4, p, '#101010');
    this.drawPixel(ctx, 8, 4, p, '#101010');
    this.drawPixel(ctx, 6, 4, p, glow);
    this.drawPixel(ctx, 8, 4, p, glow);
    // Ribs
    for (let y = 7; y < 13; y++) {
      this.drawPixel(ctx, 7, y, p, bone);
      if (y % 2 === 0) {
        this.drawPixel(ctx, 5, y, p, bone);
        this.drawPixel(ctx, 9, y, p, bone);
      }
    }
    // Arms
    for (let x = 3; x < 6; x++) this.drawPixel(ctx, x, 8, p, bone);
    for (let x = 9; x < 12; x++) this.drawPixel(ctx, x, 8, p, bone);
    // Legs
    this.drawPixel(ctx, 6, 13, p, boneDark);
    this.drawPixel(ctx, 8, 13, p, boneDark);
    this.drawPixel(ctx, 6, 14, p, bone);
    this.drawPixel(ctx, 8, 14, p, bone);

    scene.textures.addCanvas('enemy_skeleton', canvas);
  }

  static generateWisp(scene) {
    const p = 4;
    const w = 12;
    const h = 14;
    const canvas = document.createElement('canvas');
    canvas.width = w * p;
    canvas.height = h * p;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const colors = ['#ff6040', '#ff8040', '#ffa060', '#ffc080'];

    // Ethereal body
    for (let y = 2; y < 12; y++) {
      const width = 4 + Math.floor(Math.sin(y * 0.8) * 2 + 2);
      const startX = 6 - Math.floor(width / 2);
      for (let x = startX; x < startX + width; x++) {
        this.drawPixel(ctx, x, y, p, colors[(x + y) % 4]);
      }
    }
    // Core
    for (let y = 5; y < 8; y++) {
      for (let x = 4; x < 8; x++) {
        this.drawPixel(ctx, x, y, p, '#ffffa0');
      }
    }
    this.drawPixel(ctx, 5, 6, p, '#ffffff');
    this.drawPixel(ctx, 6, 6, p, '#ffffff');

    scene.textures.addCanvas('enemy_wisp', canvas);
  }

  static generateProjectiles(scene) {
    const p = 4;
    const canvas = document.createElement('canvas');
    canvas.width = 8 * p;
    canvas.height = 8 * p;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let y = 1; y < 7; y++) {
      for (let x = 1; x < 7; x++) {
        const dist = Math.sqrt((x - 4) ** 2 + (y - 4) ** 2);
        if (dist < 3) {
          const c = dist < 1.5 ? '#ffffff' : dist < 2.5 ? '#80d0ff' : '#4080ff';
          this.drawPixel(ctx, x, y, p, c);
        }
      }
    }

    scene.textures.addCanvas('projectile', canvas);
  }

  static generateParticles(scene) {
    const p = 2;
    const canvas = document.createElement('canvas');
    canvas.width = 4 * p;
    canvas.height = 4 * p;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(p, p, 2 * p, 2 * p);
    scene.textures.addCanvas('particle', canvas);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 64;
    glowCanvas.height = 64;
    const gctx = glowCanvas.getContext('2d');
    const grad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.3, 'rgba(100,180,255,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 64, 64);
    scene.textures.addCanvas('glow', glowCanvas);
  }

  static generateUI(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Title banner background
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, 'rgba(20,30,60,0)');
    grad.addColorStop(0.2, 'rgba(30,50,90,0.9)');
    grad.addColorStop(0.5, 'rgba(40,60,110,0.95)');
    grad.addColorStop(0.8, 'rgba(30,50,90,0.9)');
    grad.addColorStop(1, 'rgba(20,30,60,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 8, 256, 48);

    ctx.strokeStyle = '#d4a830';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 12, 224, 40);

    scene.textures.addCanvas('ui_banner', canvas);
  }
}
