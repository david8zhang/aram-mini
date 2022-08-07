import { Champion } from '~/core/champion/Champion'
import { Minion } from '~/core/minion/Minion'
import { State } from '~/core/StateMachine'
import { Constants } from '~/utils/Constants'
import { Tower } from '../Tower'
import { TowerStates } from './TowerStates'

export class AttackState extends State {
  public lastAttackedTimestamp: number = 0

  execute(tower: Tower) {
    const attackTarget = tower.attackTarget!
    if (!this.isTargetAttackable(tower, attackTarget)) {
      tower.attackTarget = null
      tower.stateMachine.transition(TowerStates.IDLE)
    } else {
      const currTimestamp = Date.now()
      if (currTimestamp - this.lastAttackedTimestamp > Constants.TOWER_ATTACK_DELAY) {
        this.lastAttackedTimestamp = currTimestamp
        tower.attack(attackTarget)
      }
    }
  }

  isTargetAttackable(tower: Tower, attackTarget: Minion | Champion) {
    const distToTarget = Phaser.Math.Distance.Between(
      tower.sprite.x,
      tower.sprite.y,
      attackTarget.sprite.x,
      attackTarget.sprite.y
    )
    const isWithinRange = distToTarget <= tower.attackRange
    return attackTarget.sprite.active && attackTarget.getHealth() > 0 && isWithinRange
  }
}
