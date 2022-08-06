import { Champion } from '~/core/champion/Champion'
import { State } from '~/core/StateMachine'
import { Tower } from '~/core/tower/Tower'
import { Minion } from '../Minion'
import { MinionStates } from './MinionStates'

export class MoveState extends State {
  execute(minion: Minion) {
    if (minion.isAtMoveTarget()) {
      minion.destroy()
    } else {
      const detectedEnemies = minion.getDetectedEnemies() as Minion[]
      const detectedTowers = minion.getDetectedTowers() as Tower[]
      const detectedChampions = minion.getDetectedChampions() as Champion[]

      if (detectedEnemies.length > 0 || detectedTowers.length > 0 || detectedChampions.length > 0) {
        this.selectAttackTarget(minion, detectedEnemies, detectedTowers, detectedChampions)
        minion.stateMachine.transition(MinionStates.ATTACK)
      } else {
        minion.moveToTarget()
      }
    }
  }

  selectAttackTarget(
    minion: Minion,
    enemyMinions: Minion[],
    towers: Tower[],
    champions: Champion[]
  ) {
    if (champions.length > 0) {
      minion.attackTarget = champions[Phaser.Math.Between(0, champions.length - 1)]
    } else if (towers.length > 0) {
      minion.attackTarget = towers[0]
    } else if (enemyMinions.length > 0) {
      minion.attackTarget = enemyMinions[Phaser.Math.Between(0, enemyMinions.length - 1)]
    }
  }
}
