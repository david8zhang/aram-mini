import { Champion } from '~/core/champion/Champion'
import { Minion } from '~/core/minion/Minion'
import { Constants } from '~/utils/Constants'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class TargetMinion extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('TargetMinion', blackboard)
  }

  public process(): BehaviorStatus {
    const enemyMinions = this.blackboard.getData(BlackboardKeys.ENEMY_MINIONS) as Minion[]

    // If there are minions currently attacking this champion prioritize those, else farm the ones that are last-hittable
    const minionsAttackingThisChampion = this.getMinionsAttackingThisChampion(enemyMinions)
    if (minionsAttackingThisChampion.length > 0) {
      const closestAttackingMinion = this.getClosestMinionCustomFn(
        minionsAttackingThisChampion,
        (minion: Minion) => {
          this.getDistanceToChampion(minion)
        }
      )
      this.blackboard.setData(BlackboardKeys.TARGET_MINION, closestAttackingMinion)
      return BehaviorStatus.SUCCESS
    } else {
      const lastHittableMinions = this.filterMinionsBasedOnHealth(enemyMinions)
      if (lastHittableMinions.length == 0) {
        return BehaviorStatus.FAILURE
      }
      const closestMinionToFriendly = this.getClosestMinionCustomFn(
        lastHittableMinions,
        (minion: Minion) => {
          this.getDistanceToClosestFriendlyMinion(minion)
        }
      )
      this.blackboard.setData(BlackboardKeys.TARGET_MINION, closestMinionToFriendly)
      return BehaviorStatus.SUCCESS
    }
  }

  getClosestMinionCustomFn(minions: Minion[], sortingFn: Function) {
    let minDistance = Number.MAX_SAFE_INTEGER
    let closestMinion: Minion = minions[0]
    minions.forEach((minion: Minion) => {
      const minionDistance = sortingFn(minion)
      if (minionDistance < minDistance) {
        minDistance = minionDistance
        closestMinion = minion
      }
    })
    return closestMinion
  }

  getMinionsAttackingThisChampion(enemyMinions: Minion[]) {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    return enemyMinions.filter((minion: Minion) => {
      return minion.attackTarget === champion
    })
  }

  getDistanceToClosestFriendlyMinion(minion: Minion): number {
    const friendlyMinions = this.blackboard.getData(BlackboardKeys.FRIENDLY_MINIONS) as Minion[]
    let minDistance = Number.MAX_SAFE_INTEGER
    friendlyMinions.forEach((f) => {
      const distanceToMinion = Phaser.Math.Distance.Between(
        minion.sprite.x,
        minion.sprite.y,
        f.sprite.x,
        f.sprite.y
      )
      minDistance = Math.min(distanceToMinion, minDistance)
    })
    return minDistance
  }

  getDistanceToChampion(minion: Minion): number {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    return Phaser.Math.Distance.Between(
      champion.sprite.x,
      champion.sprite.y,
      minion.sprite.x,
      minion.sprite.y
    )
  }

  filterMinionsBasedOnHealth(minions: Minion[]): Minion[] {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    return minions.filter((m) => {
      return m.getHealth() <= champion.damage
    })
  }
}
