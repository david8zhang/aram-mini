import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { Minion } from '~/core/minion/Minion'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class AttackMinion extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('AttackMinion', blackboard)
  }

  public process(): BehaviorStatus {
    const targetMinion = this.blackboard.getData(BlackboardKeys.TARGET_MINION) as Minion
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    if (!targetMinion) {
      return BehaviorStatus.FAILURE
    }
    champion.attackTarget = targetMinion
    champion.stateMachine.transition(ChampionStates.ATTACK)
    return BehaviorStatus.SUCCESS
  }
}
