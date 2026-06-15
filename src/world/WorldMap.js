import { GAME } from '../config/GameConfig.js';

/** Tile indices matching TextureGenerator tileset frames `tile_0` … `tile_15`. */
export const TILE = {
  GRASS_A: 0,
  GRASS_B: 1,
  GRASS_FLOWERS: 2,
  GRASS_DARK: 3,
  DIRT: 4,
  STONE: 5,
  TRUNK: 6,
  BUSH: 7,
  CANOPY_NW: 8,
  CANOPY_NE: 9,
  CANOPY_SW: 10,
  CANOPY_SE: 11,
  CANOPY: 12,
  WATER_A: 13,
  WATER_B: 14,
  PATH: 15,
};

/** Tiles that block player movement. */
export const BLOCKING_TILES = new Set([
  TILE.STONE,
  TILE.TRUNK,
  TILE.BUSH,
  TILE.CANOPY,
  TILE.CANOPY_NW,
  TILE.CANOPY_NE,
  TILE.CANOPY_SW,
  TILE.CANOPY_SE,
  TILE.WATER_A,
  TILE.WATER_B,
]);

/** Deterministic hash for procedural placement. */
function hash(x, y) {
  return ((x * 73856093) ^ (y * 19349663)) >>> 0;
}

function hashChance(x, y, percent) {
  return (hash(x, y) % 100) < percent;
}

/**
 * Fixed 2D tile grid for the Eldergrove overworld.
 * 3×3 screens — deterministic layout with paths, forest, pond, and collision.
 */
export class WorldMap {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.displayTile = GAME.TILE * GAME.SPRITE_SCALE;
    this.tiles = new Uint8Array(cols * rows);
    this.spawnCol = Math.floor(cols / 2);
    this.spawnRow = Math.floor(rows / 2);
    this._generate();
  }

  get widthPx() {
    return this.cols * this.displayTile;
  }

  get heightPx() {
    return this.rows * this.displayTile;
  }

  idx(col, row) {
    return row * this.cols + col;
  }

  inBounds(col, row) {
    return col >= 0 && row >= 0 && col < this.cols && row < this.rows;
  }

  getTile(col, row) {
    if (!this.inBounds(col, row)) return TILE.WATER_A;
    return this.tiles[this.idx(col, row)];
  }

  setTile(col, row, tileId) {
    if (this.inBounds(col, row)) {
      this.tiles[this.idx(col, row)] = tileId;
    }
  }

  isBlocked(col, row) {
    return BLOCKING_TILES.has(this.getTile(col, row));
  }

  isBlockedWorld(px, py) {
    const col = Math.floor(px / this.displayTile);
    const row = Math.floor(py / this.displayTile);
    return this.isBlocked(col, row);
  }

  /** Check a small footprint (player hitbox corners). */
  isBlockedFootprint(px, py, halfW = 8, halfH = 6) {
    const points = [
      [px - halfW, py],
      [px + halfW, py],
      [px, py - halfH],
      [px, py + halfH],
    ];
    return points.some(([x, y]) => this.isBlockedWorld(x, y));
  }

  /**
   * Per-tile collision shape in local display-tile space (0–displayTile).
   * Narrower than full tiles so movement matches visible art.
   */
  getTileCollider(tileId) {
    const d = this.displayTile;
    switch (tileId) {
      case TILE.TRUNK:
        return { x: 12, y: 10, w: 8, h: 22 };
      case TILE.BUSH:
        return { x: 4, y: 14, w: 24, h: 16 };
      case TILE.STONE:
        return { x: 2, y: 6, w: 28, h: 24 };
      case TILE.CANOPY:
        return { x: 2, y: 0, w: 28, h: 18 };
      case TILE.CANOPY_NW:
        return { x: 0, y: 0, w: d * 0.65, h: 16 };
      case TILE.CANOPY_NE:
        return { x: d * 0.35, y: 0, w: d * 0.65, h: 16 };
      case TILE.CANOPY_SW:
        return { x: 0, y: 12, w: d * 0.65, h: 16 };
      case TILE.CANOPY_SE:
        return { x: d * 0.35, y: 12, w: d * 0.65, h: 16 };
      case TILE.WATER_A:
      case TILE.WATER_B:
        return { x: 0, y: 0, w: d, h: d };
      default:
        return null;
    }
  }

  getSpawnPixel() {
    return {
      x: this.spawnCol * this.displayTile + this.displayTile / 2,
      y: this.spawnRow * this.displayTile + this.displayTile / 2,
    };
  }

  _generate() {
    const { cols, rows } = this;
    const midC = this.spawnCol;
    const midR = this.spawnRow;

    // Base grass checkerboard
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.setTile(col, row, (col + row) % 2 === 0 ? TILE.GRASS_A : TILE.GRASS_B);
      }
    }

    // Outer border — water ring
    for (let col = 0; col < cols; col++) {
      this.setTile(col, 0, col % 2 === 0 ? TILE.WATER_A : TILE.WATER_B);
      this.setTile(col, 1, TILE.WATER_B);
      this.setTile(col, rows - 2, TILE.WATER_B);
      this.setTile(col, rows - 1, col % 2 === 0 ? TILE.WATER_A : TILE.WATER_B);
    }
    for (let row = 2; row < rows - 2; row++) {
      this.setTile(0, row, row % 2 === 0 ? TILE.WATER_A : TILE.WATER_B);
      this.setTile(1, row, TILE.GRASS_DARK);
      this.setTile(cols - 2, row, TILE.GRASS_DARK);
      this.setTile(cols - 1, row, row % 2 === 0 ? TILE.WATER_A : TILE.WATER_B);
    }

    // Main cross paths through the grove
    for (let col = 3; col < cols - 3; col++) {
      if (Math.abs(col - midC) <= 1) {
        this.setTile(col, midR, TILE.PATH);
        if (midR - 1 >= 0) this.setTile(col, midR - 1, TILE.PATH);
      }
    }
    for (let row = 3; row < rows - 3; row++) {
      if (Math.abs(row - midR) <= 1) {
        this.setTile(midC, row, TILE.PATH);
        if (midC - 1 >= 0) this.setTile(midC - 1, row, TILE.PATH);
      }
    }

    // Central safe clearing (spawn meadow)
    for (let row = midR - 3; row <= midR + 3; row++) {
      for (let col = midC - 4; col <= midC + 4; col++) {
        if (!this.inBounds(col, row)) continue;
        if (this.getTile(col, row) !== TILE.PATH) {
          this.setTile(col, row, (col + row) % 3 === 0 ? TILE.GRASS_FLOWERS : TILE.GRASS_A);
        }
      }
    }

    // Pond — northwest quadrant
    this._fillRect(12, 10, 10, 7, (c, r) => ((c + r) % 2 === 0 ? TILE.WATER_A : TILE.WATER_B));

    // Secondary dirt path to pond
    for (let col = 12; col <= midC; col++) {
      this.setTile(col, 14, TILE.PATH);
    }

    // Forest clusters — trees & bushes (deterministic)
    for (let row = 4; row < rows - 4; row++) {
      for (let col = 4; col < cols - 4; col++) {
        if (this._isNearSpawn(col, row, 5)) continue;
        if (this.getTile(col, row) === TILE.PATH) continue;
        if (this.getTile(col, row) === TILE.WATER_A || this.getTile(col, row) === TILE.WATER_B) continue;

        const distPath = Math.min(
          Math.abs(col - midC),
          Math.abs(row - midR)
        );

        // Denser forest away from center paths
        if (distPath > 8 && hashChance(col, row, 12)) {
          this._placeTree(col, row);
        } else if (distPath > 4 && hashChance(col, row, 5)) {
          this.setTile(col, row, TILE.BUSH);
        } else if (hashChance(col, row, 3)) {
          this.setTile(col, row, TILE.GRASS_FLOWERS);
        }
      }
    }

    // Stone ruins — southeast
    this._fillRect(cols - 18, rows - 14, 8, 6, () => TILE.STONE);

    // Edge tree line (north forest border feel)
    for (let col = 6; col < cols - 6; col += 3) {
      if (hashChance(col, 4, 60)) this._placeTree(col, 4);
    }
  }

  _isNearSpawn(col, row, radius) {
    return Math.abs(col - this.spawnCol) <= radius && Math.abs(row - this.spawnRow) <= radius;
  }

  _fillRect(startCol, startRow, w, h, tileFn) {
    for (let row = startRow; row < startRow + h; row++) {
      for (let col = startCol; col < startCol + w; col++) {
        this.setTile(col, row, tileFn(col, row));
      }
    }
  }

  _placeTree(col, row) {
    if (row + 1 >= this.rows - 2) return;
    if (this.getTile(col, row + 1) === TILE.PATH) return;
    if (this.getTile(col, row) === TILE.WATER_A || this.getTile(col, row) === TILE.WATER_B) return;

    this.setTile(col, row, TILE.CANOPY);
    this.setTile(col, row + 1, TILE.TRUNK);
  }
}
