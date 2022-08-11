import { BehaviorStatus } from './BehaviorStatus'
import { BehaviorTreeNode } from './BehaviorTreeNode'

export class SelectorNode extends BehaviorTreeNode {
  public optionA: BehaviorTreeNode
  public optionB: BehaviorTreeNode
  constructor(name: string, optionA: BehaviorTreeNode, optionB: BehaviorTreeNode) {
    super(name)
    this.optionA = optionA
    this.optionB = optionB
  }

  public process(): BehaviorStatus {
    const status = this.optionA.process()
    if (status === BehaviorStatus.FAILURE) {
      return this.optionB.process()
    }
    return status
  }
}
