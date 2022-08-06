import { Minion } from '~/core/minion/Minion'
import { State } from '~/core/StateMachine'
import { Tower } from '../Tower'
import { TowerStates } from './TowerStates'

export class IdleState extends State {
  execute(tower: Tower) {
    const detectedMinions = tower.getDetectedEnemyMinions()
    if (detectedMinions.length > 0) {
      const attackTarget = detectedMinions[
        Phaser.Math.Between(0, detectedMinions.length - 1)
      ] as Minion
      tower.attackTarget = attackTarget
      tower.stateMachine.transition(TowerStates.ATTACK)
    }
  }
}
