import { Champion } from '~/core/champion/Champion'
import { State } from '~/core/StateMachine'
import { Tower } from '~/core/tower/Tower'
import { Minion } from '../Minion'
import { MinionStates } from './MinionStates'

export class AttackState extends State {
  public lastAttackedTimestamp: number = 0
  execute(minion: Minion) {
    minion.stop()
    if (!this.isTargetAttackable(minion, minion.attackTarget!)) {
      console.log('no target to attack!')
      minion.attackTarget = null
      minion.stateMachine.transition(MinionStates.MOVE)
    } else {
      const currTimestamp = Date.now()
      if (currTimestamp - this.lastAttackedTimestamp > 1000) {
        this.lastAttackedTimestamp = currTimestamp
        minion.attack(minion.attackTarget!)
      }
    }
  }

  isTargetAttackable(minion: Minion, attackTarget: Minion | Champion | Tower) {
    const isWithinRange =
      Phaser.Math.Distance.Between(
        minion.sprite.x,
        minion.sprite.y,
        attackTarget.sprite.x,
        attackTarget.sprite.y
      ) <= minion.attackRange
    return isWithinRange && attackTarget.sprite.active && attackTarget.getHealth() > 0
  }
}
