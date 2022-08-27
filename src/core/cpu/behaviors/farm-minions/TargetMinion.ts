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
    const lastHittableMinions = this.filterMinionsBasedOnHealth(enemyMinions)
    if (lastHittableMinions.length == 0) {
      return BehaviorStatus.FAILURE
    }
    const sortByDistanceToFriendlyMinion = lastHittableMinions.sort((a, b) => {
      const closestFriendlyMinionDistanceA = this.getDistanceToClosestFriendlyMinion(a)
      const closestFriendlyMinionDistanceB = this.getDistanceToClosestFriendlyMinion(b)
      return closestFriendlyMinionDistanceA - closestFriendlyMinionDistanceB
    })
    this.blackboard.setData(BlackboardKeys.TARGET_MINION, sortByDistanceToFriendlyMinion[0])
    return BehaviorStatus.SUCCESS
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

  filterMinionsBasedOnHealth(minions: Minion[]): Minion[] {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    return minions.filter((m) => {
      return m.getHealth() <= champion.damage
    })
  }
}
