import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class MoveToStartPosition extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('MoveToStartPosition', blackboard)
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const startPosition =
      this.blackboard.getData(BlackboardKeys.SIDE) === Side.RIGHT
        ? Constants.RIGHT_STARTING_POSITION
        : Constants.LEFT_STARTING_POSITION
    champion.setMoveTarget(startPosition.x, startPosition.y)
    if (champion.stateMachine.getState() === ChampionStates.MOVE) {
      if (!champion.isAtMoveTarget(startPosition)) {
        return BehaviorStatus.RUNNING
      } else {
        champion.stop()
        return BehaviorStatus.SUCCESS
      }
    } else {
      champion.stateMachine.transition(ChampionStates.MOVE)
      return BehaviorStatus.RUNNING
    }
  }
}
