import { Champion } from '~/core/champion/Champion'
import { BehaviorStatus } from '../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../behavior-tree/Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class HasEnoughHealth extends BehaviorTreeNode {
  public static HEALTH_THRESHOLD = 0.5

  constructor(name: string, blackboard: Blackboard) {
    super(name, blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const healthThresholdAbsolute = champion.getTotalHealth() * HasEnoughHealth.HEALTH_THRESHOLD
    if (champion.getHealth() >= healthThresholdAbsolute) {
      return BehaviorStatus.SUCCESS
    }
    return BehaviorStatus.FAILURE
  }
}
