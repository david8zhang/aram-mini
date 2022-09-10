import { Ability } from '~/core/champion/abilities/Ability'
import { CPUAbility } from '~/core/champion/abilities/CPUAbility'
import { Champion } from '~/core/champion/Champion'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class UseAbility extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('useAbility', blackboard)
  }

  public process(): BehaviorStatus {
    const targetAbility = this.blackboard.getData(BlackboardKeys.ABILITY_TO_USE) as CPUAbility
    const targetPlayer = this.blackboard.getData(BlackboardKeys.TARGET_CHAMPION) as Champion
    if (!targetAbility || !targetPlayer) {
      return BehaviorStatus.FAILURE
    }
    targetAbility.triggerCPUAbility(targetPlayer)
    return BehaviorStatus.SUCCESS
  }
}
