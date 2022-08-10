import { State } from '~/core/StateMachine'
import { Constants } from '~/utils/Constants'
import { Champion } from '../Champion'
import { ChampionStates } from './ChampionStates'

export class AttackState extends State {
  public lastAttackedTimestamp: number = 0

  execute(champion: Champion) {
    if (!champion.attackTarget) {
      champion.stateMachine.transition(ChampionStates.IDLE)
    } else {
      if (this.isAttackTargetOutOfRange(champion)) {
        champion.handleMovementToPoint(champion.attackTarget!.sprite)
      } else {
        const currTime = Date.now()
        champion.sprite.setVelocity(0, 0)
        if (currTime - this.lastAttackedTimestamp > Constants.CHAMPION_ATTACK_DELAY) {
          this.lastAttackedTimestamp = currTime
          champion.attack()
        }
      }
    }
  }

  isAttackTargetOutOfRange(champion: Champion) {
    const attackTarget = champion.attackTarget
    if (attackTarget) {
      const distanceToAttackTarget = Phaser.Math.Distance.Between(
        champion.sprite.x,
        champion.sprite.y,
        attackTarget.sprite.x,
        attackTarget.sprite.y
      )
      return distanceToAttackTarget > Constants.CHAMPION_ATTACK_RANGE
    }
    return false
  }
}
