import { Nexus } from '~/core/Nexus'
import { Tower } from '~/core/tower/Tower'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class SetTargetTower extends BehaviorTreeNode {
  constructor(name: string, blackboard: Blackboard) {
    super(name, blackboard)
  }

  public process(): BehaviorStatus {
    const enemyTowers = this.blackboard.getData(BlackboardKeys.ENEMY_TOWERS)
    const activeTowers = enemyTowers.filter((tower: Tower) => {
      return !tower.isDead
    })
    if (activeTowers.length === 0) {
      return BehaviorStatus.FAILURE
    }
    const sortedByDistance = activeTowers.sort((a: Tower, b: Tower) => {
      return this.getDistanceToNexus(a) - this.getDistanceToNexus(b)
    })
    this.blackboard.setData(BlackboardKeys.TARGET_TOWER, sortedByDistance[0])
    return BehaviorStatus.SUCCESS
  }

  getDistanceToNexus(tower: Tower) {
    const nexus = this.blackboard.getData(BlackboardKeys.NEXUS) as Nexus
    return Phaser.Math.Distance.Between(
      tower.sprite.x,
      tower.sprite.y,
      nexus.sprite.x,
      nexus.sprite.y
    )
  }
}
