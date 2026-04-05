// Stub — real implementation provided by hedgeKingdoms KingdomsHudRenderer unit
import Phaser from 'phaser';
import type { WaveState } from '@/defense/WaveManager';
import type { DefenderInfo } from '@/defense/DefenderCombatSystem';

export class KingdomsHudRenderer {
  constructor(_scene: Phaser.Scene) {}

  getAllObjects(): Phaser.GameObjects.GameObject[] { return []; }

  setVisible(_visible: boolean): void {}

  update(
    _waveState: WaveState,
    _defenders: DefenderInfo[],
    _delta: number,
  ): void {}

  showWaveClear(_waveNum: number): void {}

  showGameOver(_wavesReached: number): void {}

  showBattleAlert(_active: boolean): void {}
}
