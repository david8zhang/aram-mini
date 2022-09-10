export interface ButtonConfig {
  width: number
  height: number
  onPress: Function
  text: string
  position: {
    x: number
    y: number
  }
}

export class Button {
  public buttonRect: Phaser.GameObjects.Rectangle
  public buttonText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, buttonConfig: ButtonConfig) {
    this.buttonRect = scene.add.rectangle(0, 0, 100, 20, 0x000000).setStrokeStyle(2, 0xffffff)
    this.buttonRect
      .setPosition(buttonConfig.position.x, buttonConfig.position.y)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        document.getElementsByTagName('body')[0]?.setAttribute('style', 'cursor:pointer;')
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        document.getElementsByTagName('body')[0]?.setAttribute('style', 'cursor:default;')
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        buttonConfig.onPress()
      })

    this.buttonText = scene.add.text(this.buttonRect.x, this.buttonRect.y, buttonConfig.text, {
      fontSize: '12px',
    })
    this.buttonText.setPosition(
      this.buttonRect.x - this.buttonText.displayWidth / 2,
      this.buttonRect.y - this.buttonText.displayHeight / 2
    )
  }

  setVisible(isVisible: boolean) {
    this.buttonText.setVisible(isVisible)
    this.buttonRect.setVisible(isVisible)
  }
}
