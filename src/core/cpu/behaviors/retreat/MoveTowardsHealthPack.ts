import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { HealthRelic } from '~/core/HealthRelic'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class MoveTowardsHealthPack extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('MoveTowardsHealthPack', blackboard)
  }

  public process(): BehaviorStatus {
    const targetHealthPack = this.blackboard.getData(
      BlackboardKeys.TARGET_HEALTH_PACK
    ) as HealthRelic
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    if (!targetHealthPack) {
      return BehaviorStatus.FAILURE
    }
    if (targetHealthPack.isInCooldown) {
      this.blackboard.setData(BlackboardKeys.TARGET_HEALTH_PACK, null)
      return BehaviorStatus.SUCCESS
    } else if (
      champion.moveTarget &&
      champion.moveTarget.x == targetHealthPack.sprite.x &&
      champion.moveTarget.y == targetHealthPack.sprite.y &&
      champion.stateMachine.getState() === ChampionStates.MOVE
    ) {
      return BehaviorStatus.RUNNING
    } else {
      champion.setMoveTarget(targetHealthPack.sprite.x, targetHealthPack.sprite.y)
      champion.stateMachine.transition(ChampionStates.MOVE)
      return BehaviorStatus.SUCCESS
    }
  }
}
