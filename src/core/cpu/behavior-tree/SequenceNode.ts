import { BehaviorStatus } from './BehaviorStatus'
import { BehaviorTreeNode } from './BehaviorTreeNode'

export class SequenceNode extends BehaviorTreeNode {
  public nodes: BehaviorTreeNode[]
  constructor(name: string, nodes: BehaviorTreeNode[]) {
    super(name)
    this.nodes = nodes
  }

  public process(): BehaviorStatus {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      const status = node.process()
      if (status !== BehaviorStatus.SUCCESS) {
        return status
      }
    }
    return BehaviorStatus.SUCCESS
  }
}
