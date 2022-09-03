import { Game } from '~/scenes/Game'
import { Champion } from '../Champion'
import { Ability } from './Ability'

export class TrackingFirebomb implements Ability {
  game: Game
  champion: Champion

  public iconTexture: string = ''

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
  }

  public get isInCooldown() {
    return false
  }

  public get secondsUntilCooldownExpires() {
    return 0
  }

  triggerAbility(): void {}

  update(): void {
    throw new Error('Method not implemented.')
  }
}
