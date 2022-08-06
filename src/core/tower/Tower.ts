import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../champion/Champion'
import { Minion } from '../minion/Minion'
import { Projectile } from '../Projectile'
import { StateMachine } from '../StateMachine'
import { HealthBar } from '../ui/Healthbar'
import { AttackState } from './states/AttackState'
import { DeadState } from './states/DeadState'
import { IdleState } from './states/IdleState'
import { TowerStates } from './states/TowerStates'

export interface TowerConfig {
  position: {
    x: number
    y: number
  }
  texture: string
  scale: number
  side: Side
}

export class Tower {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public side: Side
  public markerRectangle: Phaser.Geom.Rectangle
  public healthBar: HealthBar
  public attackTarget: Minion | Champion | null = null
  public stateMachine: StateMachine

  public attackRadius: number = Constants.TOWER_ATTACK_RADIUS
  public attackCircle: Phaser.GameObjects.Arc

  constructor(game: Game, config: TowerConfig) {
    this.game = game
    this.side = config.side
    const { position } = config
    this.sprite = this.game.physics.add
      .sprite(position.x, position.y, config.texture)
      .setScale(config.scale)

    this.markerRectangle = new Phaser.Geom.Rectangle(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayHeight / 2,
      this.sprite.displayWidth,
      this.sprite.displayHeight
    )

    this.healthBar = new HealthBar(this.game, {
      x: this.sprite.x - this.sprite.displayWidth / 2,
      y: this.sprite.y - this.sprite.displayHeight / 2 - 5,
      maxValue: Constants.TOWER_HEALTH,
      height: 4,
      width: this.sprite.displayWidth,
      borderWidth: 1,
    })
    this.stateMachine = new StateMachine(
      TowerStates.IDLE,
      {
        [TowerStates.IDLE]: new IdleState(),
        [TowerStates.ATTACK]: new AttackState(),
        [TowerStates.DEAD]: new DeadState(),
      },
      [this]
    )
    this.attackCircle = this.game.add
      .circle(this.sprite.x, this.sprite.y, this.attackRadius, 0xff0000, 0.5)
      .setVisible(false)
    this.game.debug.onDebugToggleHooks.push(() => {
      this.attackCircle.setVisible(!this.attackCircle.visible)
    })
  }

  getDetectedEnemyMinions() {
    const entitiesToDetect =
      this.side === Side.LEFT
        ? this.game.rightMinionSpawner.minions
        : this.game.leftMinionSpawner.minions
    const minions: Minion[] = entitiesToDetect.children.entries.map(
      (obj) => obj.getData('ref') as Minion
    )
    return minions.filter((entity) => {
      const m = entity as Minion
      const distanceToTower = Phaser.Math.Distance.Between(
        m.sprite.x,
        m.sprite.y,
        this.sprite.x,
        this.sprite.y
      )
      return distanceToTower <= this.attackRadius && m.sprite.active && m.getHealth() > 0
    })
  }

  getDetectedEnemyChampions() {
    const championsToDetect =
      this.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions
    return championsToDetect.filter((entity) => {
      const c = entity as Champion
      const distanceToTower = Phaser.Math.Distance.Between(
        c.sprite.x,
        c.sprite.y,
        this.sprite.x,
        this.sprite.y
      )
      return !c.isDead && distanceToTower <= this.attackRadius
    })
  }

  public get attackRange() {
    return this.attackRadius
  }

  public get isDead() {
    return this.stateMachine.getState() === TowerStates.DEAD
  }

  attack(target: Minion | Champion) {
    if (this.isDead || !target.sprite.active || target.getHealth() === 0) {
      return
    }
    const color = this.side === Side.LEFT ? 'blue' : 'red'
    const projectile = new Projectile(this.game, {
      position: {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      target: target,
      speed: 200,
      texture: `projectile_${color}`,
      scale: 1.5,
    })
    projectile.destroyCallback = () => {
      target.takeDamage(Constants.TOWER_DAMAGE)
      if (target.getHealth() === 0) {
        target.destroy()
      }
    }
    this.game.projectileGroup.add(projectile.sprite)
  }

  update() {
    this.stateMachine.step()
    if (this.healthBar) {
      this.healthBar.x = this.sprite.x - this.sprite.displayWidth / 2
      this.healthBar.y = this.sprite.y - this.sprite.displayHeight / 2 - 5
      this.healthBar.draw()
    }
  }

  takeDamage(damage: number) {
    if (this.healthBar) {
      this.healthBar.decrease(damage)
    }
  }

  getHealth() {
    if (this.healthBar) {
      return this.healthBar.currValue
    }
    return 0
  }

  destroy() {
    this.sprite.setVisible(false)
    this.healthBar.setVisible(false)
    this.stateMachine.transition(TowerStates.DEAD)
  }
}