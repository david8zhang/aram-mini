import { Minion } from '~/core/minion/Minion'
import { Champion } from '../Champion'

export interface TrackingAbility {
  abilityRange: number
  abilityTargetEntity: Champion | Minion | null
  isInRange(): boolean
  triggerAbilityTowardsTarget(target: Champion | Minion, onCompleteCallback: Function | null): void
}
