import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { CPU } from '../../CPU'
import { BlackboardKeys } from '../BlackboardKeys'

export class CheckCompletedOncePerSpawn extends BehaviorTreeNode {
  private cpu: CPU
  constructor(blackboard: Blackboard, cpu: CPU) {
    super('CheckCompletedOncePerSpawn', blackboard)
    this.cpu = cpu
  }

  public process(): BehaviorStatus {
    return this.cpu.didCompleteOnSpawn ? BehaviorStatus.FAILURE : BehaviorStatus.SUCCESS
  }
}
