import { Game } from '~/scenes/Game'
import { Champion } from '../Champion'

export interface Ability {
  game: Game
  champion: Champion
  iconTexture: string
  triggerAbility(): void
}
