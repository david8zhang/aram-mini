import { State } from '~/core/StateMachine'
import { Champion } from '../Champion'
import { ChampionStates } from './ChampionStates'

export class AbilityMoveState extends State {
  public isTriggeringAbility: boolean = false

  enter() {
    this.isTriggeringAbility = false
  }

  execute(champion: Champion) {
    const abilityWithRange = champion.abilityWithRange
    if (abilityWithRange) {
      if (abilityWithRange.abilityTarget && !abilityWithRange.isInRange()) {
        champion.handleMovementToPoint(abilityWithRange.abilityTarget)
      } else {
        champion.stop()
        if (abilityWithRange.abilityTarget && !this.isTriggeringAbility) {
          this.isTriggeringAbility = true
          abilityWithRange.triggerAbilityAtPosition(abilityWithRange.abilityTarget, () => {
            champion.stateMachine.transition(ChampionStates.IDLE)
          })
        }
      }
    }
  }
}
