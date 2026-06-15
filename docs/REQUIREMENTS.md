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
| UP-06 | Magnet Charm | +40% XP pickup radius (stacks) |
| UP-07 | Heavy Hit | +25% projectile damage |
| UP-08 | Orbiting Blade | Passive damage aura (VS-style) |

> Pool can expand later. First implementation needs at least 6 upgrades and random 3-choice picker.

### 5.4 XP pickup & magnet (decided)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| XP-01 | **Default pickup radius** around player — gems auto-collect when inside radius (no walk-over required for nearby gems) | P0 | 🔲 Not started |
| XP-02 | **Magnet Charm upgrade** increases pickup radius (stackable ranks) | P0 | 🔲 Not started |
| XP-03 | **Vacuum item drop** — rare pickup that instantly pulls **all** XP gems on the map to the player | P0 | 🔲 Not started |
| XP-04 | Vacuum item has distinct sprite + brief VFX on activation | P1 | 🔲 Not started |
| XP-05 | XP gems remain on ground until collected (VS-style) | P0 | 🔲 Not started |

**Default radius:** small but usable (~48–64 px); exact value tuned in playtest.

### 5.5 Bosses & win condition (decided)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| BOSS-01 | **Mini-boss** spawns at every **5-minute** mark (5:00, 10:00, 15:00, 20:00, 25:00) | P0 | 🔲 Not started |
| BOSS-02 | Mini-bosses are tougher, unique sprite, announce arrival (toast + SFX) | P0 | 🔲 Not started |
| BOSS-03 | Mini-boss count scales (5 min = first, each subsequent is harder) | P1 | 🔲 Not started |
| BOSS-04 | **Main boss** spawns at **30:00** | P0 | 🔲 Not started |
| BOSS-05 | Defeating main boss = **level win** — run ends in victory (not death) | P0 | 🔲 Not started |
| BOSS-06 | **Victory screen** shows time, level, kills, score | P0 | 🔲 Not started |
| BOSS-07 | Only **one level** for now ("Eldergrove"); multi-level support deferred | P0 | 🔲 N/A (design) |
| BOSS-08 | Normal enemy spawn pauses or slows during mini-boss / boss fights | P1 | 🔲 Not started |

**Run outcomes:** Death (game over) · Victory (30 min boss defeated) · *(future: quit to menu)*

### 5.6 Pause menu (decided)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| PAUSE-01 | **ESC opens pause menu** (does not immediately exit) | P0 | 🔲 Not started |
| PAUSE-02 | Pause **freezes** gameplay (physics, timer, spawns) | P0 | 🔲 Not started |
| PAUSE-03 | Options: **Resume** and **Exit to Main Menu** | P0 | 🔲 Not started |
| PAUSE-04 | Exit to menu requires no extra confirm (or single confirm — tune in playtest) | P1 | 🔲 Not started |
| PAUSE-05 | Pause works during gameplay; disabled during level-up picker (or ESC ignored there) | P1 | 🔲 Not started |

### 5.7 Audio (decided — in scope)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| AUD-01 | Background **chiptune** music loop during gameplay | P1 | 🔲 Not started |
| AUD-02 | Menu music (can reuse or separate track) | P2 | 🔲 Not started |
| AUD-03 | SFX: projectile fire, enemy hit, enemy death | P1 | 🔲 Not started |
| AUD-04 | SFX: player hurt, level up, upgrade pick | P1 | 🔲 Not started |
| AUD-05 | SFX: mini-boss spawn, boss spawn, victory fanfare | P1 | 🔲 Not started |
| AUD-06 | SFX: vacuum item pickup, XP gem collect (subtle) | P2 | 🔲 Not started |
| AUD-07 | Procedural or royalty-free chiptune (Web Audio / generated tones acceptable for v1) | P1 | 🔲 Not started |

### 5.8 Current gameplay baseline

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
| EN-06 | Mini-boss entities at 5-min intervals (see BOSS-*) | P0 | 🔲 Not started |
| EN-07 | Main boss entity at 30:00 | P0 | 🔲 Not started |

---

## 8. UI / HUD Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| UI-01 | Heart containers (LTTP style) | P0 | ✅ Done |
| UI-02 | **Run timer** (top-center or top-right, MM:SS) | P0 | 🔲 Not started |
| UI-03 | **XP bar** with level number | P0 | 🔲 Not started |
| UI-04 | Score / kill count | P1 | ✅ Partial |
| UI-05 | Level-up modal (3 upgrade cards, SNES window style) | P0 | 🔲 Not started |
| UI-06 | Game over / **victory** summary panel with timer + stats | P1 | 🔲 Partial |
| UI-07 | Main menu (Start New Game) | P0 | ✅ Done |
| UI-08 | **Pause menu** overlay (Resume / Exit to Main Menu) | P0 | 🔲 Not started |
| UI-09 | Boss arrival toast ("Mini-Boss!" / "Boss approaching!") | P1 | 🔲 Not started |

---

## 9. Controls

| Input | Action | Status |
|-------|--------|--------|
| WASD / Arrow keys | Move | ✅ |
| (automatic) | Attack nearest enemy | ✅ |
| 1 / 2 / 3 or click | Select upgrade on level-up screen | 🔲 |
| ESC | **Pause menu** → Resume or Exit to Main Menu | 🔲 |
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
| TECH-10 | **BossDirector** — 5-min mini-boss + 30-min main boss schedule | 🔲 |
| TECH-11 | **AudioManager** — music + SFX playback | 🔲 |
| TECH-12 | Automated smoke tests for scene boot | 🔲 |

---

## 11. Non-Goals (for now)

- Multiplayer
- Save / meta-progression between runs
- Hand-drawn asset pipeline (stay procedural until art pass stabilizes)
- Mobile touch controls
- Full LTTP dungeon interiors / story quests
- **Multiple levels** (one Eldergrove level only until post-MVP)
- Full LTTP-style item/inventory system

---

## 12. Resolved Product Decisions

| Question | Decision |
|----------|----------|
| Art direction | **Link to the Past** overworld |
| Map scope | **Large scrollable map** (~3×3 screens — **confirmed sufficient for now**) |
| Progression | **Vampire Survivors-style** — XP, level-ups, upgrade picks |
| Timer | **Yes** — track run duration |
| Combat feel | **Stronger hit impact**, especially **enemy reactions** |
| Auto-attack | **Keep** (aligns with VS) |
| Run end — death | Player HP reaches 0 → game over |
| Run end — win | **Main boss at 30:00**; defeating it **ends level in victory** |
| Mini-bosses | **Every 5 minutes** (5, 10, 15, 20, 25) — VS-style |
| Level count | **One level** (Eldergrove) for now; more levels later |
| Pause / ESC | **Pause menu** with **Resume** and **Exit to Main Menu** |
| XP pickup | **Default radius** + **Magnet Charm upgrade** + **vacuum item drop** pulls all XP |
| Audio | **In scope** — chiptune music + combat/UI SFX |

---

## 13. Resolved UX Details

| Question | Decision |
|----------|----------|
| Exit confirm | **Yes** — confirm before returning to main menu |
| Vacuum item drops | **Random chance** from normal kills (rate in config) |
| Victory / defeat flow | **Stats screen** + explicit **Return to Menu** button |

## 14. Future Open Questions

1. **Level 2+** — Same map reskin, or entirely new tilemaps per zone?

---

## 15. Acceptance Criteria

### Milestone A — Core loop (MVP)

- [ ] Player moves across a map at least **3× viewport** in width and height
- [ ] Camera follows player and does not show void outside world
- [ ] Run timer visible and accurate from 0:00
- [ ] Killing enemies drops XP; bar fills and triggers level-up
- [ ] **Default XP pickup radius** works; gems collect without exact walk-over
- [ ] Level-up shows 3 upgrades; picking one applies effect immediately
- [ ] Enemies react to hits with knockback + visible hit state (not just tint)
- [ ] Art pass moves hero/tiles closer to LTTP overworld palette
- [ ] **Pause menu** (ESC → Resume / Exit to Menu)
- [ ] Game over screen shows survival time + level + kills
- [ ] No regressions: menu → game → menu flow still works

### Milestone B — Full Eldergrove level (VS-complete)

- [ ] Mini-boss spawns at 5:00, 10:00, 15:00, 20:00, 25:00
- [ ] Main boss spawns at 30:00
- [ ] Defeating main boss triggers **victory** and ends the run
- [ ] Victory screen shows full run stats
- [ ] **Vacuum item** drops and pulls all XP to player
- [ ] **Magnet Charm** upgrade increases pickup radius
- [ ] Spawn difficulty driven by survival time
- [ ] Audio: gameplay music + core SFX (hit, death, level up, boss)

---

## 16. Related Documents

- [TASKS.md](./TASKS.md) — Implementation task breakdown (do this before coding)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Current + planned code architecture
