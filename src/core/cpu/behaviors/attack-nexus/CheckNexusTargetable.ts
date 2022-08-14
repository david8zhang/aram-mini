import { Nexus } from '~/core/Nexus'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class CheckNexusTargetable extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('CheckNexusTargetable', blackboard)
  }

  public process(): BehaviorStatus {
    const enemyNexus = this.blackboard.getData(BlackboardKeys.ENEMY_NEXUS) as Nexus
    return enemyNexus.isTargetable ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
