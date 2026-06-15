# Eldergrove — Architecture

## Current Scene Flow

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

---

## Planned Scene Flow (after Phase 5)

```
BootScene
  └─ AssetService.bootstrap()
       └─ MainMenuScene
            └─ GameScene
                 ├─ RunState (timer, xp, level, upgrades)
                 ├─ WorldMap + camera
                 ├─ SpawnDirector
                 ├─ [level-up] ── pauses → UpgradePicker UI → resumes
                 ├─ [death] ── RunSummary (time, level, kills)
                 └─ [ESC] ── MainMenuScene
```

---

## Current Directory Layout

```
src/
  config/GameConfig.js        # Constants (scenes, player stats, waves)
  services/AssetService.js    # One-time texture bootstrap + validation
  utils/
    TextureGenerator.js       # Procedural SNES pixel art
    SnesPalettes.js           # Color palettes + PixelCanvas helper
    SnesUI.js                 # FF6-style windows, menu items
    SceneTransition.js        # Safe fades, camera FX reset
  entities/
    Player.js                 # Hero movement, animation, auto-attack
    Enemy.js                  # Slime / skeleton / bat behavior
  scenes/
    BootScene.js
    MainMenuScene.js
    GameScene.js              # God-scene (to be refactored in Phase 8)
  main.js
```

---

## Planned Additions (see TASKS.md)

```
src/
  config/
    GameConfig.js             # + world size, XP curve, spawn tables
    UpgradeRegistry.js      # NEW — data-driven upgrade defs
  services/
    AssetService.js
    RunState.js               # NEW — per-run timer, xp, level, upgrades
    SpawnDirector.js          # NEW — time-based enemy spawning
  world/
    WorldMap.js               # NEW — tile grid, collision, zones
    WorldRenderer.js          # NEW — tilemap + prop rendering
  entities/
    Player.js                 # + upgrade modifiers, magnet radius
    Enemy.js                  # + hit state machine, knockback
    XpGem.js                  # NEW — droppable XP pickup
    Projectile.js             # NEW (optional extract from GameScene)
  ui/
    Hud.js                    # NEW — hearts, timer, XP bar
    UpgradePicker.js          # NEW — level-up 3-choice modal
    RunSummary.js             # NEW — game over stats panel
  scenes/
    GameScene.js              # Orchestrator only — delegates to systems
```

---

## System Responsibilities

### RunState (planned)
Single object owned by `GameScene`, reset on each run.

| Field | Type | Purpose |
|-------|------|---------|
| `elapsedMs` | number | Run timer |
| `xp` | number | Current XP |
| `level` | number | Current level (starts 1) |
| `xpToNext` | number | Threshold for next level |
| `upgrades` | string[] | Applied upgrade IDs |
| `kills` | number | Kill counter |
| `score` | number | Score counter |

Methods: `start()`, `update(delta)`, `addXp(n)`, `levelUp()`, `getFormattedTime()`

### WorldMap (planned)
| Responsibility | Detail |
|----------------|--------|
| Storage | 2D array of tile indices |
| Size | e.g. 128×128 tiles × 32px = 4096×4096 world |
| Collision | Parallel boolean grid or tile flags |
| Queries | `isBlocked(tx, ty)`, `getSpawnZone()` |

Camera: `Phaser.Cameras.Scene2D.Camera.startFollow(player)` with bounds `{ x: 0, y: 0, width: worldW, height: worldH }`.

### SpawnDirector (planned)
Input: `RunState.elapsedMs`, player level, camera bounds.  
Output: spawn requests `{ type, x, y }`.

Replaces current kill-based interval in `GameScene.update()`.

### Enemy hit state machine (planned)

```
         ┌──────────────────────────────────┐
         │                                  │
         ▼                                  │
      [chase] ──hit──► [stun+knockback] ────┘
         │
        kill
         ▼
       [dead]
```

During `[stun+knockback]`: skip AI velocity, play hit frame, apply decaying knockback velocity.

### UpgradeRegistry (planned)
```javascript
{
  id: 'swift_boots',
  name: 'Swift Boots',
  description: '+15% move speed',
  apply: (player, runState) => { player.speed *= 1.15; },
  maxRank: 5,
}
```

`UpgradePicker` reads registry, picks 3 random, displays via `SnesUI`.

---

## Key Design Decisions (current)

### AssetService
Textures generated once at boot. `assertReady()` called in every scene's `create()`.

### SceneTransition
`resetFX()` + `setAlpha(1)` before fades — prevents stuck black screen.

### Tile rendering
Named frames `tile_0`…`tile_15` on tileset — avoids `setCrop()` bugs.

---

## Data Flow (planned gameplay frame)

```
GameScene.update(delta)
  ├─ RunState.update(delta)          → elapsedMs, check milestones
  ├─ Player.update()                 → movement, auto-attack
  ├─ SpawnDirector.tick()            → maybe spawn enemy
  ├─ Enemies[].update()              → chase AI (skip if hit-stunned)
  ├─ Projectiles[]                   → move, overlap enemies
  ├─ XpGems[]                        → magnet toward player
  ├─ Camera follow player
  └─ Hud.sync(RunState, Player)
```

---

## Related Documents

- [REQUIREMENTS.md](./REQUIREMENTS.md) — What we're building
- [TASKS.md](./TASKS.md) — Ordered implementation tasks
