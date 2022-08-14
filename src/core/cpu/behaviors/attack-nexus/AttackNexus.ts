import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { Nexus } from '~/core/Nexus'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class AttackNexus extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('AttackNexus', blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const enemyNexus = this.blackboard.getData(BlackboardKeys.ENEMY_NEXUS) as Nexus
    champion.attackTarget = enemyNexus
    champion.stateMachine.transition(ChampionStates.ATTACK)
    return BehaviorStatus.SUCCESS
  }
}
