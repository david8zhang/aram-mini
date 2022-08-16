import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class HandleDeath extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('HandleDeath', blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    if (champion.stateMachine.getState() === ChampionStates.DEAD) {
      return BehaviorStatus.RUNNING
    } else {
      champion.stateMachine.transition(ChampionStates.DEAD)
      return BehaviorStatus.SUCCESS
    }
  }
}
