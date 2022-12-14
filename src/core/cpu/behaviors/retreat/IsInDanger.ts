import { Champion } from '~/core/champion/Champion'
import { Minion } from '~/core/minion/Minion'
import { Tower } from '~/core/tower/Tower'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { BlackboardKeys } from '../BlackboardKeys'

export class IsInDanger extends BehaviorTreeNode {
  public static ATTACK_RANGE_BUFFER = 50

  constructor(blackboard: Blackboard) {
    super('IsInDanger', blackboard)
  }

  public process(): BehaviorStatus {
    return this.isTargetedByEnemyTower() ||
      this.isInRangeOfEnemyChampion() ||
      this.isInRangeOfEnemyMinions()
      ? BehaviorStatus.SUCCESS
      : BehaviorStatus.FAILURE
  }

  isProtectedByFriendlyTower(): boolean {
    let friendlyTowers = this.blackboard.getData(BlackboardKeys.FRIENDLY_TOWERS) as Tower[]
    friendlyTowers = friendlyTowers.filter((tower: Tower) => {
      return !tower.isDead
    })
    if (friendlyTowers.length === 0) {
      return false
    }
    const { closestTower, distance } = this.getClosestTowerAndDistance(friendlyTowers)
    return distance <= closestTower.attackRange - IsInDanger.ATTACK_RANGE_BUFFER
  }

  public getClosestTowerAndDistance(towers: Tower[]) {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    let minDistance = Number.MAX_SAFE_INTEGER
    let closestTower = towers[0]
    towers.forEach((t: Tower) => {
      const distanceBetweenTowerAndChampion = Phaser.Math.Distance.Between(
        champion.sprite.x,
        champion.sprite.y,
        t.sprite.x,
        t.sprite.y
      )
      if (distanceBetweenTowerAndChampion < minDistance) {
        minDistance = distanceBetweenTowerAndChampion
        closestTower = t
      }
    })
    return { closestTower, distance: minDistance }
  }

  isTargetedByEnemyTower(): boolean {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const enemyTowerList = this.blackboard.getData(BlackboardKeys.ENEMY_TOWERS) as Tower[]
    if (enemyTowerList && enemyTowerList.length > 0) {
      for (let i = 0; i < enemyTowerList.length; i++) {
        const enemyTower = enemyTowerList[i]
        if (!enemyTower.isDead && enemyTower.attackTarget === champion) {
          return true
        }
      }
    }
    return false
  }

  isInRangeOfEnemyMinions(): boolean {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const enemyMinions = this.blackboard.getData(BlackboardKeys.ENEMY_MINIONS) as Minion[]
    for (let i = 0; i < enemyMinions.length; i++) {
      const minion = enemyMinions[i]
      const distanceToChampion = Phaser.Math.Distance.Between(
        champion.sprite.x,
        champion.sprite.y,
        minion.sprite.x,
        minion.sprite.y
      )
      if (distanceToChampion <= minion.attackRange + IsInDanger.ATTACK_RANGE_BUFFER) {
        return true
      }
    }
    return false
  }

  isInRangeOfEnemyChampion(): boolean {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const enemyChampionList = this.blackboard.getData(BlackboardKeys.ENEMY_CHAMPIONS) as Champion[]
    if (enemyChampionList && enemyChampionList.length > 0) {
      for (let i = 0; i < enemyChampionList.length; i++) {
        const enemyChampion = enemyChampionList[i]
        if (!enemyChampion.isDead) {
          const distanceToEnemyChampion = Phaser.Math.Distance.Between(
            champion.sprite.x,
            champion.sprite.y,
            enemyChampion.sprite.x,
            enemyChampion.sprite.y
          )
          if (
            distanceToEnemyChampion <=
            enemyChampion.attackRange + IsInDanger.ATTACK_RANGE_BUFFER
          ) {
            return true
          }
        }
      }
    }
    return false
  }
}
