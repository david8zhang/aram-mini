import { State } from '~/core/StateMachine'
import { Game } from '~/scenes/Game'
import { Champion } from '../Champion'
import { ChampionStates } from './ChampionStates'

export class StunnedState extends State {
  public timestampSinceFirstStunned = 0
  public stunDuration = 2000
  public stunText!: Phaser.GameObjects.Text
  public prevState!: ChampionStates

  enter(champion: Champion, game: Game, duration: number, prevState: ChampionStates) {
    this.prevState = prevState
    this.stunDuration = duration
    if (!this.stunText || !this.stunText.active) {
      this.stunText = game.add
        .text(champion.sprite.x, champion.sprite.y - champion.sprite.displayHeight, 'Stunned!', {
          fontSize: '10px',
          color: 'white',
        })
        .setDepth(1000)
    }
    this.timestampSinceFirstStunned = Date.now()
  }

  execute(champion: Champion) {
    if (this.stunText) {
      this.stunText.setVisible(true)
      this.stunText.setPosition(
        champion.sprite.x - this.stunText.displayWidth / 2,
        champion.sprite.y - champion.sprite.displayHeight - 10
      )
    }
    champion.sprite.setVelocity(0)
    champion.sprite.setTint(0xffea00)
    const currTimestamp = Date.now()
    if (currTimestamp - this.timestampSinceFirstStunned > this.stunDuration) {
      if (this.stunText) {
        this.stunText.setVisible(false)
      }
      champion.sprite.clearTint()
      champion.stateMachine.transition(ChampionStates.IDLE)
    }
  }

  exit(champion: Champion) {
    champion.sprite.clearTint()
    if (this.stunText) {
      this.stunText.destroy()
    }
  }
}
