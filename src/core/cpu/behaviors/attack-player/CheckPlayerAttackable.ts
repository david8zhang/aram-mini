import { Champion } from '~/core/champion/Champion'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class CheckPlayerAttackable extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('CheckPlayerAttackable', blackboard)
  }

  public process(): BehaviorStatus {
    const targetCandidates = this.blackboard.getData(
      BlackboardKeys.TARGET_CHAMPION_CANDIDATES
    ) as Champion[]
    const newTargetCandidates = targetCandidates.filter((c: Champion) => {
      return !c.isDead
    })
    this.blackboard.setData(BlackboardKeys.TARGET_CHAMPION_CANDIDATES, newTargetCandidates)
    return newTargetCandidates.length > 0 ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
