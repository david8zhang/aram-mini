import { Game } from '~/scenes/Game'
import { Champion } from '../Champion'
import { Ability } from './Ability'

export class AxeSpin implements Ability {
  public game: Game
  public champion: Champion

  public isTargetingMode: boolean = false
  public mouseTriggered: boolean = false
  public iconTexture: string = 'axe'
  public key!: Phaser.Input.Keyboard.Key | null

  public secondsUntilCooldownExpires: number = 0
  public isInCooldown: boolean = false
  public isTriggeringAbility: boolean = false

  // Graphics
  public axeSprite: Phaser.Physics.Arcade.Sprite
  public slashArc: Phaser.GameObjects.Arc

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
    }

    // Set up slash path arc
    this.slashArc = this.game.add
      .circle(this.champion.sprite.x, this.champion.sprite.y, 50)
      .setVisible(false)
      .setStrokeStyle(20, 0xff0000)
      .setDepth(100)
      .setAlpha(0)

    // Setup axe sprite
    this.axeSprite = this.game.physics.add
      .sprite(this.champion.sprite.x, this.champion.sprite.y, 'axe')
      .setVisible(false)
      .setScale(1)
      .setDepth(100)
      .setOrigin(0.5, 3.5)
  }

  triggerAbility(): void {
    const event = this.game.time.addEvent({
      delay: 1,
      callback: () => {
        this.slashArc.setPosition(this.champion.sprite.x, this.champion.sprite.y).setVisible(true)
        this.axeSprite
          .setPosition(this.champion.sprite.x, this.champion.sprite.y)
          .setAlpha(1)
          .setVisible(true)
      },
      repeat: -1,
    })

    this.game.add.tween({
      alpha: { from: 0, to: 0.3 },
      duration: 400,
      targets: this.slashArc,
      onComplete: () => {
        this.champion.stop()
        event.destroy()
        this.game.add.tween({
          targets: this.axeSprite,
          angle: { from: 0, to: 360 },
          duration: 350,
          onStart: () => {
            console.log('Started tween!')
          },
          repeat: 0,
          onComplete: () => {
            this.game.add.tween({
              targets: this.slashArc,
              alpha: { from: 0.3, to: 0 },
              duration: 200,
              onComplete: () => {
                this.slashArc.setVisible(false).setAlpha(0)
              },
            })
            this.game.add.tween({
              targets: this.axeSprite,
              alpha: { from: 1, to: 0 },
              duration: 200,
              onComplete: () => {
                this.axeSprite.setVisible(false)
                this.isTriggeringAbility = false
              },
            })
          },
        })
      },
    })
  }

  handleKeyPress() {
    if (this.key && this.champion.isPlayerControlled) {
      if (this.key.isDown && !this.isTriggeringAbility) {
        this.isTriggeringAbility = true
        this.triggerAbility()
      }
    }
  }

  update() {
    this.handleKeyPress()
  }
}
