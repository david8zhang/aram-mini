import { State } from '~/core/StateMachine'
import { Minion } from '../Minion'
import { MinionStates } from './MinionStates'

export class AttackState extends State {
  public lastAttackedTimestamp: number = 0
  execute(minion: Minion) {
    minion.stop()
    if (minion.attackTarget) {
      if (!minion.attackTarget.sprite.active || minion.attackTarget.getHealth() === 0) {
        minion.attackTarget = null
      } else {
        const currTimestamp = Date.now()
        if (currTimestamp - this.lastAttackedTimestamp > 1000) {
          this.lastAttackedTimestamp = currTimestamp
          minion.attack(minion.attackTarget)
        }
      }
    } else {
      minion.stateMachine.transition(MinionStates.MOVE)
    }
  }
}
