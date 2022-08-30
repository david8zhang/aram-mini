import { Game } from '~/scenes/Game'

export class CooldownTimer {
  private game: Game

  public isInCooldown: boolean = false
  public secondsUntilCooldownExpires: number = 0
  public cooldownTime: number

  constructor(game: Game, cooldownTime: number) {
    this.game = game
    this.cooldownTime = cooldownTime
  }

  startAbilityCooldown() {
    this.isInCooldown = true
    this.secondsUntilCooldownExpires = this.cooldownTime
    const cooldownEvent = this.game.time.addEvent({
      delay: 1000,
      callback: () => {
        this.secondsUntilCooldownExpires--
        if (this.secondsUntilCooldownExpires === 0) {
          this.isInCooldown = false
          cooldownEvent.remove()
        }
      },
      repeat: -1,
    })
  }
}
