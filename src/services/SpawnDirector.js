import { WAVES } from '../config/GameConfig.js';
import { Enemy } from '../entities/Enemy.js';

/** Milestone messages shown once per run. */
const MILESTONES = [
  { ms: 5 * 60 * 1000, msg: '5:00 — The horde stirs…' },
  { ms: 10 * 60 * 1000, msg: '10:00 — Dead walk faster!' },
  { ms: 15 * 60 * 1000, msg: '15:00 — Eldergrove darkens…' },
  { ms: 20 * 60 * 1000, msg: '20:00 — Relentless assault!' },
  { ms: 25 * 60 * 1000, msg: '25:00 — Hold the line!' },
];

/**
 * Time-driven spawn pressure — interval curve, enemy cap, mix weights, milestones.
 */
export class SpawnDirector {
  constructor(scene) {
    this.scene = scene;
    this.spawnTimer = 0;
    this.shownMilestones = new Set();
  }

  reset() {
    this.spawnTimer = 0;
    this.shownMilestones.clear();
  }

  update(delta, elapsedMs) {
    this.checkMilestones(elapsedMs);

    this.spawnTimer += delta;
    const interval = this.getSpawnInterval(elapsedMs);
    if (this.spawnTimer < interval) return;

    this.spawnTimer = 0;
    this.trySpawn(elapsedMs);
  }

  getSpawnInterval(elapsedMs) {
    const minutes = elapsedMs / 60000;
    const reduction = Math.floor(minutes * 2.5) * 180;
    return Math.max(
      WAVES.MIN_SPAWN_INTERVAL,
      WAVES.INITIAL_SPAWN_INTERVAL - reduction
    );
  }

  /** Max simultaneous enemies — scales gently then caps. */
  getEnemyCap(elapsedMs) {
    const minutes = elapsedMs / 60000;
    return Math.min(WAVES.MAX_ENEMIES, WAVES.BASE_ENEMY_CAP + Math.floor(minutes * 8));
  }

  /** Weighted enemy type for current survival time. */
  pickEnemyType(elapsedMs) {
    const minutes = elapsedMs / 60000;
    let slime = 0.55;
    let skeleton = 0.28;
    let bat = 0.17;

    if (minutes >= 3) {
      slime = 0.4;
      skeleton = 0.35;
      bat = 0.25;
    }
    if (minutes >= 8) {
      slime = 0.28;
      skeleton = 0.38;
      bat = 0.34;
    }
    if (minutes >= 15) {
      slime = 0.18;
      skeleton = 0.42;
      bat = 0.4;
    }

    const roll = Math.random();
    if (roll < slime) return 'slime';
    if (roll < slime + skeleton) return 'skeleton';
    return 'bat';
  }

  trySpawn(elapsedMs) {
    const scene = this.scene;
    const cap = this.getEnemyCap(elapsedMs);
    const alive = scene.enemies.countActive(true);

    if (alive >= cap) {
      this.despawnFarthest();
      if (scene.enemies.countActive(true) >= cap) return;
    }

    const typeKey = this.pickEnemyType(elapsedMs);
    Enemy.spawnOutsideCamera(scene, typeKey);
  }

  despawnFarthest() {
    const scene = this.scene;
    const px = scene.player.sprite.x;
    const py = scene.player.sprite.y;
    let farthest = null;
    let maxDist = -1;

    for (const sprite of scene.enemies.getChildren()) {
      if (!sprite.active) continue;
      const d = Phaser.Math.Distance.Squared.Between(px, py, sprite.x, sprite.y);
      if (d > maxDist) {
        maxDist = d;
        farthest = sprite;
      }
    }

    farthest?.enemyRef?.destroy();
  }

  checkMilestones(elapsedMs) {
    for (const { ms, msg } of MILESTONES) {
      if (elapsedMs >= ms && !this.shownMilestones.has(ms)) {
        this.shownMilestones.add(ms);
        this.scene.showMilestoneToast(msg);
      }
    }
  }
}
