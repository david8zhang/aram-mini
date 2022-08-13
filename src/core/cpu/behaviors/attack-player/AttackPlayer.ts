import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class AttackPlayer extends BehaviorTreeNode {
  constructor(name: string, blackboard: Blackboard) {
    super(name, blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const targetChampion = this.blackboard.getData(BlackboardKeys.TARGET_CHAMPION) as Champion
    if (!targetChampion) {
      return BehaviorStatus.FAILURE
    } else {
      champion.attackTarget = targetChampion
      champion.stateMachine.transition(ChampionStates.ATTACK)
      return BehaviorStatus.SUCCESS
    }
  }
}
