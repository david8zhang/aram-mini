import { UIValueBar } from '~/core/ui/UIValueBar'
import { text } from '~/ui/Text'
import { Constants } from '~/utils/Constants'
import { Game } from './Game'

export class UI extends Phaser.Scene {
  private static _instance: UI
  public playerChampionExpBar!: UIValueBar
  public playerText!: Phaser.GameObjects.Text

  constructor() {
    super('ui')
    UI._instance = this
  }

  create() {
    this.playerChampionExpBar = new UIValueBar(this, {
      x: 20,
      y: Constants.WINDOW_HEIGHT - 20,
      maxValue: 100,
      height: 10,
      width: 120,
      borderWidth: 1,
      fillColor: Constants.EXP_BAR_COLOR,
    })
    this.playerText = this.add
      .text(this.playerChampionExpBar.x, this.playerChampionExpBar.y, '', {
        fontSize: '10px',
        color: '#ffffff',
      })
      .setDepth(1000)
  }

  update() {
    this.updatePlayerChampionExpBar()
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

      this.playerText.setText(`Level: ${player.champion.level}`)
      this.playerText.setPosition(
        this.playerChampionExpBar.x +
          this.playerChampionExpBar.width / 2 -
          this.playerText.displayWidth / 2,
        this.playerChampionExpBar.y +
          this.playerChampionExpBar.height / 2 -
          this.playerText.displayHeight / 2
      )
    }
  }

  public static get instance() {
    return UI._instance
  }
}
