import { GAME } from '../config/GameConfig.js';
import { BLOCKING_TILES } from './WorldMap.js';

/**
 * Renders WorldMap tiles and builds invisible collision bodies for blocked tiles.
 */
export class WorldRenderer {
  constructor(scene, worldMap) {
    this.scene = scene;
    this.worldMap = worldMap;
    this.displayTile = worldMap.displayTile;
    this.tileSprites = [];
    this.collisionGroup = scene.physics.add.staticGroup();
    this.render();
  }

  render() {
    const { cols, rows } = this.worldMap;
    const map = this.worldMap;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileId = map.getTile(col, row);
        const x = col * this.displayTile;
        const y = row * this.displayTile;

        const img = this.scene.add
          .image(x, y, 'tileset', `tile_${tileId}`)
          .setOrigin(0, 0)
          .setDisplaySize(this.displayTile, this.displayTile)
          .setDepth(this._depthForTile(tileId));

        this.tileSprites.push(img);

        if (BLOCKING_TILES.has(tileId)) {
          const body = this.collisionGroup.create(
            x + this.displayTile / 2,
            y + this.displayTile / 2,
            'particle'
          );
          body.setSize(this.displayTile, this.displayTile).setVisible(false).setActive(true);
        }
      }
    }
  }

  _depthForTile(tileId) {
    // Trunk below canopy; water/grass at bottom
    if (tileId === 6) return 5;  // TRUNK
    if (tileId === 12) return 6; // CANOPY
    if (tileId === 7) return 6;  // BUSH
    return 0;
  }

  setupPlayerCollision(playerSprite) {
    this.scene.physics.add.collider(playerSprite, this.collisionGroup);
  }

  destroy() {
    for (const s of this.tileSprites) s.destroy();
    this.tileSprites = [];
    this.collisionGroup.clear(true, true);
  }
}
