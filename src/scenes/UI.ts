import { AbilityKeys } from '~/core/champion/abilities/AbilityKeys'
import { UIValueBar } from '~/core/ui/UIValueBar'
import { text } from '~/ui/Text'
import { Constants } from '~/utils/Constants'
import { Game } from './Game'

export class UI extends Phaser.Scene {
  private static _instance: UI
  public playerChampionExpBar!: UIValueBar
  public playerLevelText!: Phaser.GameObjects.Text
  public playerCSScoreText!: Phaser.GameObjects.Text
  public playerKDAText!: Phaser.GameObjects.Text
  public statsBackgroundRect!: Phaser.GameObjects.Rectangle
  public qAbilityIcon!: Phaser.GameObjects.Sprite
  public wAbilityIcon!: Phaser.GameObjects.Sprite
  public eAbilityIcon!: Phaser.GameObjects.Sprite
  public rAbilityIcon!: Phaser.GameObjects.Sprite

  public static UPPER_MARGIN: number = 5

  // Game over UI
  public screenTint!: Phaser.GameObjects.Rectangle
  public gameOverText!: Phaser.GameObjects.Text

  constructor() {
    super('ui')
    UI._instance = this
  }

  create() {
    this.setupPlayerCSScore()
    this.setupPlayerKDA()
    this.setupStatBackgroundRect()
    this.setupAbilityRects()
    this.setupPlayerExpBar()
    this.setupGameOverUI()
  }

  setupGameOverUI() {
    this.screenTint = this.add
      .rectangle(
        Constants.WINDOW_WIDTH / 2,
        Constants.WINDOW_HEIGHT / 2,
        Constants.WINDOW_WIDTH,
        Constants.WINDOW_HEIGHT,
        0x000000,
        0.5
      )
      .setDepth(2500)
      .setVisible(false)
    this.gameOverText = this.add
      .text(Constants.WINDOW_WIDTH / 2, Constants.WINDOW_HEIGHT / 2, 'Victory', {
        fontSize: '40px',
      })
      .setDepth(this.screenTint.depth + 1)
      .setVisible(false)
  }

  setupAbilityRects() {
    const midPoint = Constants.WINDOW_WIDTH / 2
    const wPositionX = midPoint - 20
    const qPositionX = wPositionX - 40
    const ePositionX = midPoint + 20
    const rPositionX = ePositionX + 40
    const abilityPositionY = Constants.WINDOW_HEIGHT - 30

    this.qAbilityIcon = this.setupAbilityUI('Q', qPositionX, abilityPositionY)
    this.wAbilityIcon = this.setupAbilityUI('W', wPositionX, abilityPositionY)
    this.eAbilityIcon = this.setupAbilityUI('E', ePositionX, abilityPositionY)
    this.rAbilityIcon = this.setupAbilityUI('R', rPositionX, abilityPositionY)
  }

  private setupAbilityUI(
    key: string,
    xPosition: number,
    yPosition: number
  ): Phaser.GameObjects.Sprite {
    const abilityRect = this.add.rectangle(xPosition, yPosition, 30, 30, 0x000000, 0.5)
    this.add
      .text(abilityRect.x + 10, abilityRect.y + 10, key, {
        fontSize: '12px',
      })
      .setDepth(1000)
    return this.add.sprite(xPosition, yPosition, '').setVisible(false)
  }

  setupStatBackgroundRect() {
    this.statsBackgroundRect = this.add.rectangle(
      (this.playerKDAText.x + this.playerCSScoreText.x) / 2,
      10,
      this.playerKDAText.displayWidth + this.playerCSScoreText.displayWidth,
      this.playerCSScoreText.displayHeight + 10,
      0x000000,
      0.5
    )
  }

  setupPlayerKDA() {
    this.playerKDAText = this.add
      .text(0, 0, '0/0', {
        fontSize: '10px',
        color: '#ffffff',
      })
      .setDepth(1000)
  }

  setupPlayerCSScore() {
    this.playerCSScoreText = this.add
      .text(0, 0, 'CS: 0', {
        fontSize: '10px',
        color: '#ffffff',
      })
      .setDepth(1000)
    this.playerCSScoreText.setPosition(
      Constants.WINDOW_WIDTH - this.playerCSScoreText.displayWidth - 5,
      5
    )
  }

  setupPlayerExpBar() {
    this.playerChampionExpBar = new UIValueBar(this, {
      x: this.qAbilityIcon.x - 30,
      y: Constants.WINDOW_HEIGHT - 45,
      maxValue: 100,
      height: 30,
      width: 5,
      borderWidth: 1,
      fillColor: Constants.EXP_BAR_COLOR,
      isVertical: true,
    })
    this.playerLevelText = this.add
      .text(this.playerChampionExpBar.x - 20, this.playerChampionExpBar.y, '', {
        fontSize: '14px',
        color: '#ffffff',
      })
      .setDepth(1000)
  }

  update() {
    this.updatePlayerChampionExpBar()
    this.updatePlayerCSScore()
    this.updatePlayerKDA()
    this.updateStatsBackgroundRect()
    this.updatePlayerChampionAbilities()
  }

  updatePlayerChampionAbilities() {
    const player = Game.instance ? Game.instance.player : null
    if (player) {
      const qAbility = player.champion.abilities[AbilityKeys.Q]
      if (qAbility) {
        this.qAbilityIcon
          .setVisible(true)
          .setTexture(qAbility.iconTexture)
          .setScale(2)
          .setAlpha(0.9)
      }
    }
  }

  updateStatsBackgroundRect() {
    this.statsBackgroundRect.setPosition((this.playerCSScoreText.x + this.playerKDAText.x) / 2, 10)
    this.statsBackgroundRect.width =
      this.playerCSScoreText.displayWidth + this.playerCSScoreText.displayWidth + 25
  }

  updatePlayerKDA() {
    const player = Game.instance ? Game.instance.player : null
    if (player) {
      this.playerKDAText.setText(`${player.champion.numKills}/${player.champion.numDeaths}`)
      this.playerKDAText.setPosition(
        this.playerCSScoreText.x - this.playerKDAText.displayWidth - 15,
        UI.UPPER_MARGIN
      )
    }
  }

  updatePlayerCSScore() {
    const player = Game.instance ? Game.instance.player : null
    if (player) {
      this.playerCSScoreText.setText(`CS:${player.champion.csScore}`)
      this.playerCSScoreText.setPosition(
        Constants.WINDOW_WIDTH - this.playerCSScoreText.displayWidth - 5,
        UI.UPPER_MARGIN
      )
    }
  }

  updatePlayerChampionExpBar() {
    const player = Game.instance ? Game.instance.player : null
    if (player) {
      const currentRange = Constants.EXP_TO_LEVEL_RANGES[player.champion.level - 1]
      const maxAmount = currentRange[1] - currentRange[0]
      const currValue = player.champion.totalExp - currentRange[0]

      this.playerChampionExpBar.setMaxValue(maxAmount)
      this.playerChampionExpBar.setCurrValue(currValue)
      this.playerChampionExpBar.draw()

      this.playerLevelText.setText(`Lv:${player.champion.level}`)
      this.playerLevelText.setPosition(
        this.playerChampionExpBar.x -
          this.playerChampionExpBar.width -
          this.playerLevelText.displayWidth,
        this.playerChampionExpBar.y +
          this.playerChampionExpBar.height / 2 -
          this.playerLevelText.displayHeight / 2
      )
    }
  }

  public showGameOverUI(isVictory: boolean) {
    this.screenTint.setVisible(true)
    this.gameOverText
      .setText(`${isVictory ? 'Victory' : 'Defeat'}`)
      .setPosition(
        Constants.WINDOW_WIDTH / 2 - this.gameOverText.displayWidth / 2,
        Constants.WINDOW_HEIGHT / 2 - this.gameOverText.displayHeight / 2
      )
      .setDepth(this.screenTint.depth + 1)
      .setVisible(true)
  }

  public static get instance() {
    return UI._instance
  }
}
