import { Champion } from '~/core/champion/Champion'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class CheckPlayerLowHealth extends BehaviorTreeNode {
  public static LOW_HEALTH_THRESHOLD = 0.5

  constructor(name: string, blackboard: Blackboard) {
    super(name, blackboard)
  }

  public process(): BehaviorStatus {
    const targetCandidates = this.blackboard.getData(BlackboardKeys.TARGET_CHAMPION_CANDIDATES)
    const newTargetCandidates = targetCandidates.filter((candidate: Champion) => {
      const lowHealthThresholdAbsolute =
        candidate.getTotalHealth() * CheckPlayerLowHealth.LOW_HEALTH_THRESHOLD
      return candidate.getHealth() <= lowHealthThresholdAbsolute
    })
    this.blackboard.setData(BlackboardKeys.TARGET_CHAMPION_CANDIDATES, newTargetCandidates)
    return newTargetCandidates.length > 0 ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
