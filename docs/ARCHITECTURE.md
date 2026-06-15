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

## Planned Scene Flow (after Milestone B)

```
BootScene
  └─ AssetService.bootstrap()
       └─ MainMenuScene
            └─ GameScene
                 ├─ RunState (timer, xp, level, outcome: playing|won|lost)
                 ├─ WorldMap + camera
                 ├─ SpawnDirector (time-based normals)
                 ├─ BossDirector (5:00 mini ×5, 30:00 main)
                 ├─ AudioManager (music + SFX)
                 ├─ [level-up] ── pauses → UpgradePicker → resumes
                 ├─ [ESC] ── PauseMenu → Resume | Exit to Menu
                 ├─ [death] ── RunSummary (game over)
                 ├─ [boss defeated @ 30:00] ── RunSummary (victory)
                 └─ AudioManager.stopAll() on scene exit
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
    RunState.js               # timer, xp, level, outcome (playing|won|lost)
    SpawnDirector.js          # time-based normal enemy spawning
    BossDirector.js           # NEW — 5-min mini-boss + 30-min main boss
    AudioManager.js           # NEW — music loops + SFX
  world/
    WorldMap.js
    WorldRenderer.js
  entities/
    Player.js                 # + pickup radius, upgrade modifiers
    Enemy.js                  # + hit state machine, knockback
    MiniBoss.js               # NEW — extends Enemy, scaled stats
    MainBoss.js               # NEW — 30-min win condition
    XpGem.js                  # idle gems on ground
    VacuumItem.js             # NEW — one-shot pull-all-XP pickup
  ui/
    Hud.js                    # hearts, timer, XP bar
    UpgradePicker.js          # level-up 3-choice modal
    PauseMenu.js              # NEW — Resume / Exit to Main Menu
    RunSummary.js             # game over OR victory stats panel
  scenes/
    GameScene.js              # Orchestrator only — delegates to systems
```

---

## System Responsibilities

### RunState (planned)
Single object owned by `GameScene`, reset on each run.

| Field | Type | Purpose |
|-------|------|---------|
| `elapsedMs` | number | Run timer (pauses when game paused) |
| `xp` | number | Current XP |
| `level` | number | Current level (starts 1) |
| `xpToNext` | number | Threshold for next level |
| `upgrades` | string[] | Applied upgrade IDs |
| `kills` | number | Kill counter |
| `score` | number | Score counter |
| `outcome` | `'playing' \| 'won' \| 'lost'` | Run result |
| `isPaused` | boolean | Pause menu or level-up freeze |

Methods: `start()`, `update(delta)`, `addXp(n)`, `levelUp()`, `endVictory()`, `endDefeat()`, `getFormattedTime()`

### BossDirector (planned)

| Milestone | Action |
|-----------|--------|
| 5:00 | Spawn mini-boss #1 |
| 10:00 | Spawn mini-boss #2 |
| 15:00 | Spawn mini-boss #3 |
| 20:00 | Spawn mini-boss #4 |
| 25:00 | Spawn mini-boss #5 |
| 30:00 | Spawn main boss; normal spawns reduced |

On main boss death → `RunState.endVictory()` → victory screen.

Mini-boss index scales HP/damage (config table in `GameConfig.js`).

### XP pickup (planned)

```
Player has basePickupRadius (e.g. 56px)
  ├─ Each frame: collect gems where dist(player, gem) < radius
  ├─ Magnet Charm upgrade: radius *= 1.4 per rank
  └─ VacuumItem on pickup: tween ALL gems → player, then addXp
```

Vacuum items drop from enemies at low chance, or guaranteed from mini-bosses (tune in playtest).

### PauseMenu (planned)

ESC during `outcome === 'playing'` and not in level-up picker:
1. Set `RunState.isPaused = true`
2. `physics.pause()`, stop SpawnDirector ticks
3. Show overlay: **Resume** | **Exit to Main Menu**
4. Resume reverses all of the above

### AudioManager (planned)

```javascript
AudioManager.playMusic('gameplay');
AudioManager.playSfx('enemy_hit');
AudioManager.playSfx('boss_spawn');
```

v1: Web Audio API procedural chiptune (square/triangle waves) — no external files required.

### WorldMap (planned)
| Responsibility | Detail |
|----------------|--------|
| Storage | 2D array of tile indices |
| Size | e.g. 128×128 tiles × 32px = 4096×4096 world |
| Collision | Parallel boolean grid or tile flags |
| Queries | `isBlocked(tx, ty)`, `getSpawnZone()` |

Camera: `Phaser.Cameras.Scene2D.Camera.startFollow(player)` with bounds `{ x: 0, y: 0, width: worldW, height: worldH }`.

### SpawnDirector (planned)
Input: `RunState.elapsedMs`, player level, camera bounds, `BossDirector.isBossActive`.  
Output: spawn requests `{ type, x, y }`.

Replaces current kill-based interval in `GameScene.update()`. Yields to boss fights when active.

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
  ├─ if (RunState.isPaused) return
  ├─ RunState.update(delta)          → elapsedMs, check boss milestones
  ├─ BossDirector.tick()             → spawn mini/main boss if due
  ├─ Player.update()                 → movement, auto-attack, XP radius collect
  ├─ SpawnDirector.tick()            → normal enemies (if no boss active)
  ├─ Enemies[].update()              → chase AI (skip if hit-stunned)
  ├─ XpGems[]                        → idle; vacuum tween if active
  ├─ Camera follow player
  └─ Hud.sync(RunState, Player)
```

---

## Related Documents

- [REQUIREMENTS.md](./REQUIREMENTS.md) — What we're building
- [TASKS.md](./TASKS.md) — Ordered implementation tasks
