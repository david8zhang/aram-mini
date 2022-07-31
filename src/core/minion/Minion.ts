import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Projectile } from '../Projectile'
import { StateMachine } from '../StateMachine'
import { HealthBar } from '../ui/Healthbar'
import { AttackState } from './states/AttackState'
import { MinionStates } from './states/MinionStates'
import { MoveState } from './states/MoveState'
import { VisionCone } from './VisionCone'

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
  public visionCone?: VisionCone
  public markerRectangle?: Phaser.Geom.Rectangle

  public healthBar: HealthBar

  constructor(game: Game, config: MinionConfig) {
    this.game = game
    this.side = config.side
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
    this.sprite.setData('ref', this)
    this.stateMachine = new StateMachine(
      MinionStates.MOVE,
      {
        [MinionStates.MOVE]: new MoveState(),
        [MinionStates.ATTACK]: new AttackState(),
      },
      [this]
    )
    this.healthBar = new HealthBar(this.game, {
      x: this.sprite.x,
      y: this.sprite.y,
      maxValue: 50,
      height: 3,
      width: 20,
      borderWidth: 1,
    })
    this.moveTarget = config.moveTarget
    this.setupRectangleMarker()
    this.setupVisionDetectors()
  }

  setupRectangleMarker() {
    this.markerRectangle = new Phaser.Geom.Rectangle(
      this.sprite.x - this.sprite.body.width / 2,
      this.sprite.y - this.sprite.body.height / 2,
      this.sprite.body.width,
      this.sprite.body.height
    )
  }

  setupVisionDetectors() {
    this.visionCone = new VisionCone(this.game, {
      entityToTrack: this,
      angleDiff: 20,
      rayLength: 50,
    })
  }

  getHealth() {
    return this.healthBar.currValue
  }

  takeDamage(damage: number) {
    this.healthBar.decrease(damage)
  }

  attack(minion: Minion) {
    const color = this.side === Side.LEFT ? 'blue' : 'red'
    const projectile = new Projectile(this.game, {
      position: {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      target: minion,
      speed: 200,
      texture: `projectile_${color}`,
    })
    projectile.destroyCallback = () => {
      minion.takeDamage(10)
    }
    this.game.projectileGroup.add(projectile.sprite)
  }

  update() {
    this.stateMachine.step()
    if (this.visionCone) {
      this.visionCone.updateRayPositions()
    }
    if (this.markerRectangle) {
      this.markerRectangle.setPosition(
        this.sprite.x - this.sprite.body.width / 2,
        this.sprite.y - this.sprite.body.height / 2
      )
      if (this.game.isDebug) {
        this.game.graphics.strokeRectShape(this.markerRectangle)
      }
    }
    this.healthBar.x = this.sprite.x - this.sprite.body.height / 2
    this.healthBar.y = this.sprite.y - this.sprite.body.height
    this.healthBar.draw()
  }

  detectFriendlyStoppedInFront() {
    if (this.visionCone) {
      const friendlyList =
        this.side === Side.LEFT
          ? this.game.leftMinionSpawner.minions
          : this.game.rightMinionSpawner.minions
      const minions: Minion[] = friendlyList.children.entries.map(
        (obj) => obj.getData('ref') as Minion
      )
      const detectedEntities = this.visionCone.getDetectedEntities(minions)
      return detectedEntities.length > 0
    }
    return false
  }

  getDetectedEnemies() {
    if (!this.visionCone) {
      return []
    }
    const enemyList =
      this.side === Side.LEFT
        ? this.game.rightMinionSpawner.minions
        : this.game.leftMinionSpawner.minions
    const minions: Minion[] = enemyList.children.entries.map((obj) => obj.getData('ref') as Minion)
    const detectedEntities = this.visionCone.getDetectedEntities(minions)
    return detectedEntities
  }

  detectEnemyInFront() {
    if (this.visionCone) {
      const enemyList =
        this.side === Side.LEFT
          ? this.game.rightMinionSpawner.minions
          : this.game.leftMinionSpawner.minions
      const minions: Minion[] = enemyList.children.entries.map(
        (obj) => obj.getData('ref') as Minion
      )
      const detectedEntities = this.visionCone.getDetectedEntities(minions)
      return detectedEntities.length > 0
    }
    return false
  }

  destroy() {
    this.sprite.destroy()
    this.healthBar.destroy()

    if (this.visionCone) {
      this.visionCone.destroy()
      this.visionCone = undefined
    }

    if (this.markerRectangle) {
      this.markerRectangle = undefined
    }
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
