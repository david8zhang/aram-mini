import { State } from '~/core/StateMachine'
import { Tower } from '../Tower'
import { TowerStates } from './TowerStates'

export class AttackState extends State {
  public lastAttackedTimestamp: number = 0

  execute(tower: Tower) {
    const attackTarget = tower.attackTarget!
    if (!attackTarget.sprite.active || attackTarget.getHealth() === 0) {
      tower.attackTarget = null
      tower.stateMachine.transition(TowerStates.IDLE)
    } else {
      const currTimestamp = Date.now()
      if (currTimestamp - this.lastAttackedTimestamp > 1000) {
        this.lastAttackedTimestamp = currTimestamp
        tower.attack(attackTarget)
      }
    }
  }
}
