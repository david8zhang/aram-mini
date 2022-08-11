import { BehaviorTreeNode } from './BehaviorTreeNode'
import { Blackboard } from './Blackboard'

export class BehaviorTree {
  public root: BehaviorTreeNode
  public blackboard: Blackboard

  constructor(root: BehaviorTreeNode) {
    this.root = root
    this.blackboard = new Blackboard()
  }

  public addDataToBlackboard(key: string, data: any) {
    this.blackboard.setData(key, data)
  }

  public retrieveDataFromBlackboard(key: string, data: any) {
    this.blackboard.setData(key, data)
  }
}
