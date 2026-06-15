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

## Play Online (Any Device)

After the deploy workflow runs (triggered automatically on push), you can play on any phone, tablet, or PC:

| Service | URL |
|---------|-----|
| **GitHub Pages** (recommended) | https://flyingpenguin98.github.io/2d-game-composer-test/ |
| **GitHack** (instant mirror) | https://raw.githack.com/FlyingPenguin98/2d-game-composer-test/gh-pages/index.html |

GitHack re-serves the built files from the `gh-pages` branch with correct MIME types, so it works great for quick mobile testing without waiting for GitHub Pages to update.

### One-time setup

In the repo go to **Settings → Pages → Build and deployment → Source** and select **Deploy from a branch**, then choose the **`gh-pages`** branch and **`/ (root)`**. The GitHub Action creates and updates that branch automatically on every push.

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
