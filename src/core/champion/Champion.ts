import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Minion } from '../minion/Minion'
import { Nexus } from '../Nexus'
import { Projectile } from '../Projectile'
import { StateMachine } from '../StateMachine'
import { Tower } from '../tower/Tower'
import { UIValueBar } from '../ui/UIValueBar'
import { Ability } from './abilities/Ability'
import { AbilityKeys } from './abilities/AbilityKeys'
import { AutoAttack } from './auto-attack/AutoAttack'
import { AutoAttackType } from './auto-attack/AutoAttackType'
import { MeleeAttack } from './auto-attack/MeleeAttack'
import { RangedAttack } from './auto-attack/RangedAttack'
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
  isPlayerControlled?: boolean
  side: Side
  abilities?: {
    [key in AbilityKeys]?: Class
  }
  autoAttackType: AutoAttackType
}

export class Champion {
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public stateMachine: StateMachine
  public side: Side
  public isPlayerControlled: boolean = false

  public moveTarget: { x: number; y: number } | null = null
  public moveMarker: Phaser.GameObjects.Arc | null = null

  public attackTarget: Champion | Minion | Tower | Nexus | null = null
  public healthBar: UIValueBar
  public hpRegenAmt: number = 5
  public healthRegenEvent!: Phaser.Time.TimerEvent

  public manaRegenEvent!: Phaser.Time.TimerEvent
  public manaRegenAmt: number = 5
  public manaAmount: number = Constants.CHAMPION_MANA_AMOUNT
  public maxManaAmount: number = Constants.CHAMPION_MANA_AMOUNT

  public totalExp: number = 0
  public level: number = 1
  public csScore: number = 0
  public numKills: number = 0
  public numDeaths: number = 0

  public secondsUntilRespawn: number = 0
  public shouldShowRespawnTimer: boolean = false

  public onDestroyedCallbacks: Function[] = []
  public abilities: {
    [key in AbilityKeys]?: Ability
  } = {}

  // Auto attack configuration
  public autoAttack!: AutoAttack
  private _damageOverride: number = -1

  public shouldShowHoverOutline: boolean = true

  constructor(game: Game, config: ChampionConfig) {
    this.game = game
    this.side = config.side
    if (config.isPlayerControlled) {
      this.isPlayerControlled = config.isPlayerControlled
    }
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
    this.sprite
      .setData('ref', this)
      .setInteractive()
      .on('pointerover', () => {
        if (this.shouldShowHoverOutline && !this.isDead) {
          this.game.postFxPlugin.add(this.sprite, {
            thickness: 2,
            outlineColor: this.side === Side.LEFT ? Constants.LEFT_COLOR : Constants.RIGHT_COLOR,
          })
        }
      })
      .on('pointerout', () => {
        if (this.shouldShowHoverOutline && !this.isDead) {
          this.game.postFxPlugin.remove(this.sprite)
        }
      })

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
    this.healthBar = new UIValueBar(this.game, {
      x: this.sprite.x - 15,
      y: this.sprite.y - this.sprite.body.height,
      maxValue: Constants.CHAMPION_HEALTH,
      height: 4,
      width: 30,
      borderWidth: 1,
      fillColor: this.side === Side.LEFT ? Constants.LEFT_COLOR : Constants.RIGHT_COLOR,
    })

    this.setupAutoAttack(config.autoAttackType)
    this.configureAbilities(config.abilities)
    this.setupRegenerationEvents()
  }

  setupAutoAttack(autoAttackType: AutoAttackType) {
    switch (autoAttackType) {
      case AutoAttackType.RANGED: {
        this.autoAttack = new RangedAttack(this.game, this)
        break
      }
      case AutoAttackType.MELEE: {
        this.autoAttack = new MeleeAttack(this.game, this)
        break
      }
    }
  }

  setupRegenerationEvents() {
    this.healthRegenEvent = this.game.time.addEvent({
      delay: 5000,
      callback: () => {
        if (!this.isBeingTargeted()) {
          if (this.getHealth() < this.getTotalHealth()) {
            this.healthBar.increase(this.hpRegenAmt)
          }
        }
      },
      repeat: -1,
    })
    this.manaRegenEvent = this.game.time.addEvent({
      delay: 5000,
      callback: () => {
        if (!this.isBeingTargeted()) {
          if (this.manaAmount < this.maxManaAmount) {
            this.manaAmount = Math.min(this.maxManaAmount, this.manaAmount + this.manaRegenAmt)
          }
        }
      },
      repeat: -1,
    })
  }

  isBeingTargeted() {
    const enemyMinions =
      this.side === Side.LEFT
        ? this.game.rightMinionSpawner.minions
        : this.game.leftMinionSpawner.minions
    for (let i = 0; i < enemyMinions.children.entries.length; i++) {
      const minion = enemyMinions.children.entries[i].getData('ref') as Minion
      if (minion.attackTarget === this) {
        return true
      }
    }

    const enemyTowers = this.side === Side.LEFT ? this.game.rightTowers : this.game.leftTowers
    for (let i = 0; i < enemyTowers.length; i++) {
      if (enemyTowers[i].attackTarget === this) {
        return true
      }
    }

    const enemyChampions =
      this.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions
    for (let i = 0; i < enemyChampions.length; i++) {
      if (enemyChampions[i].attackTarget === this) {
        return true
      }
    }
    return false
  }

  configureAbilities(abilityConfig: { [key in AbilityKeys]?: Class } | undefined) {
    if (abilityConfig) {
      Object.keys(abilityConfig).forEach((key) => {
        const AbilityClass = abilityConfig[key]
        this.abilities[key] = new AbilityClass(this.game, this)
      })
    }
  }

  decreaseMana(manaCost: number) {
    this.manaAmount -= manaCost
  }

  public getAbility() {}

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
      this.autoAttack.attack()
    }
  }

  public handleLastHit(attackTarget) {
    if (!attackTarget) {
      return
    }
    switch (attackTarget.constructor.name) {
      case 'Champion': {
        const expForNextLevel = this.getExpForNextLevel()
        this.addExp(
          Math.round(
            0.75 *
              expForNextLevel *
              Constants.getLevelDiffExpAdjuster(this.level, (attackTarget as Champion).level)
          )
        )
        this.numKills++
        break
      }
      case 'Minion': {
        this.csScore++
        break
      }
    }
  }

  public addExp(exp: number) {
    this.totalExp += exp
    this.level = this.getLevelForTotalExp(this.totalExp)
  }

  set damageOverride(newDamage: number) {
    this._damageOverride = newDamage
  }

  get attackRange(): number {
    return this.autoAttack.attackRange
  }

  get damage(): number {
    if (this._damageOverride != -1) {
      return this._damageOverride
    }
    return this.level * Constants.CHAMPION_DAMAGE_RANGED
  }

  getLevelForTotalExp(totalExp: number) {
    const levelRanges = Constants.EXP_TO_LEVEL_RANGES
    const maxExp = levelRanges[levelRanges.length - 1][1]
    if (totalExp === 0) {
      return 1
    }
    if (totalExp >= maxExp) {
      return levelRanges.length
    }
    for (let i = 0; i < levelRanges.length; i++) {
      const currRange = levelRanges[i]
      if (totalExp >= currRange[0] && totalExp < currRange[1]) {
        return i + 1
      }
    }
    return levelRanges.length
  }

  getExpForNextLevel() {
    const currRange = Constants.EXP_TO_LEVEL_RANGES[this.level - 1]
    return currRange[1] - this.totalExp
  }

  getHealth() {
    if (this.healthBar) {
      return this.healthBar.currValue
    }
    return 0
  }

  getTotalHealth() {
    if (this.healthBar) {
      return this.healthBar.maxValue
    }
    return 0
  }

  respawn() {
    const respawnPosition = this.side === Side.LEFT ? Constants.LEFT_SPAWN : Constants.RIGHT_SPAWN
    this.sprite.setPosition(respawnPosition.x, respawnPosition.y)
    this.manaAmount = this.maxManaAmount
    this.healthBar.setCurrValue(Constants.CHAMPION_HEALTH)
    this.healthBar.setVisible(true)
    this.sprite.setVisible(true)
    this.healthRegenEvent.paused = false
    this.manaRegenEvent.paused = false
    if (this.side === Side.LEFT) {
      this.game.cameras.main.startFollow(this.sprite, true)
    }
  }

  stop() {
    this.moveTarget = null
    this.attackTarget = null
    this.sprite.setVelocity(0, 0)
  }

  destroy() {
    this.stop()
    this.sprite.setVisible(false)
    this.healthBar.setVisible(false)
    this.moveTarget = null
    this.onDestroyedCallbacks.forEach((cb) => cb())
    this.numDeaths++
    this.healthRegenEvent.paused = true
    this.manaRegenEvent.paused = true
    this.stateMachine.transition(ChampionStates.DEAD)
    this.startRespawnTimer()
  }

  startRespawnTimer() {
    if (!this.shouldShowRespawnTimer) {
      this.shouldShowRespawnTimer = true
      this.secondsUntilRespawn = Constants.CHAMPION_RESPAWN_DELAY_MILLISECONDS / 1000
      const respawnTimerEvent = this.game.time.addEvent({
        delay: 1000,
        callback: () => {
          this.secondsUntilRespawn--
          if (this.secondsUntilRespawn === 0) {
            this.shouldShowRespawnTimer = false
            respawnTimerEvent.remove()
          }
        },
        repeat: -1,
      })
    }
  }

  takeDamage(damage: number) {
    this.healthBar.decrease(damage)
    if (this.healthBar.currValue == 0) {
      this.destroy()
    }
  }

  update() {
    this.stateMachine.step()
    if (this.healthBar) {
      this.healthBar.x = this.sprite.x - 15
      this.healthBar.y = this.sprite.y - this.sprite.body.height
      this.healthBar.draw()
    }
    Object.keys(this.abilities).forEach((abilityKey) => {
      this.abilities[abilityKey].update()
    })
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
