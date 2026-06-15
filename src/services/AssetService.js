import { TextureGenerator } from '../utils/TextureGenerator.js';

/**
 * Ensures procedural textures are generated exactly once and verified before use.
 */
export class AssetService {
  static #ready = false;

  static get isReady() {
    return AssetService.#ready;
  }

  static bootstrap(game) {
    if (AssetService.#ready) return;

    TextureGenerator.generateAll(game.textures);
    TextureGenerator.registerFrames(game.textures);
    TextureGenerator.registerTileFrames(game.textures);

    AssetService.#assertCoreTextures(game);
    AssetService.#ready = true;
    game.registry.set('assetsReady', true);
  }

  static #assertCoreTextures(game) {
    const required = [
      'tileset', 'player', 'enemy_slime', 'enemy_skeleton', 'enemy_bat',
      'projectile', 'particle', 'shadow', 'heart', 'heart_empty',
    ];
    const missing = required.filter((k) => !game.textures.exists(k));
    if (missing.length > 0) {
      throw new Error(`AssetService: missing textures: ${missing.join(', ')}`);
    }

    const tileset = game.textures.get('tileset');
    if (!tileset.has('tile_0')) {
      throw new Error('AssetService: tile frames not registered');
    }
  }

  static assertReady(game) {
    if (!AssetService.#ready) {
      throw new Error('AssetService: assets not bootstrapped');
    }
  }
}
