import { State } from '~/core/StateMachine'
import { Game } from '~/scenes/Game'
import { Minion } from '../Minion'
import { MinionStates } from './MinionStates'

export class StunnedState extends State {
  public timestampSinceFirstStunned = 0
  public stunDuration = 2000
  public stunText!: Phaser.GameObjects.Text
  public prevState!: MinionStates

  enter(minion: Minion, game: Game, duration: number, prevState: MinionStates) {
    this.prevState = prevState
    this.stunDuration = duration
    if (!this.stunText) {
      this.stunText = game.add
        .text(minion.sprite.x, minion.sprite.y - minion.sprite.displayHeight, 'Stunned!', {
          fontSize: '10px',
          color: 'white',
        })
        .setDepth(1000)
      if (minion.cleanupOnDestroy) {
        minion.cleanupOnDestroy.push(this.stunText)
      }
    }
    this.timestampSinceFirstStunned = Date.now()
  }

  execute(minion: Minion) {
    if (this.stunText) {
      this.stunText.setVisible(true)
      this.stunText.setPosition(
        minion.sprite.x - this.stunText.displayWidth / 2,
        minion.sprite.y - minion.sprite.displayHeight - 10
      )
    }
    minion.sprite.setVelocity(0)
    minion.sprite.setTint(0xffff00)
    const currTimestamp = Date.now()
    if (currTimestamp - this.timestampSinceFirstStunned > this.stunDuration) {
      if (this.stunText) {
        this.stunText.setVisible(false)
      }
      minion.sprite.clearTint()
      minion.stateMachine.transition(this.prevState)
    }
  }
}
