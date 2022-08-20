import { Game } from '~/scenes/Game'
import { Champion } from '../Champion'

export class Fireball {
  private game: Game
  private champion: Champion
  private targetPoint: { x: number; y: number } | null = null
  public isTargetingMode: boolean = false
  public key!: Phaser.Input.Keyboard.Key | null

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
    }
  }

  handleKeyPress() {
    if (this.key && this.champion.isPlayerControlled) {
      if (this.key.isDown) {
        this.isTargetingMode = true
        console.log('Pressing Q key!')
      } else {
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          console.log('Let Go of Q Key')
        }
      }
    }
  }

  update() {
    this.handleKeyPress()
  }
}
