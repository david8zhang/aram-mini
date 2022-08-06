import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Minion } from '../minion/Minion'
import { Projectile } from '../Projectile'
import { StateMachine } from '../StateMachine'
import { AttackState } from './states/AttackState'
import { ChampionStates } from './states/ChampionStates'
import { IdleState } from './states/IdleState'
import { MoveState } from './states/MoveState'

export interface ChampionConfig {
  texture: string
  position: {
    x: number
    y: number
  }
}

export class Champion {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public stateMachine: StateMachine

  public moveTarget: { x: number; y: number } | null = null
  public moveMarker: Phaser.GameObjects.Arc | null = null

  public attackTarget: Champion | Minion | null = null
  public markerRectangle: Phaser.Geom.Rectangle

  constructor(game: Game, config: ChampionConfig) {
    this.game = game
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
    this.stateMachine = new StateMachine(
      ChampionStates.IDLE,
      {
        [ChampionStates.IDLE]: new IdleState(),
        [ChampionStates.MOVE]: new MoveState(),
        [ChampionStates.ATTACK]: new AttackState(),
      },
      [this]
    )
    this.markerRectangle = new Phaser.Geom.Rectangle(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayHeight / 2,
      this.sprite.displayWidth,
      this.sprite.displayHeight
    )
  }

  attack() {
    if (this.attackTarget) {
      if (!this.attackTarget.sprite.active || this.attackTarget.getHealth() === 0) {
        return
      }
      const projectile = new Projectile(this.game, {
        position: {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        target: this.attackTarget,
        speed: 200,
        texture: `projectile_blue`,
      })
      projectile.destroyCallback = () => {
        if (this.attackTarget) {
          this.attackTarget.takeDamage(10)
          if (this.attackTarget.getHealth() === 0) {
            this.attackTarget.destroy()
          }
        }
      }
      this.game.projectileGroup.add(projectile.sprite)
    }
  }

  getHealth() {
    return 0
  }

  destroy() {
    this.sprite.destroy()
  }

  takeDamage(damage: number) {}

  update() {
    this.stateMachine.step()
    this.markerRectangle.setPosition(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayWidth / 2
    )
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

  setMoveTarget(x: number, y: number) {
    this.moveTarget = new Phaser.Math.Vector2(x, y)
    if (!this.moveMarker) {
      this.moveMarker = this.game.add.circle(x, y, 1, 0x00ff00)
    } else {
      this.moveMarker.setPosition(x, y)
    }
  }
}
