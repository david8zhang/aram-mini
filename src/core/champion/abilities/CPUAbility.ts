import { Champion } from '../Champion'

export interface CPUAbility {
  triggerCPUAbility(target?: Champion): void
}
