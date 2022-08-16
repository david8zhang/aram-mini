import { Champion } from '~/core/champion/Champion'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class CheckIsDead extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('CheckIsDead', blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    return champion.isDead ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE
  }
}
