# Eldergrove — Requirements Document

> **Living document.** Last updated after product direction change: LTTP art target, large scrollable map, Vampire Survivors progression, combat impact polish.

---

## 1. Vision

**Eldergrove** is a top-down fantasy survival game that combines:

| Pillar | Primary inspiration | What we take from it |
|--------|---------------------|----------------------|
| **Presentation** | *The Legend of Zelda: A Link to the Past* | SNES overworld pixel art, tile-based world, hero proportions, exploration feel |
| **Gameplay loop** | *Vampire Survivors* | Timed survival run, auto-combat, XP → level-up → upgrade picks, escalating enemy pressure |

The player enters a **large overworld map**, survives as long as possible while enemies continuously spawn and grow more dangerous, collects XP, levels up, chooses power upgrades, and tries to beat their best time/score before dying.

---

## 2. Design Pillars

1. **Explore a world, not a screen** — The map is larger than the viewport; the camera follows the player.
2. **Survive the clock** — A visible run timer tracks how long the level has been going.
3. **Grow stronger during the run** — Kills grant XP; level-ups offer randomized upgrade choices (VS-style).
4. **Combat must feel good** — Hits on enemies have clear, satisfying feedback (not just a white tint on the player).
5. **Look like LTTP** — Art, tiles, and UI should read as Link to the Past overworld, not generic SNES.

---

## 3. Art & Presentation Requirements

### 3.1 LTTP Target (not yet implemented)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| ART-01 | Hero sprite resembles LTTP Link (green tunic, blonde, sword) — 16×16, 4 dirs, walk cycle | P0 | 🔲 Partial (generic hero exists) |
| ART-02 | Overworld tileset: LTTP-style grass, dirt paths, cliffs, water edges, bushes | P0 | 🔲 Partial |
| ART-03 | LTTP color palette for overworld (muted greens, tan paths, blue water) | P0 | 🔲 Partial |
| ART-04 | Tree / bush sprites as multi-tile props with collision | P1 | 🔲 Partial (tiles only) |
| ART-05 | Enemy sprites fit LTTP world (keeps readable silhouettes) | P1 | 🔲 Partial |
| ART-06 | HUD styled like LTTP (hearts, minimal chrome) mixed with VS timer/XP bar | P0 | 🔲 Partial |
| ART-07 | True bitmap font or LTTP-accurate pixel font (replace Courier fallback) | P2 | 🔲 Not started |
| ART-08 | No HD-2D effects (lighting, bloom, gradients) | P0 | ✅ Done |

### 3.2 Current art baseline (already shipped)

- 16×16 tile grid, 2× display scale
- Procedural pixel art via `TextureGenerator`
- FF6-style menu windows on title screen
- Heart container HUD

---

## 4. World & Map Requirements

### 4.1 Large scrollable map (not yet implemented)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| MAP-01 | World size **larger than one screen** (minimum 3×3 screens; target ~4096×4096 px or 128×128 tiles) | P0 | 🔲 Not started |
| MAP-02 | Camera follows player smoothly, clamped to world bounds | P0 | 🔲 Not started |
| MAP-03 | Tilemap authored as 2D grid (not random per-screen fill) | P0 | 🔲 Not started |
| MAP-04 | Solid tile collision (trees, cliffs, water block movement) | P1 | 🔲 Not started |
| MAP-05 | Enemies spawn **outside camera view** but **inside world bounds** | P0 | 🔲 Not started (spawns at screen edge only) |
| MAP-06 | World has visual variety zones (forest, clearing, path, pond) | P1 | 🔲 Not started |
| MAP-07 | Player starts in a safe central-ish area | P1 | 🔲 Not started |

### 4.2 Current map baseline

- Single 960×640 screen filled with procedural tiles
- No camera scroll
- No collision
- Trees placed as decorative overlays

---

## 5. Gameplay Requirements — Vampire Survivors Loop

### 5.1 Core survival loop (not yet implemented)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| GP-01 | **Run timer** displayed during gameplay (MM:SS, counts up from 0:00 at run start) | P0 | 🔲 Not started |
| GP-02 | Timer persists for entire run; shown on game over summary | P0 | 🔲 Not started |
| GP-03 | Enemies spawn continuously and difficulty scales with time (not just kill count) | P0 | 🔲 Partial (kill-based only) |
| GP-04 | Player **auto-attacks** nearest enemy (keep current behavior as baseline) | P0 | ✅ Done |
| GP-05 | Enemies drop **XP gems/orbs** on death; player collects by walking over them | P0 | 🔲 Not started |
| GP-06 | XP bar fills; reaching threshold triggers **level up** | P0 | 🔲 Not started |
| GP-07 | Level up **pauses gameplay** and shows **3 random upgrade choices** | P0 | 🔲 Not started |
| GP-08 | Player picks one upgrade; run resumes | P0 | 🔲 Not started |
| GP-09 | Upgrades stack for the duration of the run | P0 | 🔲 Not started |
| GP-10 | Game over shows: survival time, level reached, kills, score | P1 | 🔲 Partial (score only) |
| GP-11 | Contact damage + brief invincibility frames | P0 | ✅ Done |

### 5.2 Upgrade pool (initial set — to implement)

| ID | Upgrade | Effect |
|----|---------|--------|
| UP-01 | Swift Boots | +15% move speed |
| UP-02 | Arcane Bolt | +1 projectile per attack |
| UP-03 | Quick Cast | −15% attack cooldown |
| UP-04 | Wide Arc | Projectiles pierce 1 extra enemy |
| UP-05 | Vitality | +20 max HP (heal same amount) |
| UP-06 | Magnet Charm | Increased XP pickup radius |
| UP-07 | Heavy Hit | +25% projectile damage |
| UP-08 | Orbiting Blade | Passive damage aura (VS-style) |

> Pool can expand later. First implementation needs at least 6 upgrades and random 3-choice picker.

### 5.3 Current gameplay baseline

- Score on kill
- Spawn interval decreases every 5 kills
- 3 enemy types: slime, skeleton, bat
- Single projectile auto-attack
- Wave text in HUD

---

## 6. Combat Feel Requirements

### 6.1 Hit impact (partially implemented — needs enemy-side work)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FX-01 | **Enemy hit reaction animation** (recoil frame / squash / flash) | P0 | 🔲 Not started |
| FX-02 | **Enemy knockback** on hit (scaled by damage or fixed impulse) | P0 | 🔲 Not started |
| FX-03 | Brief **enemy hit-stun** (movement paused ~80–120 ms) | P0 | 🔲 Not started |
| FX-04 | Hit particles at impact point (exists but weak) | P1 | 🔲 Partial |
| FX-05 | Optional micro **hit-stop** (1–2 frame freeze on kill) | P2 | 🔲 Not started |
| FX-06 | Optional camera **screen shake** on heavy hits / kills | P2 | 🔲 Not started |
| FX-07 | Death burst particles (exists) | P1 | ✅ Done |
| FX-08 | Player attack flash on fire (exists) | P2 | ✅ Done |

### 6.2 Current combat feedback gap

- Player gets tint flash on attack/damage ✅
- Enemy only gets 50 ms white tint + small particles ❌ **User called this out — not enough impact**

---

## 7. Enemy Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| EN-01 | Slime — slow, low HP, common | P0 | ✅ Done |
| EN-02 | Skeleton — medium speed/HP | P0 | ✅ Done |
| EN-03 | Bat — fast, low HP | P0 | ✅ Done |
| EN-04 | Spawn rate scales with **time survived** AND player level | P1 | 🔲 Not started |
| EN-05 | Enemy cap to prevent performance collapse (e.g., max 80 on screen) | P1 | 🔲 Not started |
| EN-06 | Elite / tinted variants at time milestones (10 min, 20 min…) | P2 | 🔲 Not started |

---

## 8. UI / HUD Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| UI-01 | Heart containers (LTTP style) | P0 | ✅ Done |
| UI-02 | **Run timer** (top-center or top-right, MM:SS) | P0 | 🔲 Not started |
| UI-03 | **XP bar** with level number | P0 | 🔲 Not started |
| UI-04 | Score / kill count | P1 | ✅ Partial |
| UI-05 | Level-up modal (3 upgrade cards, SNES window style) | P0 | 🔲 Not started |
| UI-06 | Game over summary panel with timer + stats | P1 | 🔲 Partial |
| UI-07 | Main menu (Start New Game) | P0 | ✅ Done |

---

## 9. Controls

| Input | Action | Status |
|-------|--------|--------|
| WASD / Arrow keys | Move | ✅ |
| (automatic) | Attack nearest enemy | ✅ |
| 1 / 2 / 3 or click | Select upgrade on level-up screen | 🔲 |
| ESC | Pause → main menu (confirm?) | ✅ (no confirm) |
| R | Retry after game over | ✅ |

---

## 10. Technical Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| TECH-01 | Phaser 3 + Vite, browser playable | ✅ |
| TECH-02 | Procedural art (no external sprites yet) | ✅ |
| TECH-03 | GitHub Pages / GitHack deploy | ✅ |
| TECH-04 | AssetService — one-time bootstrap | ✅ |
| TECH-05 | SceneTransition — safe scene changes | ✅ |
| TECH-06 | **WorldManager** — tilemap, collision, camera bounds | 🔲 |
| TECH-07 | **RunState** — timer, XP, level, upgrades for current run | 🔲 |
| TECH-08 | **UpgradeRegistry** — data-driven upgrade definitions | 🔲 |
| TECH-09 | **SpawnDirector** — time-based spawn curve | 🔲 |
| TECH-10 | Automated smoke tests for scene boot | 🔲 |

---

## 11. Non-Goals (for now)

- Multiplayer
- Save / meta-progression between runs
- Hand-drawn asset pipeline (stay procedural until art pass stabilizes)
- Mobile touch controls
- Full LTTP dungeon interiors / story quests
- Boss fights (future phase)

---

## 12. Resolved Product Decisions

These were open questions; user has now decided:

| Question | Decision |
|----------|----------|
| Art direction | **Link to the Past** overworld |
| Map scope | **Large scrollable map**, not single screen |
| Progression | **Vampire Survivors-style** — XP, level-ups, upgrade picks |
| Timer | **Yes** — track run duration |
| Combat feel | **Stronger hit impact**, especially **enemy reactions** |
| Auto-attack | **Keep** (aligns with VS) |

---

## 13. Remaining Open Questions

1. **Run end condition** — Pure endless until death, or hard cap (e.g., 30 min boss)?
2. **Pause menu** — Should ESC pause with resume, or go straight to main menu?
3. **Map size** — 3×3 screens (~2880×1920) or bigger (4×4+)?
4. **XP magnet** — Auto-collect within radius from start, or only after upgrade?
5. **Audio** — Add chiptune + hit SFX in next phase?

---

## 14. Acceptance Criteria (MVP for next milestone)

The next playable milestone is done when **all** of the following are true:

- [ ] Player moves across a map at least **3× viewport** in width and height
- [ ] Camera follows player and does not show void outside world
- [ ] Run timer visible and accurate from 0:00
- [ ] Killing enemies drops XP; bar fills and triggers level-up
- [ ] Level-up shows 3 upgrades; picking one applies effect immediately
- [ ] Enemies react to hits with knockback + visible hit state (not just tint)
- [ ] Art pass moves hero/tiles closer to LTTP overworld palette
- [ ] Game over screen shows survival time + level + kills
- [ ] No regressions: menu → game → menu flow still works

---

## 15. Related Documents

- [TASKS.md](./TASKS.md) — Implementation task breakdown (do this before coding)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Current + planned code architecture
