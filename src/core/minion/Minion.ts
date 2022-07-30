import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { StateMachine } from '../StateMachine'
import { AttackState } from './states/AttackState'
import { MinionStates } from './states/MinionStates'
import { MoveState } from './states/MoveState'

export interface MinionConfig {
  texture: string
  position: {
    x: number
    y: number
  }
  side: Side
  moveTarget: {
    x: number
    y: number
  }
}

export class Minion {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public moveTarget: { x: number; y: number }
  public stateMachine: StateMachine
  public side: Side

  // Detectors
  public markerRectangle!: Phaser.Geom.Rectangle
  public visionRay!: Phaser.Geom.Line

  constructor(game: Game, config: MinionConfig) {
    this.game = game
    this.side = config.side
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
    this.stateMachine = new StateMachine(
      MinionStates.MOVE,
      {
        [MinionStates.MOVE]: new MoveState(),
        [MinionStates.ATTACK]: new AttackState(),
      },
      [this]
    )
    this.game.updateHooks.push(() => {
      this.update()
    })
    this.moveTarget = config.moveTarget
    this.setupVisionDetectors()
  }

  setupVisionDetectors() {
    this.markerRectangle = new Phaser.Geom.Rectangle(
      this.sprite.x - this.sprite.body.width / 2,
      this.sprite.y - this.sprite.body.height / 2,
      this.sprite.body.width,
      this.sprite.body.height
    )
    this.visionRay = new Phaser.Geom.Line()
    const length = 20
    const angleToGoal = Phaser.Math.Angle.BetweenPoints(
      {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      {
        x: this.moveTarget.x,
        y: this.moveTarget.y,
      }
    )
    Phaser.Geom.Line.SetToAngle(this.visionRay, this.sprite.x, this.sprite.y, angleToGoal, length)
    this.game.graphics.strokeLineShape(this.visionRay)
  }

  updateVisionDetector() {
    if (this.sprite.active) {
      const length = 20
      const angleToGoal = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        {
          x: this.moveTarget.x,
          y: this.moveTarget.y,
        }
      )
      Phaser.Geom.Line.SetToAngle(this.visionRay, this.sprite.x, this.sprite.y, angleToGoal, length)
      this.game.graphics.strokeLineShape(this.visionRay)
    }
  }

  updateMarkerRectangle() {
    if (this.sprite.active) {
      this.markerRectangle.setPosition(
        this.sprite.x - this.sprite.body.width / 2,
        this.sprite.y - this.sprite.body.height / 2
      )
      this.game.graphics.strokeRectShape(this.markerRectangle)
    }
  }

  update() {
    this.stateMachine.step()
    this.updateVisionDetector()
    this.updateMarkerRectangle()
  }

  detectFriendlyStoppedInFront() {}

  detectEnemyInFront() {}

  destroy() {
    this.sprite.destroy()
  }

  setMoveTarget(moveTarget: { x: number; y: number }) {
    this.moveTarget = moveTarget
  }

  stop() {
    this.sprite.setVelocity(0, 0)
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

  moveToTarget() {
    if (this.moveTarget) {
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
      this.game.physics.velocityFromRotation(angle, Constants.MINION_MOVE_SPEED, velocityVector)
      this.sprite.setVelocity(velocityVector.x, velocityVector.y)
    }
  }
}
