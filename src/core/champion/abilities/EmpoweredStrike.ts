import { Game } from '~/scenes/Game'
import { Champion } from '../Champion'
import { Ability } from './Ability'

export class EmpoweredStrike implements Ability {
  game: Game
  champion: Champion
  public iconTexture: string = ''

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
  }

  public get isInCooldown(): boolean {
    return false
  }

  public get secondsUntilCooldownExpires(): number {
    return 0
  }

  update(): void {}

  triggerAbility(): void {}
}
