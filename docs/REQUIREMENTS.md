# Eldergrove — Requirements Document

> Living document capturing everything agreed so far. Update this when scope changes.

## 1. Vision

A **top-down 2D fantasy action game** with a **SNES / 16-bit pixel art** aesthetic. The player explores a grove, fights approaching enemies, and survives escalating waves.

---

## 2. Art Style (current)

| Requirement | Status |
|---|---|
| SNES-era 16×16 tile grid | ✅ Implemented |
| Limited color palettes (FF6 / LTTP / DQ inspired) | ✅ Implemented |
| 1px black outlines on sprites | ✅ Implemented |
| Bayer dithering on tiles | ✅ Implemented |
| No HD-2D effects (dynamic lighting, bloom, glow) | ✅ Removed |
| FF6-style blue menu windows | ✅ Implemented |
| Pixel monospace font (Courier New, resolution 2) | ✅ Implemented |
| 4-direction walk animations for hero | ✅ Implemented |
| Enemy bounce/flap animations (slime, bat) | ✅ Implemented |

### Sprites & tiles
- **Hero**: Green-tunic swordsman, 16×16, 4 dirs × 2 walk frames
- **Enemies**: Slime (DQ-style), Skeleton, Bat
- **Tiles**: Grass (2 variants), flowers, dark grass, dirt, stone, path, trunk, bush, canopy, water
- **UI**: Heart containers, SNES window boxes, score counter

---

## 3. Gameplay (current)

| Requirement | Status |
|---|---|
| Main menu with "Start New Game" | ✅ Implemented |
| Player walks with WASD / arrow keys | ✅ Implemented |
| Player auto-attacks nearest enemy in range | ✅ Implemented |
| Enemies spawn at screen edges and chase player | ✅ Implemented |
| Three enemy types with different stats | ✅ Implemented |
| Contact damage with brief invincibility | ✅ Implemented |
| Score increases on kills | ✅ Implemented |
| Difficulty ramps (spawn interval decreases) | ✅ Implemented |
| Game over screen with retry / menu | ✅ Implemented |
| ESC returns to main menu | ✅ Implemented |

### Not yet implemented (open)
- Manual aiming / attack button
- Sound effects and music
- Multiple levels or world map
- Save / continue
- Touch / mobile controls
- Boss enemies
- Items, loot, or XP progression
- NPCs or story dialogue

---

## 4. Technical Requirements

| Requirement | Status |
|---|---|
| Runs in browser (Phaser 3 + Vite) | ✅ |
| Procedural pixel art (no external asset files) | ✅ |
| Deployable via GitHub Pages / GitHack | ✅ |
| Pixel-perfect rendering (`pixelArt: true`, no antialias) | ✅ |
| 960×640 resolution, scale-to-fit | ✅ |
| Assets bootstrapped once, verified before scenes load | ✅ (AssetService) |
| Safe scene transitions (no stuck black screen) | ✅ (SceneTransition) |
| Scene shutdown cleans up input listeners | ✅ |

---

## 5. Controls

| Input | Action |
|---|---|
| WASD / Arrow keys | Move |
| (automatic) | Attack nearest enemy |
| ESC | Main menu |
| R | Retry after game over |

---

## 6. Deployment

```bash
npm install && npm run dev     # local
npm run build                  # production build
```

| URL | Purpose |
|---|---|
| `https://flyingpenguin98.github.io/2d-game-composer-test/` | GitHub Pages |
| `https://raw.githack.com/FlyingPenguin98/2d-game-composer-test/gh-pages/index.html` | GitHack mirror |

---

## 7. Known Issues / Tech Debt

- [ ] No automated tests
- [ ] Phaser bundle > 500 KB (no code splitting)
- [ ] Courier New is a fallback, not a true bitmap SNES font
- [ ] Water tiles exist but aren't animated yet
- [ ] No tile collision (player walks through trees)

---

## 8. Open Questions (for product owner)

1. **Combat**: Keep auto-attack, or add manual aim (mouse / spacebar)?
2. **Setting**: Stay in "Eldergrove" forest, or add dungeon/town areas?
3. **Progression**: Endless survival, or level-based with win condition?
4. **Audio**: Chiptune music priority? SFX for hits, menu, death?
5. **Mobile**: Should touch virtual joystick be supported?
6. **Story**: Any narrative framing (intro text, NPC dialogue) desired?
7. **Art direction**: Closer to Zelda LTTP, FF6, or Dragon Quest specifically?
