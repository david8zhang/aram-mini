import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { BehaviorStatus } from '../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../behavior-tree/Blackboard'
import { BlackboardKeys } from './BlackboardKeys'

export class CheckStatusEffect extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('CheckStatusEffect', blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION)
    if (champion.stateMachine.getState() === ChampionStates.STUNNED) {
      return BehaviorStatus.FAILURE
    }
    return BehaviorStatus.SUCCESS
  }
}
