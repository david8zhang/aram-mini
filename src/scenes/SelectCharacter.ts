import { Button } from '~/core/ui/Button'
import { ChampionTypes } from '~/utils/ChampionTypes'
import { Constants } from '~/utils/Constants'

export class SelectCharacter extends Phaser.Scene {
  public championType: ChampionTypes | null = null
  public champOptions: Phaser.GameObjects.Rectangle[] = []
  public playButton!: Button

  constructor() {
    super('select-character')
  }

  create() {
    this.championType = null
    const selectCharacterText = this.add.text(0, 0, 'Select your character', {
      fontSize: '20px',
      color: 'white',
    })
    selectCharacterText.setPosition(
      Constants.WINDOW_WIDTH / 2 - selectCharacterText.displayWidth / 2,
      Constants.WINDOW_HEIGHT / 2 - 100
    )
    this.setupCharacterSelectionGrid()
    this.playButton = new Button(this, {
      position: {
        x: Constants.WINDOW_WIDTH / 2,
        y: Constants.WINDOW_HEIGHT / 2 + 100,
      },
      text: 'Continue',
      onPress: () => {
        if (this.championType) {
          this.scene.start('ui')
          this.scene.start('game', {
            championType: this.championType,
          })
        }
      },
      width: 100,
      height: 50,
    })
  }

  update() {
    if (this.playButton) {
      this.playButton.setVisible(this.championType != null)
    }
  }

  setupCharacterSelectionGrid() {
    const wizardOption = this.createCharacterBox(
      'wizard',
      {
        x: Constants.WINDOW_WIDTH / 3,
        y: Constants.WINDOW_HEIGHT / 2,
      },
      ChampionTypes.WIZARD
    )
    const warriorOption = this.createCharacterBox(
      'warrior',
      {
        x: Constants.WINDOW_WIDTH * (2 / 3),
        y: Constants.WINDOW_HEIGHT / 2,
      },
      ChampionTypes.WARRIOR
    )
    this.champOptions.push(wizardOption)
    this.champOptions.push(warriorOption)
  }

  createCharacterBox(texture: string, position: { x: number; y: number }, name: ChampionTypes) {
    const characterContainer = this.add
      .rectangle(position.x, position.y, 50, 50)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive()
      .setData('optionIdentifier', name)
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        document.getElementsByTagName('body')[0]?.setAttribute('style', 'cursor:pointer;')
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        document.getElementsByTagName('body')[0]?.setAttribute('style', 'cursor:default;')
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.championType = name
        this.champOptions.forEach((c) => {
          if (c.getData('optionIdentifier') === name) {
            c.setStrokeStyle(2, 0x00ff00)
          } else {
            c.setStrokeStyle(2, 0xffffff)
          }
        })
      })
    this.add.sprite(characterContainer.x, characterContainer.y, texture).setScale(2)
    const text = this.add.text(characterContainer.x, characterContainer.y, name)
    text.setPosition(
      characterContainer.x - text.displayWidth / 2,
      characterContainer.y + characterContainer.displayHeight / 2 + 10
    )
    return characterContainer
  }
}
