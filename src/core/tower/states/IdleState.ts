import { Champion } from '~/core/champion/Champion'
import { Minion } from '~/core/minion/Minion'
import { State } from '~/core/StateMachine'
import { Tower } from '../Tower'
import { TowerStates } from './TowerStates'

export class IdleState extends State {
  execute(tower: Tower) {
    const detectedMinions = tower.getDetectedEnemyMinions() as Minion[]
    const detectedChampions = tower.getDetectedEnemyChampions() as Champion[]
    if (detectedMinions.length > 0 || detectedChampions.length > 0) {
      this.selectAttackTarget(tower, detectedMinions, detectedChampions)
      tower.stateMachine.transition(TowerStates.ATTACK)
    }
  }

  selectAttackTarget(tower: Tower, minions: Minion[], champions: Champion[]) {
    if (minions.length > 0) {
      tower.attackTarget = minions[Phaser.Math.Between(0, minions.length - 1)]
    } else if (champions.length > 0) {
      tower.attackTarget = champions[Phaser.Math.Between(0, champions.length - 1)]
      tower.updateTargetingLineToChampion(tower.attackTarget as Champion)
    }
  }
}
