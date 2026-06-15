import { xpToReachNextLevel } from '../config/GameConfig.js';

/** Per-run state — timer, score, kills, XP, level, upgrades. */
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

    this.xp = 0;
    this.level = 1;
    this.xpToNext = xpToReachNextLevel(this.level);
    this.upgrades = [];
    this.pendingLevelUps = 0;
  }

  update(delta) {
    if (this.outcome !== 'playing' || this.isPaused) return;
    this.elapsedMs += delta;
  }

  addKill(points) {
    this.kills += 1;
    this.score += points;
  }

  addXp(amount) {
    this.xp += amount;
    this.processLevelUps();
  }

  /** Consume XP thresholds; queue level-ups for the picker. */
  processLevelUps() {
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = xpToReachNextLevel(this.level);
      this.pendingLevelUps += 1;
    }
  }

  recordUpgrade(upgradeId) {
    this.upgrades.push(upgradeId);
    this.pendingLevelUps = Math.max(0, this.pendingLevelUps - 1);
  }

  getUpgradeRank(upgradeId) {
    return this.upgrades.filter((id) => id === upgradeId).length;
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
