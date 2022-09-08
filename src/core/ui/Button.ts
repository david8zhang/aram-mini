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
  constructor(scene: Phaser.Scene, buttonConfig: ButtonConfig) {
    const buttonRect = scene.add.rectangle(0, 0, 100, 20, 0x000000).setStrokeStyle(2, 0xffffff)
    buttonRect
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

    const playText = scene.add.text(buttonRect.x, buttonRect.y, buttonConfig.text, {
      fontSize: '12px',
    })
    playText.setPosition(
      buttonRect.x - playText.displayWidth / 2,
      buttonRect.y - playText.displayHeight / 2
    )
  }
}
