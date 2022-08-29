import { Game } from '~/scenes/Game'
import { Champion } from '../Champion'

export interface Ability {
  game: Game
  champion: Champion
  iconTexture: string
  isInCooldown: boolean
  secondsUntilCooldownExpires: number
  triggerAbility(): void
  update(): void
}
