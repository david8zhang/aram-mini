import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { CPU } from '../../CPU'

export class MarkCompletedOncePerSpawn extends BehaviorTreeNode {
  public cpu: CPU
  constructor(blackboard: Blackboard, cpu: CPU) {
    super('MarkCompletedOncePerSpawn', blackboard)
    this.cpu = cpu
  }

  public process(): BehaviorStatus {
    this.cpu.didCompleteOnSpawn = true
    return BehaviorStatus.SUCCESS
  }
}
