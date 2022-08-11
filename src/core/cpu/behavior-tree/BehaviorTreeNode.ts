import { BehaviorStatus } from './BehaviorStatus'

export abstract class BehaviorTreeNode {
  public name: string
  constructor(name: string) {
    this.name = name
  }

  public abstract process(): BehaviorStatus
}
