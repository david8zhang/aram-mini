import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class TargetPlayer extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('TargetPlayer', blackboard)
  }

  public process(): BehaviorStatus {
    const targetCandidates = this.blackboard.getData(BlackboardKeys.TARGET_CHAMPION_CANDIDATES)
    if (targetCandidates.length === 0) {
      return BehaviorStatus.FAILURE
    }
    const prioritizedCandidates = targetCandidates.sort((a, b) => {
      return a.getHealth() - b.getHealth()
    })
    this.blackboard.setData(BlackboardKeys.TARGET_CHAMPION, prioritizedCandidates[0])
    return BehaviorStatus.SUCCESS
  }
}
