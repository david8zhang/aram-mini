import { Ability } from '~/core/champion/abilities/Ability'
import { CPUAbility } from '~/core/champion/abilities/CPUAbility'
import { Champion } from '~/core/champion/Champion'
import { BehaviorStatus } from '../../behavior-tree/BehaviorStatus'
import { BehaviorTreeNode } from '../../behavior-tree/BehaviorTreeNode'
import { Blackboard } from '../../behavior-tree/Blackboard'
import { CPU } from '../../CPU'
import { BlackboardKeys } from '../BlackboardKeys'

export class SelectAbility extends BehaviorTreeNode {
  private cpu: CPU
  private static readonly ABILITY_USE_COOLDOWN: number = 1000
  constructor(blackboard: Blackboard, cpu: CPU) {
    super('SelectAbility', blackboard)
    this.cpu = cpu
  }

  public process(): BehaviorStatus {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const targetChampion = this.blackboard.getData(BlackboardKeys.TARGET_CHAMPION) as Champion

    const useableAbilities = champion.getAbilities().filter((ability: Ability) => {
      return (
        ability.canTriggerAbility() &&
        this.isInRangeOfAbility(ability, targetChampion) &&
        this.isCPUAbility(ability)
      )
    })
    const currTimestamp = Date.now()
    if (
      useableAbilities.length === 0 ||
      currTimestamp - this.cpu.lastUsedAbilityTimestamp < SelectAbility.ABILITY_USE_COOLDOWN
    ) {
      return BehaviorStatus.FAILURE
    }
    this.cpu.lastUsedAbilityTimestamp = currTimestamp
    const randomAbility = useableAbilities[Phaser.Math.Between(0, useableAbilities.length - 1)]
    this.blackboard.setData(BlackboardKeys.ABILITY_TO_USE, randomAbility)
    return BehaviorStatus.SUCCESS
  }

  public isInRangeOfAbility(ability: Ability, targetChampion: Champion) {
    const champion = this.blackboard.getData(BlackboardKeys.CHAMPION) as Champion
    const distanceToTargetChampion = Phaser.Math.Distance.Between(
      champion.sprite.x,
      champion.sprite.y,
      targetChampion.sprite.x,
      targetChampion.sprite.y
    )
    return distanceToTargetChampion <= ability.abilityRange
  }

  public isCPUAbility(ability: Ability) {
    return (ability as unknown as CPUAbility).triggerCPUAbility
  }
}
