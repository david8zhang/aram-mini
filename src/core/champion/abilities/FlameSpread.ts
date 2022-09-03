import { Game } from '~/scenes/Game'
import { Champion } from '../Champion'
import { Ability } from './Ability'

export class FlameSpread implements Ability {
  game: Game
  champion: Champion

  public key!: Phaser.Input.Keyboard.Key | null
  public mouseTriggered: boolean = false
  public isTargetingMode: boolean = false
  public targetingCursor: Phaser.GameObjects.Sprite

  public iconTexture: string = ''

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    }
    this.targetingCursor = this.game.add
      .sprite(0, 0, 'targeting-cursor')
      .setVisible(false)
      .setDepth(1000)
  }

  public get isInCooldown() {
    return false
  }

  public get secondsUntilCooldownExpires() {
    return 0
  }

  public canTriggerAbility(): boolean {
    return true
  }

  setupMouseClickListener() {
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.mouseTriggered = true
          this.targetingCursor.setVisible(false)
          this.triggerAbility()
        }
      }
    })
  }

  handleKeyPress() {
    if (this.key && this.champion.isPlayerControlled) {
      if (this.key.isDown && !this.mouseTriggered) {
        if (this.canTriggerAbility()) {
          this.isTargetingMode = true
        }
      } else if (this.key.isUp) {
        this.mouseTriggered = false
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.targetingCursor.setVisible(false)
          this.triggerAbility()
        }
      }
    }
  }

  renderTargetingUI() {
    if (this.isTargetingMode) {
      this.game.hideCursor()
      this.targetingCursor.setVisible(true)
      this.targetingCursor.setPosition(
        this.game.input.mousePointer.worldX,
        this.game.input.mousePointer.worldY
      )
    } else {
      this.game.showCursor()
    }
  }

  triggerAbility(): void {}

  update(): void {
    this.renderTargetingUI()
    this.handleKeyPress()
  }
}
