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
  public UIBackgroundRect!: Phaser.GameObjects.Rectangle

  public static UPPER_MARGIN: number = 5

  constructor() {
    super('ui')
    UI._instance = this
  }

  create() {
    this.setupPlayerExpBar()
    this.setupPlayerCSScore()
    this.setupPlayerKDA()
    this.setupStatBackgroundRect()
  }

  setupStatBackgroundRect() {
    this.UIBackgroundRect = this.add.rectangle(
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
      x: 20,
      y: Constants.WINDOW_HEIGHT - 20,
      maxValue: 100,
      height: 10,
      width: 120,
      borderWidth: 1,
      fillColor: Constants.EXP_BAR_COLOR,
    })
    this.playerLevelText = this.add
      .text(this.playerChampionExpBar.x, this.playerChampionExpBar.y, '', {
        fontSize: '10px',
        color: '#ffffff',
      })
      .setDepth(1000)
  }

  update() {
    this.updatePlayerChampionExpBar()
    this.updatePlayerCSScore()
    this.updatePlayerKDA()
    this.updateUIBackgroundRect()
  }

  updateUIBackgroundRect() {
    this.UIBackgroundRect.setPosition((this.playerCSScoreText.x + this.playerKDAText.x) / 2, 10)
    this.UIBackgroundRect.width =
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

      this.playerLevelText.setText(`Level: ${player.champion.level}`)
      this.playerLevelText.setPosition(
        this.playerChampionExpBar.x +
          this.playerChampionExpBar.width / 2 -
          this.playerLevelText.displayWidth / 2,
        this.playerChampionExpBar.y +
          this.playerChampionExpBar.height / 2 -
          this.playerLevelText.displayHeight / 2
      )
    }
  }

  public static get instance() {
    return UI._instance
  }
}
