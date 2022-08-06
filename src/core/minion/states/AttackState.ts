import { State } from '~/core/StateMachine'
import { Tower } from '~/core/tower/Tower'
import { Minion } from '../Minion'
import { MinionStates } from './MinionStates'

export class AttackState extends State {
  public attackTarget: Minion | Tower | null = null
  public lastAttackedTimestamp: number = 0

  enter(minion: Minion) {
    const detectedEntities = minion.getDetectedEnemies()
    const detectedTowers = minion.getDetectedTowers().filter((entity) => {
      const tower = entity as Tower
      return tower.getHealth() > 0
    })

    if (detectedTowers.length > 0) {
      this.attackTarget = detectedTowers[0] as Tower
    } else if (detectedEntities.length > 0) {
      this.attackTarget = detectedEntities[
        Phaser.Math.Between(0, detectedEntities.length)
      ] as Minion
    }
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
