import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { UIValueBar } from './ui/UIValueBar'

export interface NexusConfig {
  side: Side
  position: {
    x: number
    y: number
  }
  scale?: number
  texture: string
  onDestroyCallback: Function
}

export class Nexus {
  private game: Game
  public side: Side
  public sprite: Phaser.Physics.Arcade.Sprite
  public healthBar: UIValueBar
  public _isTargetable: boolean = false
  public onDestroyCallback: Function = () => {}
  public shouldShowHoverOutline: boolean = true

  constructor(game: Game, config: NexusConfig) {
    this.game = game
    this.side = config.side
    this.onDestroyCallback = config.onDestroyCallback

    const { position, texture, scale } = config
    this.sprite = this.game.physics.add.sprite(position.x, position.y, texture).setDepth(100)
    this.sprite.setScale(scale ? scale : 1)

    this.sprite
      .setInteractive()
      .on('pointerover', () => {
        if (this.shouldShowHoverOutline) {
          this.game.postFxPlugin.add(this.sprite, {
            thickness: 2,
            outlineColor: this.side === Side.LEFT ? Constants.LEFT_COLOR : Constants.RIGHT_COLOR,
          })
        }
      })
      .on('pointerout', () => {
        if (this.shouldShowHoverOutline) {
          this.game.postFxPlugin.remove(this.sprite)
        }
      })

    this.healthBar = new UIValueBar(this.game, {
      x: this.sprite.x - this.sprite.displayWidth / 2,
      y: this.sprite.y - this.sprite.displayHeight / 2 - 5,
      maxValue: Constants.NEXUS_HEALTH,
      height: 4,
      width: this.sprite.displayWidth,
      borderWidth: 1,
      fillColor: this.side === Side.LEFT ? Constants.LEFT_COLOR : Constants.RIGHT_COLOR,
    })
    this.healthBar.setVisible(false)
  }

  setIsTargetable(isTargetable: boolean) {
    this.healthBar.setVisible(isTargetable)
    this._isTargetable = isTargetable
  }

  public get isTargetable() {
    return this._isTargetable && !this.isDead
  }

  public get isDead() {
    return this.healthBar.currValue <= 0
  }

  destroy() {
    this.sprite.destroy()
    this.healthBar.setVisible(false)
    this.onDestroyCallback()
  }

  takeDamage(damage: number) {
    this.healthBar.decrease(damage)
    if (this.healthBar.currValue == 0) {
      this.destroy()
    }
  }

  getHealth() {
    return this.healthBar.currValue
  }
}
