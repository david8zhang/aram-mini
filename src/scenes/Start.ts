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

    const buttonRect = this.add.rectangle(0, 0, 100, 20, 0x000000).setStrokeStyle(2, 0xffffff)
    buttonRect
      .setPosition(
        Constants.WINDOW_WIDTH / 2,
        subtitleText.y + subtitleText.displayHeight + buttonRect.height / 2 + 20
      )
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        document.getElementsByTagName('body')[0]?.setAttribute('style', 'cursor:pointer;')
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        document.getElementsByTagName('body')[0]?.setAttribute('style', 'cursor:default;')
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.scene.start('game')
        this.scene.start('ui')
      })

    const playText = this.add.text(buttonRect.x, buttonRect.y, 'Play', {
      fontSize: '12px',
    })
    playText.setPosition(
      buttonRect.x - playText.displayWidth / 2,
      buttonRect.y - playText.displayHeight / 2
    )
  }
}
