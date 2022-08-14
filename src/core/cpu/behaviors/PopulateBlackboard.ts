import { Minion } from '~/core/minion/Minion'
import { Side } from '~/utils/Side'
import { BehaviorStatus } from '../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../behavior-tree/Blackboard'
import { CPU } from '../CPU'
import { BlackboardKeys } from './BlackboardKeys'

export class PopulateBlackboard extends BehaviorTreeNode {
  private cpu: CPU
  constructor(blackboard: Blackboard, cpu: CPU) {
    super('PopulateBlackboard', blackboard)
    this.cpu = cpu
  }

  public process(): BehaviorStatus {
    const game = this.cpu.game
    const enemyChampions = this.cpu.side === Side.RIGHT ? game.leftChampions : game.rightChampions
    const enemyTowers = this.cpu.side === Side.RIGHT ? game.leftTowers : game.rightTowers
    const enemyMinions =
      this.cpu.side === Side.RIGHT
        ? game.leftMinionSpawner.minions
        : game.rightMinionSpawner.minions
    const friendlyMinions =
      this.cpu.side === Side.RIGHT
        ? game.rightMinionSpawner.minions
        : game.leftMinionSpawner.minions
    const nexus = this.cpu.side === Side.RIGHT ? game.rightNexus : game.leftNexus
    const enemyNexus = this.cpu.side === Side.RIGHT ? game.leftNexus : game.rightNexus

    const champion = this.cpu.champion
    this.blackboard.setData(BlackboardKeys.ENEMY_MINIONS, this.parseMinions(enemyMinions))
    this.blackboard.setData(BlackboardKeys.FRIENDLY_MINIONS, this.parseMinions(friendlyMinions))
    this.blackboard.setData(BlackboardKeys.ENEMY_CHAMPIONS, enemyChampions)
    this.blackboard.setData(BlackboardKeys.ENEMY_TOWERS, enemyTowers)
    this.blackboard.setData(BlackboardKeys.CHAMPION, champion)
    this.blackboard.setData(BlackboardKeys.SIDE, this.cpu.side)
    this.blackboard.setData(BlackboardKeys.NEXUS, nexus)
    this.blackboard.setData(BlackboardKeys.ENEMY_NEXUS, enemyNexus)
    return BehaviorStatus.SUCCESS
  }

  parseMinions(minionGroup: Phaser.GameObjects.Group): Minion[] {
    return minionGroup.children.entries.map((m) => {
      return m.getData('ref') as Minion
    })
  }
}
