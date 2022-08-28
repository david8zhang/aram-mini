import { Champion } from '~/core/champion/Champion'
import { Tower } from '~/core/tower/Tower'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsSafeFromTower extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('IsSafeFromTower', blackboard)
  }

  public process(): BehaviorStatus {
    const enemyTowers = this.blackboard.getData(BlackboardKeys.ENEMY_TOWERS) as Tower[]
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    for (let i = 0; i < enemyTowers.length; i++) {
      if (!enemyTowers[i].isDead && enemyTowers[i].attackTarget === champion) {
        return BehaviorStatus.FAILURE
      }
    }
    return BehaviorStatus.SUCCESS
  }
}
