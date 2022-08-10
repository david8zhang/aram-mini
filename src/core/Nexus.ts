import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { HealthBar } from './ui/Healthbar'

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
  public healthBar: HealthBar
  public _isTargetable: boolean = false
  public onDestroyCallback: Function = () => {}

  constructor(game: Game, config: NexusConfig) {
    this.game = game
    this.side = config.side
    this.onDestroyCallback = config.onDestroyCallback

    const { position, texture, scale } = config
    this.sprite = this.game.physics.add.sprite(position.x, position.y, texture)
    this.sprite.setScale(scale ? scale : 1)
    this.healthBar = new HealthBar(this.game, {
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
  }

  getHealth() {
    return this.healthBar.currValue
  }
}