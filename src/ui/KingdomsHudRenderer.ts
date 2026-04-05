// Stub — real implementation provided by hedgeKingdoms KingdomsHudRenderer unit
import Phaser from 'phaser';
import type { WaveState } from '@/defense/WaveManager';
import type { DefenderInfo } from '@/defense/DefenderCombatSystem';

export class KingdomsHudRenderer {
  private scene: Phaser.Scene;
  private banner: Phaser.GameObjects.Text | null = null;
  private subBanner: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  getAllObjects(): Phaser.GameObjects.GameObject[] {
    const out: Phaser.GameObjects.GameObject[] = [];
    if (this.banner) out.push(this.banner);
    if (this.subBanner) out.push(this.subBanner);
    return out;
  }

  setVisible(_visible: boolean): void {}

  update(
    _waveState: WaveState,
    _defenders: DefenderInfo[],
    _delta: number,
  ): void {}

  showWaveClear(_waveNum: number): void {}

  showGameOver(_wavesReached: number): void {}

  showBattleAlert(_active: boolean): void {}

  showVictory(wavesCompleted: number): void {
    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height / 2;

    this.banner?.destroy();
    this.subBanner?.destroy();

    this.banner = this.scene.add.text(cx, cy - 20, '\u2694 THE HEDGE STANDS \u2694', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#ffcc40',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

    this.subBanner = this.scene.add.text(
      cx,
      cy + 24,
      `${wavesCompleted} waves repelled \u2014 press R to return to menu`,
      {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#d4c9a8',
      },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
  }
}
