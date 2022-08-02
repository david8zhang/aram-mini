import { State } from '~/core/StateMachine'
import { Minion } from '../Minion'
import { MinionStates } from './MinionStates'

export class AttackState extends State {
  public attackTarget: Minion | null = null
  public lastAttackedTimestamp: number = 0

  enter(minion: Minion) {
    const detectedEntities = minion.getDetectedEnemies()
    this.attackTarget = detectedEntities[Phaser.Math.Between(0, detectedEntities.length)] as Minion
  }

  execute(minion: Minion) {
    minion.stop()
    if (this.attackTarget) {
      if (!this.attackTarget.sprite.active || this.attackTarget.getHealth() === 0) {
        this.attackTarget = null
      } else {
        const currTimestamp = Date.now()
        if (currTimestamp - this.lastAttackedTimestamp > 1000) {
          this.lastAttackedTimestamp = currTimestamp
          minion.attack(this.attackTarget)
        }
      }
    } else {
      minion.stateMachine.transition(MinionStates.MOVE)
    }
  }
}
