import { Champion } from '~/core/champion/Champion'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'
import { HasEnoughHealth } from '../emergency-retreat/HasEnoughHealth'

export class ShouldGetHealthPack extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('ShouldGetHealthPack', blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const healthThresholdAmount = Math.round(
      champion.getTotalHealth() * HasEnoughHealth.LOW_HEALTH_THRESHOLD
    )
    if (champion.getHealth() <= healthThresholdAmount) {
      return BehaviorStatus.SUCCESS
    } else {
      return BehaviorStatus.FAILURE
    }
  }
}
