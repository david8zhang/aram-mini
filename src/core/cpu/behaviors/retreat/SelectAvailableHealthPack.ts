import { Champion } from '~/core/champion/Champion'
import { HealthRelic } from '~/core/HealthRelic'
import { Side } from '~/utils/Side'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class SelectAvailableHealthPack extends BehaviorTreeNode {
  public static DISTANCE_THRESHOLD = 100

  constructor(blackboard: Blackboard) {
    super('IsHealthPackAvailable', blackboard)
  }

  public process(): BehaviorStatus {
    const targetHealthPack = this.blackboard.getData(
      BlackboardKeys.TARGET_HEALTH_PACK
    ) as HealthRelic
    if (targetHealthPack) {
      return BehaviorStatus.SUCCESS
    }
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const healthPacks = champion.game.healthRelics
    const healthPacksWithinDistance = healthPacks.filter((healthPack: HealthRelic) => {
      const distanceToHealthPack = Phaser.Math.Distance.Between(
        champion.sprite.x,
        champion.sprite.y,
        healthPack.sprite.x,
        healthPack.sprite.y
      )
      return (
        (!healthPack.isInCooldown &&
          distanceToHealthPack <= SelectAvailableHealthPack.DISTANCE_THRESHOLD) ||
        healthPack.side === champion.side
      )
    })
    if (healthPacksWithinDistance.length === 0) {
      return BehaviorStatus.FAILURE
    }
    this.blackboard.setData(BlackboardKeys.TARGET_HEALTH_PACK, healthPacksWithinDistance[0])
    return BehaviorStatus.SUCCESS
  }
}
