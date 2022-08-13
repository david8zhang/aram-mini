import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class MoveTowardsBase extends BehaviorTreeNode {
  constructor(name: string, blackboard: Blackboard) {
    super(name, blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const baseLocation =
      this.blackboard.getData(BlackboardKeys.SIDE) == Side.LEFT
        ? Constants.LEFT_NEXUS_SPAWN
        : Constants.RIGHT_NEXUS_SPAWN
    if (
      champion.moveTarget &&
      champion.moveTarget.x == baseLocation.x &&
      champion.moveTarget.y == baseLocation.y &&
      champion.stateMachine.getState() === ChampionStates.MOVE
    ) {
      return BehaviorStatus.RUNNING
    } else {
      champion.setMoveTarget(baseLocation.x, baseLocation.y)
      champion.stateMachine.transition(ChampionStates.MOVE)
      return BehaviorStatus.SUCCESS
    }
  }
}
