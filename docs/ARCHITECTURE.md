# Eldergrove — Architecture

## Scene Flow

```
BootScene
  └─ AssetService.bootstrap()  ── generates all textures once
       └─ MainMenuScene
            └─ [Start New Game] ── SceneTransition.toGame()
                 └─ GameScene
                      ├─ [ESC] ── SceneTransition.toMenu() ── MainMenuScene
                      ├─ [death] ── game over overlay
                      └─ [R] ── scene.restart()
```

## Directory Layout

```
src/
  config/GameConfig.js      # Constants (scenes, player stats, waves)
  services/AssetService.js  # One-time texture bootstrap + validation
  utils/
    TextureGenerator.js     # Procedural SNES pixel art
    SnesPalettes.js         # Color palettes + PixelCanvas helper
    SnesUI.js               # FF6-style windows, menu items
    SceneTransition.js      # Safe fades, camera FX reset
  entities/
    Player.js               # Hero movement, animation, auto-attack
    Enemy.js                # Slime / skeleton / bat behavior
  scenes/
    BootScene.js            # Loading + asset init
    MainMenuScene.js        # Title screen
    GameScene.js            # Core gameplay loop
  main.js                   # Phaser game config
```

## Key Design Decisions

### AssetService
Textures are generated procedurally at boot and stored in Phaser's global `TextureManager`. `AssetService.assertReady()` is called at the top of every scene's `create()` to fail fast if boot was skipped or failed.

### SceneTransition
Camera fade FX are reset before every transition. Previously, a menu `fadeOut` followed by a crashed `GameScene.create()` left the screen permanently black. Now:
- `resetFX()` + `setAlpha(1)` before fade
- Single fade on exit, single fade on enter

### Tile Rendering
Tiles use named frames (`tile_0` … `tile_15`) on the tileset spritesheet instead of `setCrop()`, which was unreliable across Phaser versions.

### Input Cleanup
`GameScene.shutdown()` removes the ESC keyboard listener to prevent duplicate handlers when revisiting the scene.

## Bug That Caused Blank Screen

**Root cause**: `Player` constructor called `this.registerAnims(scene)` but `registerAnims` was a `static` method. This threw during `GameScene.create()`, after the menu had already faded to black.

**Fix**: Call `Player.registerAnims(scene)` before constructing the sprite. Added try/catch in `GameScene.create()` with a visible error message as fallback.
