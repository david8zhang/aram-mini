import { Game } from '~/scenes/Game'
import { Champion } from './champion/Champion'
import { Minion } from './minion/Minion'

export interface Entity {
  sprite: Phaser.Physics.Arcade.Sprite
}

export interface ProjectileConfig {
  position: {
    x: number
    y: number
  }
  texture: string
  target?: Entity
  staticTarget?: {
    x: number
    y: number
  }
  speed: number
  scale?: number
  rotation?: number
  onOverlapFn?: Function
  bodyConfig?: {
    scaleX: number
    scaleY: number
  }
}

export class Projectile {
  private game: Game
  public target: Entity | null = null
  public staticTarget: { x: number; y: number } | null = null

  public sprite: Phaser.Physics.Arcade.Sprite
  public speed: number = 200
  public destroyCallback: Function | null = null
  public onOverlapFn: Function | null = null

  constructor(game: Game, config: ProjectileConfig) {
    this.game = game
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
    this.sprite.setScale(config.scale ? config.scale : 1)
    this.sprite.setData('ref', this)
    if (config.bodyConfig) {
      this.sprite.body.setSize(
        this.sprite.body.width * config.bodyConfig.scaleX,
        this.sprite.body.width * config.bodyConfig.scaleY
      )
    }

    if (config.onOverlapFn) {
      this.onOverlapFn = config.onOverlapFn
    }
    if (config.rotation) {
      this.sprite.setRotation(config.rotation)
    }
    if (config.target) {
      this.target = config.target
    }
    if (config.staticTarget) {
      this.staticTarget = config.staticTarget
    }
    this.speed = config.speed
  }

  isAtMoveTarget() {
    if (!this.staticTarget && !this.target) {
      return false
    }
    let target: any = {}
    if (this.target) {
      target = this.target.sprite
    } else if (this.staticTarget) {
      target = this.staticTarget
    }
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, target.x, target.y) <= 5
  }

  moveToTarget() {
    if (!this.staticTarget && !this.target) {
      return false
    }
    let target: any = {}
    if (this.target) {
      target = this.target.sprite
    } else if (this.staticTarget) {
      target = this.staticTarget
    }
    let angle = Phaser.Math.Angle.BetweenPoints(
      {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      {
        x: target.x,
        y: target.y,
      }
    )
    const velocityVector = new Phaser.Math.Vector2()
    this.game.physics.velocityFromRotation(angle, this.speed, velocityVector)
    this.sprite.setVelocity(velocityVector.x, velocityVector.y)
  }

  handleOverlap(target: Minion | Champion) {
    if (this.onOverlapFn) {
      this.onOverlapFn(target)
    }
  }

  update() {
    if (this.isAtMoveTarget()) {
      this.destroy()
    } else {
      this.moveToTarget()
    }
  }

  destroy() {
    if (this.destroyCallback) {
      this.destroyCallback()
    }
    this.sprite.destroy()
  }
}
