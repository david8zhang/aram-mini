import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class Idle extends BehaviorTreeNode {
  constructor(name: string, blackboard: Blackboard) {
    super(name, blackboard)
  }
  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    champion.moveTarget = null
    champion.stateMachine.transition(ChampionStates.IDLE)
    return BehaviorStatus.SUCCESS
  }
}
