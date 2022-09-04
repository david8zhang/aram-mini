import { State } from '~/core/StateMachine'
import { Champion } from '../Champion'
import { ChampionStates } from './ChampionStates'

export class TrackingAbilityMove extends State {
  public isTriggeringAbility: boolean = false

  enter() {
    this.isTriggeringAbility = false
  }

  execute(champion: Champion) {
    const trackingAbility = champion.trackingAbility
    if (trackingAbility) {
      if (trackingAbility.abilityTargetEntity && !trackingAbility.isInRange()) {
        champion.handleMovementToPoint(trackingAbility.abilityTargetEntity.sprite)
      } else {
        champion.stop()
        if (trackingAbility.abilityTargetEntity && !this.isTriggeringAbility) {
          this.isTriggeringAbility = true
          trackingAbility.triggerAbilityTowardsTarget(trackingAbility.abilityTargetEntity, () => {
            champion.stateMachine.transition(ChampionStates.IDLE)
          })
        }
      }
    }
  }
}
