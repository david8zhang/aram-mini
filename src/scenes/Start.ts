import { Button } from '~/core/ui/Button'
import { ChampionTypes } from '~/utils/ChampionTypes'
import { Constants } from '~/utils/Constants'

export class Start extends Phaser.Scene {
  constructor() {
    super('start')
  }

  create() {
    const titleText = this.add.text(
      Constants.WINDOW_WIDTH / 2,
      Constants.WINDOW_HEIGHT / 2,
      'AMMIBA',
      {
        fontSize: '30px',
        color: 'white',
      }
    )
    titleText.setPosition(
      Constants.WINDOW_WIDTH / 2 - titleText.displayWidth / 2,
      Constants.WINDOW_HEIGHT / 2 - titleText.displayHeight / 2 - 30
    )

    const subtitleText = this.add.text(
      Constants.WINDOW_WIDTH / 2,
      Constants.WINDOW_HEIGHT / 2,
      'All Mid Miniature Battle Arena',
      {
        fontSize: '14px',
        color: 'white',
      }
    )
    subtitleText.setPosition(
      Constants.WINDOW_WIDTH / 2 - subtitleText.displayWidth / 2,
      titleText.y + titleText.displayHeight
    )

    const buttonWidth = 100
    const buttonHeight = 20
    new Button(this, {
      position: {
        x: Constants.WINDOW_WIDTH / 2,
        y: subtitleText.y + subtitleText.displayHeight + buttonHeight / 2 + 20,
      },
      onPress: () => {
        this.scene.start('select-character')
      },
      text: 'Play',
      width: buttonWidth,
      height: buttonHeight,
    })
  }
}
