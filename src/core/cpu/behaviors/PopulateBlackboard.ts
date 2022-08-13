import { Side } from '~/utils/Side'
import { BehaviorStatus } from '../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../behavior-tree/Blackboard'
import { CPU } from '../CPU'
import { BlackboardKeys } from './BlackboardKeys'

export class PopulateBlackboard extends BehaviorTreeNode {
  private cpu: CPU
  constructor(name: string, blackboard: Blackboard, cpu: CPU) {
    super(name, blackboard)
    this.cpu = cpu
  }

  public process(): BehaviorStatus {
    const game = this.cpu.game
    const enemyChampions = this.cpu.side === Side.RIGHT ? game.leftChampions : game.rightChampions
    const enemyTowers = this.cpu.side === Side.RIGHT ? game.leftTowers : game.rightTowers
    const champion = this.cpu.champion
    this.blackboard.setData(BlackboardKeys.ENEMY_CHAMPIONS, enemyChampions)
    this.blackboard.setData(BlackboardKeys.ENEMY_TOWERS, enemyTowers)
    this.blackboard.setData(BlackboardKeys.CHAMPION, champion)
    this.blackboard.setData(BlackboardKeys.SIDE, this.cpu.side)
    return BehaviorStatus.SUCCESS
  }
}
