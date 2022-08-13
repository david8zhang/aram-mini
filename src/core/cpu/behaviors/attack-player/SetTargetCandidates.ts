import { Champion } from '~/core/champion/Champion'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class SetTargetCandidates extends BehaviorTreeNode {
  constructor(name: string, blackboard: Blackboard) {
    super(name, blackboard)
  }

  public process(): BehaviorStatus {
    const enemyChampions = this.blackboard.getData(BlackboardKeys.ENEMY_CHAMPIONS) as Champion[]
    this.blackboard.setData(BlackboardKeys.TARGET_CHAMPION_CANDIDATES, enemyChampions)
    return BehaviorStatus.SUCCESS
  }
}
