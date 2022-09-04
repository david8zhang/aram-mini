import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../champion/Champion'
import { Minion } from '../minion/Minion'
import { Projectile } from '../Projectile'
import { StateMachine } from '../StateMachine'
import { UIValueBar } from '../ui/UIValueBar'
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
  public healthBar: UIValueBar
  public attackTarget: Minion | Champion | null = null
  public stateMachine: StateMachine

  public attackRadius: number = Constants.TOWER_ATTACK_RADIUS
  public attackCircle: Phaser.GameObjects.Arc
  public shouldShowHoverOutline: boolean = true

  constructor(game: Game, config: TowerConfig) {
    this.game = game
    this.side = config.side
    const { position } = config
    this.sprite = this.game.physics.add
      .sprite(position.x, position.y, config.texture)
      .setDepth(100)
      .setScale(config.scale)

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
      maxValue: Constants.TOWER_HEALTH,
      height: 4,
      width: this.sprite.displayWidth,
      borderWidth: 1,
      fillColor: this.side === Side.LEFT ? Constants.LEFT_COLOR : Constants.RIGHT_COLOR,
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
      .circle(this.sprite.x, this.sprite.y, this.attackRadius, 0xff0000, 0.2)
      .setVisible(false)
    this.game.debug.onDebugToggleHooks.push((isVisible: boolean) => {
      this.attackCircle.setVisible(isVisible)
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
      speed: 150,
      texture: `projectile_${color}`,
      scale: 1.5,
    })
    projectile.destroyCallback = () => {
      target.takeDamage(Constants.TOWER_DAMAGE_MAPPING[target.constructor.name])
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
      if (this.healthBar.currValue == 0) {
        this.destroy()
      }
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
    this.checkNexusTargetable()
  }

  checkNexusTargetable() {
    const towersList = this.side === Side.LEFT ? this.game.leftTowers : this.game.rightTowers
    const nonDestroyedTowers = towersList.filter((tower) => !tower.isDead)
    if (nonDestroyedTowers.length === 0) {
      const nexus = this.side === Side.LEFT ? this.game.leftNexus : this.game.rightNexus
      nexus.setIsTargetable(true)
    }
  }
}
