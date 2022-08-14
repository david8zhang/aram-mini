import { Champion } from '~/core/champion/Champion'
import { Minion } from '~/core/minion/Minion'
import { Tower } from '~/core/tower/Tower'
import { Constants } from '~/utils/Constants'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class CheckTowerVulnerable extends BehaviorTreeNode {
  private static FRIENDLY_MINIONS_ATTACKING_THRESHOLD = 2
  private static LOWER_TOWER_HEALTH_THRESHOLD = Constants.CHAMPION_DAMAGE * 3

  constructor(blackboard: Blackboard) {
    super('CheckTowerVulnerable', blackboard)
  }
  public process(): BehaviorStatus {
    const targetTower = this.blackboard.getData(BlackboardKeys.TARGET_TOWER) as Tower
    if (!targetTower) {
      return BehaviorStatus.FAILURE
    }
    const friendlyMinionTargetingCondition =
      this.getNumFriendlyMinionsTargetingTower(targetTower) >=
      CheckTowerVulnerable.FRIENDLY_MINIONS_ATTACKING_THRESHOLD

    const towerHealthBelowThreshold =
      targetTower.getHealth() <= CheckTowerVulnerable.LOWER_TOWER_HEALTH_THRESHOLD

    if (towerHealthBelowThreshold || friendlyMinionTargetingCondition) {
      return BehaviorStatus.SUCCESS
    }
    return BehaviorStatus.FAILURE
  }

  private getNumFriendlyMinionsTargetingTower(tower: Tower): number {
    const friendlyMinions = this.blackboard.getData(BlackboardKeys.FRIENDLY_MINIONS) as Minion[]
    let numMinionsTargeting = 0
    friendlyMinions.forEach((minion: Minion) => {
      if (minion.attackTarget === tower) {
        numMinionsTargeting++
      }
    })
    return numMinionsTargeting
  }
}
