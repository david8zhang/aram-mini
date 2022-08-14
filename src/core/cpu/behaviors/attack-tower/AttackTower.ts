import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { Tower } from '~/core/tower/Tower'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class AttackTower extends BehaviorTreeNode {
  constructor(name: string, blackboard: Blackboard) {
    super(name, blackboard)
  }

  public process(): BehaviorStatus {
    const targetTower = this.blackboard.getData(BlackboardKeys.TARGET_TOWER) as Tower
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    if (!targetTower) {
      return BehaviorStatus.FAILURE
    }
    champion.attackTarget = targetTower
    champion.stateMachine.transition(ChampionStates.ATTACK)
    return BehaviorStatus.SUCCESS
  }
}
