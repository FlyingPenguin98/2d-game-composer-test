import { WAVES } from '../config/GameConfig.js';

/** Per-run state — timer, score, kills, outcome. */
export class RunState {
  constructor() {
    this.reset();
  }

  reset() {
    this.elapsedMs = 0;
    this.kills = 0;
    this.score = 0;
    this.outcome = 'playing';
    this.isPaused = false;
  }

  update(delta) {
    if (this.outcome !== 'playing' || this.isPaused) return;
    this.elapsedMs += delta;
  }

  addKill(points) {
    this.kills += 1;
    this.score += points;
  }

  endDefeat() {
    this.outcome = 'lost';
  }

  getFormattedTime() {
    const totalSec = Math.floor(this.elapsedMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  get elapsedSeconds() {
    return Math.floor(this.elapsedMs / 1000);
  }
}

/** Spawn interval decreases as survival time increases. */
export function getSpawnIntervalForTime(elapsedMs) {
  const minutes = elapsedMs / 60000;
  const reduction = Math.floor(minutes * 2) * 200;
  return Math.max(
    WAVES.MIN_SPAWN_INTERVAL,
    WAVES.INITIAL_SPAWN_INTERVAL - reduction
  );
}
