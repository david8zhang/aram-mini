import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Minion } from '../minion/Minion'
import { Nexus } from '../Nexus'
import { Projectile } from '../Projectile'
import { StateMachine } from '../StateMachine'
import { Tower } from '../tower/Tower'
import { HealthBar } from '../ui/Healthbar'
import { AttackState } from './states/AttackState'
import { ChampionStates } from './states/ChampionStates'
import { DeadState } from './states/DeadState'
import { IdleState } from './states/IdleState'
import { MoveState } from './states/MoveState'

export interface ChampionConfig {
  texture: string
  position: {
    x: number
    y: number
  }
  side: Side
}

export class Champion {
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public stateMachine: StateMachine
  public side: Side

  public moveTarget: { x: number; y: number } | null = null
  public moveMarker: Phaser.GameObjects.Arc | null = null

  public attackTarget: Champion | Minion | Tower | Nexus | null = null
  public markerRectangle: Phaser.Geom.Rectangle
  public healthBar: HealthBar

  public attackRange: number = Constants.CHAMPION_ATTACK_RANGE

  constructor(game: Game, config: ChampionConfig) {
    this.game = game
    this.side = config.side
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
    this.sprite.setData('ref', this)
    this.game.physics.world.enableBody(this.sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.stateMachine = new StateMachine(
      ChampionStates.IDLE,
      {
        [ChampionStates.IDLE]: new IdleState(),
        [ChampionStates.MOVE]: new MoveState(),
        [ChampionStates.ATTACK]: new AttackState(),
        [ChampionStates.DEAD]: new DeadState(),
      },
      [this]
    )
    this.markerRectangle = new Phaser.Geom.Rectangle(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayHeight / 2,
      this.sprite.displayWidth,
      this.sprite.displayHeight
    )
    this.healthBar = new HealthBar(this.game, {
      x: this.sprite.x - 15,
      y: this.sprite.y - this.sprite.body.height,
      maxValue: Constants.CHAMPION_HEALTH,
      height: 4,
      width: 30,
      borderWidth: 1,
      fillColor: this.side === Side.LEFT ? Constants.LEFT_COLOR : Constants.RIGHT_COLOR,
    })
  }

  public get isDead() {
    return this.stateMachine.getState() === ChampionStates.DEAD
  }

  attack() {
    if (this.isDead) {
      return
    }
    if (this.attackTarget) {
      if (!this.attackTarget.sprite.active || this.attackTarget.getHealth() === 0) {
        return
      }
      const projectileColor = this.side === Side.LEFT ? 'blue' : 'red'
      const projectile = new Projectile(this.game, {
        position: {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        target: this.attackTarget,
        speed: 200,
        texture: `projectile_${projectileColor}`,
      })
      projectile.destroyCallback = () => {
        if (this.attackTarget) {
          this.attackTarget.takeDamage(Constants.CHAMPION_DAMAGE)
          if (this.attackTarget.getHealth() === 0) {
            this.attackTarget.destroy()
          }
        }
      }
      this.game.projectileGroup.add(projectile.sprite)
    }
  }

  getHealth() {
    if (this.healthBar) {
      return this.healthBar.currValue
    }
    return 0
  }

  respawn() {
    const spawnPosition = this.side === Side.LEFT ? Constants.LEFT_SPAWN : Constants.RIGHT_SPAWN
    this.sprite.setPosition(spawnPosition.x, spawnPosition.y)
    this.healthBar.setCurrHealth(Constants.CHAMPION_HEALTH)
    this.healthBar.setVisible(true)
    this.sprite.setVisible(true)
    if (this.side === Side.LEFT) {
      this.game.cameras.main.startFollow(this.sprite, true)
    }
  }

  destroy() {
    this.sprite.setVisible(false)
    this.healthBar.setVisible(false)
    this.moveTarget = null
    this.stateMachine.transition(ChampionStates.DEAD)
  }

  takeDamage(damage: number) {
    this.healthBar.decrease(damage)
  }

  update() {
    this.stateMachine.step()
    this.markerRectangle.setPosition(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayWidth / 2
    )
    if (this.healthBar) {
      this.healthBar.x = this.sprite.x - 15
      this.healthBar.y = this.sprite.y - this.sprite.body.height
      this.healthBar.draw()
    }
  }

  isAtMoveTarget(moveTarget: { x: number; y: number }) {
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      moveTarget!.x,
      moveTarget!.y
    )
    return distance <= 5
  }

  handleMovementToPoint(moveTarget: { x: number; y: number }) {
    if (this.isDead) {
      return
    }
    if (moveTarget && !this.isAtMoveTarget(moveTarget)) {
      let angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        {
          x: moveTarget.x,
          y: moveTarget.y,
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
    if (this.isDead) {
      return
    }
    this.moveTarget = new Phaser.Math.Vector2(x, y)
    if (!this.moveMarker) {
      this.moveMarker = this.game.add.circle(x, y, 1, 0x00ff00)
    } else {
      this.moveMarker.setPosition(x, y)
    }
  }
}
