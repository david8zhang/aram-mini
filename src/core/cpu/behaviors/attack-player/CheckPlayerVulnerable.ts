import { Champion } from '~/core/champion/Champion'
import { Tower } from '~/core/tower/Tower'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class CheckPlayerVulnerable extends BehaviorTreeNode {
  constructor(name: string, blackboard: Blackboard) {
    super(name, blackboard)
  }

  public process(): BehaviorStatus {
    const targetCandidates = this.blackboard.getData(BlackboardKeys.TARGET_CHAMPION_CANDIDATES)
    const targetTowers: Tower[] = this.blackboard.getData(BlackboardKeys.ENEMY_TOWERS) as Tower[]
    const activeTowers = targetTowers.filter((tower) => {
      return !tower.isDead
    })
    if (activeTowers.length === 0) {
      return BehaviorStatus.SUCCESS
    }
    // Is the champion within range of one of their own towers
    const newTargetCandidates = targetCandidates.filter((c) => {
      return !this.isInRangeOfFriendlyTower(c, activeTowers)
    })
    this.blackboard.setData(BlackboardKeys.TARGET_CHAMPION_CANDIDATES, newTargetCandidates)
    return newTargetCandidates.length > 0 ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }

  public isInRangeOfFriendlyTower(champion: Champion, towers: Tower[]): boolean {
    for (let i = 0; i < towers.length; i++) {
      const tower = towers[i]
      const distanceToTower = Phaser.Math.Distance.Between(
        champion.sprite.x,
        champion.sprite.y,
        tower.sprite.x,
        tower.sprite.y
      )
      if (distanceToTower <= tower.attackRange) {
        return true
      }
    }
    return false
  }
}
