import { Champion } from '~/core/champion/Champion'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class HasEnoughHealth extends BehaviorTreeNode {
  public static readonly LOW_HEALTH_THRESHOLD = 0.35

  constructor(blackboard: Blackboard) {
    super('HasEnoughHealth', blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const healthThresholdAmount = Math.round(
      champion.getTotalHealth() * HasEnoughHealth.LOW_HEALTH_THRESHOLD
    )
    if (champion.getHealth() <= healthThresholdAmount) {
      return BehaviorStatus.FAILURE
    } else {
      return BehaviorStatus.SUCCESS
    }
  }
}
