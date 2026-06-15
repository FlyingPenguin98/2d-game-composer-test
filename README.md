# Eldergrove — Fantasy HD-2D Top-Down Game

A top-down fantasy action game with an HD-2D inspired art style — pixel art sprites with dynamic lighting, shadows, and particle effects.

## Features

- **Main Menu** — Start a new game from a fantasy-themed title screen
- **Player Character** — A mage who walks with WASD/arrow keys and auto-fires arcane bolts at nearby enemies
- **Three Enemy Types** — Slimes, skeletons, and wisps that chase the player
- **HD-2D Visuals** — Dynamic lighting, shadows, glow effects, and ambient particles

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| ESC | Return to main menu |
| R | Retry after game over |

## Tech Stack

- [Phaser 3](https://phaser.io/) — Game engine
- [Vite](https://vitejs.dev/) — Dev server and bundler
- Procedural pixel-art textures generated at runtime

## Build

```bash
npm run build
npm run preview
```
