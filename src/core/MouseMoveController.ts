import { Game } from '~/scenes/Game'

export interface MouseMoveControllerConfig {
  game: Game
  sprite: Phaser.Physics.Arcade.Sprite
}

export class MouseMoveController {
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public moveTarget?: Phaser.Math.Vector2
  public moveTargetMarker?: Phaser.GameObjects.Arc

  constructor(config: MouseMoveControllerConfig) {
    this.game = config.game
    this.sprite = config.sprite
    this.setupMouseClickListener()
    this.game.updateHooks.push(() => {
      this.update()
    })
  }

  setupMouseClickListener() {
    this.game.input.mouse.disableContextMenu()
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.setMoveTarget(Math.round(pointer.worldX), Math.round(pointer.worldY))
      }
    })
  }

  setMoveTarget(x: number, y: number) {
    this.moveTarget = new Phaser.Math.Vector2(x, y)
    if (!this.moveTargetMarker) {
      this.moveTargetMarker = this.game.add.circle(x, y, 1, 0x00ff00)
    } else {
      this.moveTargetMarker.setPosition(x, y)
    }
  }

  isAtMoveTarget() {
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.moveTarget!.x,
      this.moveTarget!.y
    )
    return distance <= 5
  }

  handleMovementToPoint() {
    if (this.moveTarget && !this.isAtMoveTarget()) {
      let angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        {
          x: this.moveTarget.x,
          y: this.moveTarget.y,
        }
      )
      const velocityVector = new Phaser.Math.Vector2()
      this.game.physics.velocityFromRotation(angle, 100, velocityVector)
      this.sprite.setVelocity(velocityVector.x, velocityVector.y)
    } else {
      this.sprite.setVelocity(0, 0)
    }
  }

  update() {
    this.handleMovementToPoint()
  }
}
