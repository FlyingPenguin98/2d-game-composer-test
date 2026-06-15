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
| W-01 | Add `WorldConfig` constants (world px size, tile dimensions) | P0 | DOC | Constants in `GameConfig.js` or new file |
| W-02 | Create `WorldMap` class — 2D tile index array, deterministic LTTP-style layout | P0 | W-01 | Map data is fixed seed, not per-frame random |
| W-03 | Render world tilemap from `WorldMap` using existing tileset frames | P0 | W-02 | All tiles visible when camera pans |
| W-04 | Camera follow player with lerp; clamp to world bounds | P0 | W-03 | No black void at edges |
| W-05 | Move player/enemy/projectile coords to world space (not screen space) | P0 | W-04 | Entities stay correct while scrolling |
| W-06 | Update `Enemy.spawnAtEdge` → spawn outside camera, inside world | P0 | W-05 | Enemies appear off-screen relative to camera |
| W-07 | Add collision layer (blocked tiles: trees, cliffs, water) | P1 | W-02 | Player cannot walk through solids |
| W-08 | Place tree/bush props from map data (not hardcoded spots) | P1 | W-02 | Props match collision |
| W-09 | Set player spawn point in map data | P1 | W-02 | Consistent start position |

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
| T-01 | Create `RunState` service (elapsed ms, start/stop/reset) | P0 | W-05 | Single source of truth per run |
| T-02 | HUD timer display `MM:SS` (updates every frame or 100ms) | P0 | T-01 | Visible during gameplay |
| T-03 | Reset timer on new run / scene restart | P0 | T-01 | Always starts 0:00 |
| T-04 | Show timer on game over summary | P0 | T-01 | Persists final value after death |
| T-05 | Feed timer into spawn difficulty (see Phase 5) | P1 | T-01, S-01 | Difficulty uses time, not only kills |

**Phase 3 gate:** Timer accurate, visible, survives until game over.

---

## Phase 4 — Combat Impact (Enemy Hit Reactions)

Address user feedback before or in parallel with Phase 5.

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| C-01 | Add enemy hit state machine: `idle → hit → idle` or `dead` | P0 | — | State blocks normal AI during hit |
| C-02 | Enemy hit animation frames (recoil/squash) in `TextureGenerator` | P0 | C-01 | Visible frame change, not just tint |
| C-03 | Knockback impulse away from projectile direction | P0 | C-01 | Enemy visibly pushed |
| C-04 | Hit-stun duration (~100ms) — zero velocity during stun | P0 | C-01 | Enemy pauses briefly |
| C-05 | Stronger hit particles + optional damage number popup | P1 | C-01 | Impact readable at glance |
| C-06 | Micro hit-stop on kill (1 frame, configurable) | P2 | C-01 | Subtle VS-style punch |
| C-07 | Camera shake on kill (small amplitude) | P2 | C-01 | Optional, not nauseating |

**Phase 4 gate:** Every hit on enemy shows knockback + animation; kills feel distinct from chip damage.

---

## Phase 5 — Vampire Survivors Progression Core

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| P-01 | `RunState` fields: xp, level, xpToNext, upgrades[] | P0 | T-01 | State resets each run |
| P-02 | XP gem entity — drops on enemy death, idle on ground | P0 | C-01 | Gem spawns at corpse position |
| P-03 | XP collection on overlap (+ magnet radius from player) | P0 | P-02 | Bar fills when collected |
| P-04 | XP bar + level number in HUD | P0 | P-01 | Always visible |
| P-05 | Level-up trigger when xp >= xpToNext | P0 | P-01 | Pauses game (`physics.pause`) |
| P-06 | `UpgradeRegistry` — data file with all upgrade defs | P0 | — | At least 6 upgrades defined |
| P-07 | Level-up UI — 3 random choices, SNES window | P0 | P-05, P-06 | Keyboard 1/2/3 + click |
| P-08 | Apply upgrade effects to player stats / attack pattern | P0 | P-07 | Each upgrade measurably works |
| P-09 | XP curve formula (level 1→2 fast, scales up) | P1 | P-01 | Tuned so ~5 min = level 5-ish |
| P-10 | Game over shows level + XP + time + kills | P1 | P-01, T-04 | Full run summary |

**Phase 5 gate:** Full VS loop — kill → XP → level → pick upgrade → stronger → survive longer.

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

## Phase 8 — Hardening & Polish

| ID | Task | Priority | Deps | Acceptance criteria |
|----|------|----------|------|---------------------|
| H-01 | Refactor `GameScene` — extract systems (reduce god-scene) | P1 | P-05, W-05 | Scene < 200 lines, logic in services |
| H-02 | Update ARCHITECTURE.md to match final structure | P1 | H-01 | Docs accurate |
| H-03 | Smoke test: boot → menu → game → level-up → death → menu | P1 | P-07 | Manual test checklist passes |
| H-04 | Fix ESC during level-up (should not skip menu accidentally) | P1 | P-07 | Pause behavior documented |
| H-05 | Performance: object pooling for projectiles, gems, particles | P2 | P-02 | Stable FPS with 50+ enemies |
| H-06 | Deploy and verify GitHack URL | P1 | H-03 | Playable on mobile browser |

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
                            Phase 5 (XP/levels)
                                  │
                                  ▼
                            Phase 6 (spawn director)
                                  │
                                  ▼
                         Phase 7 (upgrade content)
                                  │
                                  ▼
                         Phase 8 (hardening)
```

**Suggested first coding sprint (after doc gate):**
1. W-01 → W-06 (playable large map)
2. T-01 → T-04 (timer)
3. C-01 → C-04 (enemy hit reactions)
4. A-01 → A-03 (LTTP art pass in parallel)

Then Phase 5 (full VS progression).

---

## Task Count Summary

| Phase | Tasks | P0 tasks |
|-------|-------|----------|
| 0 Documentation | 4 | 3 |
| 1 World | 9 | 6 |
| 2 Art | 7 | 4 |
| 3 Timer | 5 | 4 |
| 4 Combat feel | 7 | 4 |
| 5 VS progression | 10 | 8 |
| 6 Spawn director | 5 | 1 |
| 7 Upgrade content | 5 | 0 |
| 8 Hardening | 6 | 0 |
| **Total** | **58** | **30** |

---

## Out of Scope for Current Task List

- Audio system
- Save / meta-progression
- Boss encounters
- Mobile virtual joystick
- External sprite assets / Tiled editor pipeline

These can become Phase 9+ after MVP milestone in REQUIREMENTS §14 is met.
