# Eldergrove — Implementation Tasks

> **Read REQUIREMENTS.md first.** Tasks below are ordered by dependency. Do not skip phases unless noted.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · **P0** must-have · **P1** should-have · **P2** nice-to-have

---

## Phase 0 — Documentation & Planning

| ID | Task | Priority | Deps | Status |
|----|------|----------|------|--------|
| DOC-01 | Write REQUIREMENTS.md with LTTP + VS direction | P0 | — | [x] |
| DOC-02 | Write TASKS.md with phased breakdown | P0 | DOC-01 | [x] |
| DOC-03 | Update ARCHITECTURE.md with planned systems | P0 | DOC-01 | [x] |
| DOC-04 | Update README links to docs | P1 | DOC-01 | [x] |

> **Gate:** Phase 1 starts only after DOC-01 through DOC-03 are complete.

---

## Phase 1 — Large World Foundation

Build the scrollable map before layering VS systems on top.

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| W-01 | Add `WorldConfig` constants (world px size, tile dimensions) | P0 | DOC | [x] |
| W-02 | Create `WorldMap` class — 2D tile index array, deterministic LTTP-style layout | P0 | W-01 | [x] |
| W-03 | Render world tilemap from `WorldMap` using existing tileset frames | P0 | W-02 | [x] |
| W-04 | Camera follow player with lerp; clamp to world bounds | P0 | W-03 | [x] |
| W-05 | Move player/enemy/projectile coords to world space (not screen space) | P0 | W-04 | [x] |
| W-06 | Update `Enemy.spawnAtEdge` → spawn outside camera, inside world | P0 | W-05 | [x] |
| W-07 | Add collision layer (blocked tiles: trees, cliffs, water) | P1 | W-02 | [x] |
| W-08 | Place tree/bush props from map data (not hardcoded spots) | P1 | W-02 | [x] |
| W-09 | Set player spawn point in map data | P1 | W-02 | [x] |

**Phase 1 gate:** Player can walk around a 3×+ screen world with camera follow and basic collision.

---

## Phase 2 — LTTP Art Pass

Can run partially in parallel with Phase 1 (textures independent of logic).

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| A-01 | Define LTTP overworld palette in `SnesPalettes.js` | P0 | DOC | Greens/tans/blues match LTTP feel |
| A-02 | Redraw hero sprite — LTTP Link proportions (blonde, green tunic, sword) | P0 | A-01 | Readable at 16×16, 4-dir walk |
| A-03 | Redraw overworld tiles (grass variants, path, cliff edge, water edge) | P0 | A-01 | Tiles tile seamlessly |
| A-04 | Update `WorldMap` to use new tile types (paths, pond, cliff borders) | P1 | W-02, A-03 | Map looks like overworld, not checkerboard |
| A-05 | LTTP-style HUD hearts (keep), simplify top bar layout for timer/XP | P0 | — | Room for timer + XP without clutter |
| A-06 | Retune enemy palettes to fit overworld | P1 | A-01 | Enemies readable on grass |
| A-07 | Main menu background uses LTTP overworld scene | P2 | A-03 | Menu matches in-game look |

**Phase 2 gate:** Visual identity reads as "LTTP overworld" not "generic SNES."

---

## Phase 3 — Run Timer

Small, isolated feature — good first VS mechanic.

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| T-01 | Create `RunState` service (elapsed ms, start/stop/reset) | P0 | W-05 | [x] |
| T-02 | HUD timer display `MM:SS` (updates every frame or 100ms) | P0 | T-01 | [x] |
| T-03 | Reset timer on new run / scene restart | P0 | T-01 | [x] |
| T-04 | Show timer on game over summary | P0 | T-01 | [x] |
| T-05 | Feed timer into spawn difficulty (see Phase 5) | P1 | T-01, S-01 | [x] |

**Phase 3 gate:** Timer accurate, visible, survives until game over.

---

## Phase 4 — Combat Impact (Enemy Hit Reactions)

Address user feedback before or in parallel with Phase 5.

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| C-01 | Add enemy hit state machine: `idle → hit → idle` or `dead` | P0 | — | [x] |
| C-02 | Enemy hit animation frames (recoil/squash) in `TextureGenerator` | P0 | C-01 | [x] |
| C-03 | Knockback impulse away from projectile direction | P0 | C-01 | [x] |
| C-04 | Hit-stun duration (~100ms) — zero velocity during stun | P0 | C-01 | [x] |
| C-05 | Stronger hit particles + optional damage number popup | P1 | C-01 | [x] |
| C-06 | Micro hit-stop on kill (1 frame, configurable) | P2 | C-01 | [ ] |
| C-07 | Camera shake on kill (small amplitude) | P2 | C-01 | [x] |

**Phase 4 gate:** Every hit on enemy shows knockback + animation; kills feel distinct from chip damage.

---

## Phase 4b — Collision & Hit Detection

Fix unreliable projectile hits and tune world collision so blockers read clearly on grass.

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| COL-01 | Shared `Hitboxes` utility — circle bodies for player, enemy, projectile | P0 | C-01 | [x] |
| COL-02 | Per-tile collider shapes (trunk strip, bush mound, canopy crown, water full) | P0 | W-07 | [x] |
| COL-03 | Projectile hit test via distance + segment sweep (anti-tunneling) | P0 | COL-01 | [x] |
| COL-04 | Blocking tiles visually distinct from grass (outline, shadow, contrast) | P0 | A-03 | [x] |
| COL-05 | Player can walk under canopy tiles; trunks/bushes block feet only | P1 | COL-02 | [x] |

**Phase 4b gate:** Shots that visually connect always register; collidable props stand out from background.

---

## Phase 5 — Vampire Survivors Progression Core

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| P-01 | `RunState` fields: xp, level, xpToNext, upgrades[] | P0 | T-01 | [x] |
| P-02 | XP gem entity — drops on enemy death, idle on ground | P0 | C-01 | [x] |
| P-03 | Default **XP pickup radius** on player (overlap + radius check) | P0 | P-02 | [x] |
| P-03b | **Vacuum item** drop + pickup — pulls all gems to player | P0 | P-02 | [x] |
| P-04 | XP bar + level number in HUD | P0 | P-01 | [x] |
| P-05 | Level-up trigger when xp >= xpToNext | P0 | P-01 | [x] |
| P-06 | `UpgradeRegistry` — data file with all upgrade defs | P0 | — | [x] |
| P-07 | Level-up UI — 3 random choices, SNES window | P0 | P-05, P-06 | [x] |
| P-08 | Apply upgrade effects to player stats / attack pattern | P0 | P-07 | [x] |
| P-09 | XP curve formula (level 1→2 fast, scales up) | P1 | P-01 | [x] |
| P-10 | Game over shows level + XP + time + kills | P1 | P-01, T-04 | [x] |
| P-11 | Magnet Charm upgrade (+40% radius per rank) | P0 | P-03, P-08 | [x] |

**Phase 5 gate:** Full VS loop — kill → XP → level → pick upgrade → stronger → survive longer.

---

## Phase 5b — Pause Menu

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| PAU-01 | `PauseMenu` overlay component (SNES window) | P0 | — | Resume + Exit to Main Menu buttons |
| PAU-02 | ESC toggles pause; freezes physics, timer, spawns | P0 | T-01, PAU-01 | Game state frozen while paused |
| PAU-03 | Resume restores gameplay exactly | P0 | PAU-02 | Timer continues from same elapsed |
| PAU-04 | Exit to Main Menu via SceneTransition | P0 | PAU-01 | Clean return, no stuck listeners |
| PAU-05 | Block ESC during level-up picker (or route to picker only) | P1 | P-07, PAU-02 | No accidental menu exit |

**Phase 5b gate:** ESC pause/resume/exit works reliably mid-run.

---

## Phase 6 — Spawn Director (Time-Based Pressure)

Replace kill-only difficulty with VS-style time curve.

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| S-01 | Create `SpawnDirector` — spawn interval from elapsed time | P0 | T-01 | Table/curve, not kill count |
| S-02 | Enemy cap (despawn or stop spawn at max) | P1 | S-01 | No FPS collapse at 15+ min |
| S-03 | Weighted enemy mix shifts over time (more bats/skeletons later) | P1 | S-01 | Early = slimes, late = mix |
| S-04 | Remove or demote old kill-based wave text | P1 | S-01 | HUD shows time milestones instead |
| S-05 | Time milestone toasts ("5:00 — Wave intensifies!") | P2 | S-01 | Optional feedback |

**Phase 6 gate:** Difficulty feels driven by survival time, matching VS.

---

## Phase 6b — Bosses & Victory

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| B-01 | `BossDirector` — schedule at 5:00, 10:00, … 25:00, 30:00 | P0 | T-01 | Milestones fire on elapsed time |
| B-02 | Mini-boss entity — higher HP, unique sprite, spawn off-camera | P0 | B-01, W-06 | Appears at each 5-min mark |
| B-03 | Mini-boss difficulty scales per index (5 min < 25 min) | P1 | B-02 | Later mini-bosses tougher |
| B-04 | Boss arrival toast + optional spawn SFX hook | P1 | B-01, AUD-05 | Player warned at 4:55 / 29:55 |
| B-05 | Main boss at 30:00 — large HP pool, distinct sprite | P0 | B-01 | Only one main boss per run |
| B-06 | Defeating main boss → `RunState.endVictory()` | P0 | B-05 | Run ends in win, not death |
| B-07 | Victory screen (time, level, kills, score) + return to menu | P0 | B-06 | Mirrors game over layout |
| B-08 | Slow/pause normal spawns during active boss fight | P1 | B-02, S-01 | Focus on boss encounter |
| B-09 | Procedural mini-boss / boss sprites in TextureGenerator | P0 | A-01 | Readable LTTP-style silhouettes |

**Phase 6b gate:** Survive to 30:00, beat boss, see victory screen.

---

## Phase 7 — Upgrade Content Expansion

After core loop works, add variety.

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| U-01 | Implement UP-01 through UP-08 from REQUIREMENTS | P1 | P-08 | All 8 functional |
| U-02 | Orbiting blade passive weapon | P1 | P-08 | Damages nearby enemies on tick |
| U-03 | Multi-projectile spread pattern | P1 | P-08 | Arcane Bolt upgrade visible |
| U-04 | Pierce — projectile hits N enemies | P1 | P-08 | Line through crowd |
| U-05 | Upgrade rarity weights (common vs rare) | P2 | P-06 | Rare upgrades appear less |

---

## Phase 8 — Audio

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| AUD-01 | `AudioManager` service — play/stop music, play SFX | P1 | — | Centralized, mute-safe |
| AUD-02 | Gameplay chiptune loop (procedural Web Audio or small generated buffer) | P1 | AUD-01 | Loops seamlessly in GameScene |
| AUD-03 | SFX: hit, kill, player hurt, projectile | P1 | AUD-01, C-01 | Plays on events |
| AUD-04 | SFX: level up, upgrade pick, pause open/close | P1 | AUD-01, P-07 | UI feedback |
| AUD-05 | SFX: mini-boss spawn, main boss spawn, victory fanfare | P1 | AUD-01, B-01 | Boss milestones feel big |
| AUD-06 | SFX: XP collect, vacuum item activate | P2 | AUD-01, P-03b | Subtle pickup feedback |
| AUD-07 | Menu music (optional reuse gameplay track) | P2 | AUD-02 | Main menu not silent |

**Phase 8 gate:** Game feels alive with music and combat SFX.

---

## Phase 9 — Hardening & Polish

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| H-01 | Refactor `GameScene` — extract systems (reduce god-scene) | P1 | P-05, W-05 | Scene < 200 lines, logic in services |
| H-02 | Update ARCHITECTURE.md to match final structure | P1 | H-01 | Docs accurate |
| H-03 | Smoke test: boot → menu → game → level-up → pause → death → menu | P1 | P-07, PAU-02 | Manual checklist passes |
| H-04 | Smoke test: survive to 30:00 → boss → victory → menu | P1 | B-07 | Win path works |
| H-05 | Performance: object pooling for projectiles, gems, particles | P2 | P-02 | Stable FPS with 50+ enemies |
| H-06 | Deploy and verify GitHack URL | P1 | H-03 | Playable in browser |

---

## Recommended Implementation Order

```
Phase 0 (docs) ──► Phase 1 (world) ──► Phase 3 (timer)
                         │                    │
                         ▼                    ▼
                   Phase 2 (art)        Phase 4 (hit feel)
                         │                    │
                         └────────┬───────────┘
                                  ▼
                         Phase 4b (collision)
                                  │
                                  ▼
                            Phase 5 (XP/levels/vacuum)
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
              Phase 5b (pause)  Phase 6     Phase 8 (audio)
              (pause menu)   (spawn dir)   (can parallel)
                    │             │
                    └──────┬──────┘
                           ▼
                    Phase 6b (bosses/victory)
                           │
                           ▼
                    Phase 7 (upgrade content)
                           │
                           ▼
                    Phase 9 (hardening)
```

**Suggested first coding sprint:**
1. W-01 → W-06 (playable large map)
2. T-01 → T-04 (timer)
3. C-01 → C-04 (enemy hit reactions)
4. A-01 → A-03 (LTTP art pass in parallel)

**Second sprint:** Phase 5 + Phase 5b (XP loop + pause menu)

**Third sprint:** Phase 6 + Phase 6b (spawn curve + bosses + victory)

**Fourth sprint:** Phase 8 (audio) + Phase 9 (hardening)

---

## Task Count Summary

| Phase | Tasks | P0 tasks |
|-------|-------|----------|
| 0 Documentation | 4 | 3 |
| 1 World | 9 | 6 |
| 2 Art | 7 | 4 |
| 3 Timer | 5 | 4 |
| 4 Combat feel | 7 | 4 |
| 4b Collision | 5 | 4 |
| 5 VS progression | 12 | 9 |
| 5b Pause menu | 5 | 4 |
| 6 Spawn director | 5 | 1 |
| 6b Bosses & victory | 9 | 6 |
| 7 Upgrade content | 5 | 0 |
| 8 Audio | 7 | 0 |
| 9 Hardening | 6 | 0 |
| **Total** | **86** | **45** |

---

## Out of Scope for Current Task List

- Save / meta-progression between runs
- Multiple levels (Level 2, 3, …) — **deferred after Milestone B**
- Mobile virtual joystick
- External sprite assets / Tiled editor pipeline
- Full inventory / LTTP item system

These become post–Milestone B work once Eldergrove level is complete.
