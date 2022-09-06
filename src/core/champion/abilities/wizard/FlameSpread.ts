import { Minion } from '~/core/minion/Minion'
import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../../Champion'
import { ChampionStates } from '../../states/ChampionStates'
import { Ability } from '../Ability'
import { AbilityWithRange } from '../AbilityWithRange'
import { CooldownTimer } from '../CooldownTimer'

export class FlameSpread implements Ability, AbilityWithRange {
  game: Game
  champion: Champion

  private static readonly MANA_COST = 30
  private static readonly ABILITY_COOLDOWN_TIME_SECONDS = 15
  private static readonly EXPLOSION_CIRCLE_COLOR = 0xfe7817
  private static readonly EXPLOSION_CIRCLE_OUTLINE_COLOR = 0xfed874
  private static readonly ABILITY_RANGE = 75

  public key!: Phaser.Input.Keyboard.Key | null
  public mouseTriggered: boolean = false
  public isTargetingMode: boolean = false
  public targetingCursor: Phaser.GameObjects.Sprite
  public rangeCircle: Phaser.GameObjects.Arc

  public abilityRange: number = FlameSpread.ABILITY_RANGE
  public abilityTarget: { x: number; y: number } | null = null

  public iconTexture: string = 'flame-spread'
  public cooldownTimer: CooldownTimer

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    }
    this.targetingCursor = this.game.add
      .sprite(0, 0, 'targeting-cursor')
      .setVisible(false)
      .setDepth(1000)
    this.rangeCircle = this.game.add
      .circle(0, 0, this.abilityRange, Constants.UI_HIGHLIGHT_COLOR, 0.25)
      .setDepth(1000)
      .setStrokeStyle(2, Constants.UI_HIGHLIGHT_COLOR, 1)
      .setVisible(false)
    this.cooldownTimer = new CooldownTimer(this.game, FlameSpread.ABILITY_COOLDOWN_TIME_SECONDS)
    this.setupMouseClickListener()
  }

  public get isInCooldown() {
    return this.cooldownTimer.isInCooldown
  }

  public get secondsUntilCooldownExpires() {
    return this.cooldownTimer.secondsUntilCooldownExpires
  }

  public canTriggerAbility(): boolean {
    return this.champion.manaAmount >= FlameSpread.MANA_COST && !this.isInCooldown
  }

  setupMouseClickListener() {
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.mouseTriggered = true
          this.rangeCircle.setVisible(false)
          this.targetingCursor.setVisible(false)
          this.triggerAbility()
        }
      }
    })
  }

  handleKeyPress() {
    if (this.key && this.champion.isPlayerControlled) {
      if (this.game.player.inAttackTargetingMode) {
        return
      }
      if (this.key.isDown && !this.mouseTriggered) {
        if (this.canTriggerAbility()) {
          this.isTargetingMode = true
        }
      } else if (this.key.isUp) {
        this.mouseTriggered = false
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.rangeCircle.setVisible(false)
          this.targetingCursor.setVisible(false)
          this.triggerAbility()
        }
      }
    }
  }

  renderTargetingUI() {
    if (this.isTargetingMode) {
      this.game.hideCursor()
      this.rangeCircle.setVisible(true)
      this.rangeCircle.setPosition(this.champion.sprite.x, this.champion.sprite.y)
      this.targetingCursor.setVisible(true)
      this.targetingCursor.setPosition(
        this.game.input.mousePointer.worldX,
        this.game.input.mousePointer.worldY
      )
    } else {
      this.game.showCursor()
    }
  }

  triggerAbilityAtPosition(
    position: { x: number; y: number },
    onCompleteCallback: Function | null
  ): void {
    const targetingCircle = new Phaser.Geom.Circle(position.x, position.y, 8)
    const enemyMinions =
      this.champion.side === Side.LEFT ? this.game.rightMinions : this.game.leftMinions
    const enemyChampions =
      this.champion.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions
    const clickedEntity = this.getClickedEntity(enemyMinions, enemyChampions, targetingCircle)
    if (clickedEntity) {
      this.champion.decreaseMana(FlameSpread.MANA_COST)
      this.cooldownTimer.startAbilityCooldown()
      this.handleFireExplosionOnEntity(clickedEntity, enemyMinions, enemyChampions, true, 0)
      if (onCompleteCallback) {
        onCompleteCallback()
      }
    }
  }

  triggerAbility(): void {
    const position = {
      x: this.game.input.mousePointer.worldX,
      y: this.game.input.mousePointer.worldY,
    }
    if (this.isInRangeOfPosition(position)) {
      this.triggerAbilityAtPosition(position, null)
    } else {
      this.champion.abilityWithRange = this
      this.abilityTarget = position
      this.champion.stateMachine.transition(ChampionStates.ABILITY_MOVE)
    }
  }

  isInRangeOfPosition(position: { x: number; y: number }): boolean {
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.champion.sprite.x,
      this.champion.sprite.y,
      position.x,
      position.y
    )
    return distanceToTarget <= this.abilityRange
  }

  isInRange(): boolean {
    if (this.abilityTarget) {
      return this.isInRangeOfPosition(this.abilityTarget)
    }
    return false
  }

  public get damage(): number {
    return 35
  }

  handleFireExplosionOnEntity(
    entity: Minion | Champion,
    minions: Minion[],
    champions: Champion[],
    shouldSpread: boolean,
    delay: number
  ) {
    const explosionCircle = this.game.add
      .circle(entity.sprite.x, entity.sprite.y, 5, FlameSpread.EXPLOSION_CIRCLE_COLOR, 0.8)
      .setStrokeStyle(2, FlameSpread.EXPLOSION_CIRCLE_OUTLINE_COLOR, 1)
      .setVisible(false)
    this.game.tweens.add({
      delay,
      targets: explosionCircle,
      radius: { from: 15, to: 30 },
      alpha: { from: 0.75, to: 0.25 },
      fill: {
        from: FlameSpread.EXPLOSION_CIRCLE_COLOR,
        to: FlameSpread.EXPLOSION_CIRCLE_OUTLINE_COLOR,
      },
      onStart: () => {
        explosionCircle.setVisible(true)
        if (entity.getHealth() > 0) {
          if (entity.getHealth() - this.damage <= 0) {
            this.champion.handleLastHit(entity)
          }
          entity.takeDamage(this.damage)
        }
      },
      duration: 250,
      onComplete: () => {
        explosionCircle.destroy()
        if (shouldSpread) {
          const enemiesWithinRange = this.getEnemiesWithinRange(entity, minions, champions, 30)
          enemiesWithinRange.forEach((e, index) => {
            this.handleFireExplosionOnEntity(e, minions, champions, false, 250 * index)
          })
        }
      },
    })
  }

  getEnemiesWithinRange(
    entity: Minion | Champion,
    minions: Minion[],
    champions: Champion[],
    range: number
  ) {
    let result: (Minion | Champion)[] = []
    const addIfWithinRange = (e: Minion | Champion) => {
      if (e != entity) {
        const distance = Phaser.Math.Distance.Between(
          entity.sprite.x,
          entity.sprite.y,
          e.sprite.x,
          e.sprite.y
        )
        if (distance <= range) {
          result.push(e)
        }
      }
    }
    minions.forEach((minion) => addIfWithinRange(minion))
    champions.forEach((champion) => addIfWithinRange(champion))
    return result
  }

  getClickedEntity(minions: Minion[], champions: Champion[], targetingCircle: Phaser.Geom.Circle) {
    const overlappedEntities: (Minion | Champion)[] = []
    minions.forEach((minion: Minion) => {
      if (targetingCircle.contains(minion.sprite.x, minion.sprite.y)) {
        overlappedEntities.push(minion)
      }
    })
    champions.forEach((champion: Champion) => {
      if (targetingCircle.contains(champion.sprite.x, champion.sprite.y)) {
        overlappedEntities.push(champion)
      }
    })

    let closestToCircleCenter: Minion | Champion | null = null
    let minDistanceToCircleCenter: number = Number.MAX_SAFE_INTEGER
    overlappedEntities.forEach((entity: Minion | Champion) => {
      const distanceToCircleCenter = Phaser.Math.Distance.Between(
        entity.sprite.x,
        entity.sprite.y,
        targetingCircle.x,
        targetingCircle.y
      )
      if (distanceToCircleCenter <= minDistanceToCircleCenter) {
        closestToCircleCenter = entity
        minDistanceToCircleCenter = distanceToCircleCenter
      }
    })
    return closestToCircleCenter
  }

  update(): void {
    this.renderTargetingUI()
    this.handleKeyPress()
  }
}
