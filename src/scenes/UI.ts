import { AbilityKeys } from '~/core/champion/abilities/AbilityKeys'
import { Player } from '~/core/player/Player'
import { UIValueBar } from '~/core/ui/UIValueBar'
import { Constants } from '~/utils/Constants'
import { Game } from './Game'

export class UI extends Phaser.Scene {
  private static _instance: UI
  public playerManaBar!: UIValueBar
  public playerManaBarText!: Phaser.GameObjects.Text

  public playerHealthBar!: UIValueBar
  public playerHealthBarText!: Phaser.GameObjects.Text

  public playerChampionExpBar!: UIValueBar
  public playerLevelText!: Phaser.GameObjects.Text
  public playerCSScoreText!: Phaser.GameObjects.Text
  public playerKDAText!: Phaser.GameObjects.Text
  public statsBackgroundRect!: Phaser.GameObjects.Rectangle

  public playerRespawningText!: Phaser.GameObjects.Text
  public playerRespawnTimerText!: Phaser.GameObjects.Text

  public qAbilityUIObj!: { [key: string]: Phaser.GameObjects.GameObject }
  public wAbilityUIObj!: { [key: string]: Phaser.GameObjects.GameObject }
  public eAbilityUIObj!: { [key: string]: Phaser.GameObjects.GameObject }
  public rAbilityUIObj!: { [key: string]: Phaser.GameObjects.GameObject }

  public static UPPER_MARGIN: number = 5

  // Game over UI
  public screenTint!: Phaser.GameObjects.Rectangle
  public gameOverText!: Phaser.GameObjects.Text
  public resetText!: Phaser.GameObjects.Text

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
    this.setupPlayerManaBar()
    this.setupPlayerHealthBar()
    this.setupPlayerRespawnTimer()
  }

  setupPlayerRespawnTimer() {
    this.playerRespawningText = this.add
      .text(Constants.WINDOW_WIDTH / 2, Constants.WINDOW_HEIGHT / 2, 'Respawning in...', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setVisible(false)
    this.playerRespawnTimerText = this.add
      .text(Constants.WINDOW_WIDTH / 2, Constants.WINDOW_HEIGHT / 2, '', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setVisible(false)
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
      .text(Constants.WINDOW_WIDTH / 2, Constants.WINDOW_HEIGHT / 2 - 40, 'Victory', {
        fontSize: '40px',
      })
      .setDepth(this.screenTint.depth + 1)
      .setVisible(false)

    this.resetText = this.add
      .text(this.gameOverText.x, this.gameOverText.y + 20, 'Press Esc to play again', {
        fontSize: '20px',
      })
      .setDepth(this.screenTint.depth + 1)
      .setVisible(false)

    this.input.keyboard.on('keydown', (event: Phaser.Input.Keyboard.Key) => {
      if (event.keyCode == Phaser.Input.Keyboard.KeyCodes.ESC) {
        if (Game.instance.isGameOver) {
          Game.instance.resumeGame()
          this.hideGameOverUI()
        }
      }
    })
  }

  setupAbilityRects() {
    const midPoint = Constants.WINDOW_WIDTH / 2
    const wPositionX = midPoint - 16
    const qPositionX = wPositionX - 32
    const ePositionX = midPoint + 16
    const rPositionX = ePositionX + 32
    const abilityPositionY = Constants.WINDOW_HEIGHT - 60

    this.qAbilityUIObj = this.setupAbilityUI('Q', qPositionX, abilityPositionY)
    this.wAbilityUIObj = this.setupAbilityUI('W', wPositionX, abilityPositionY)
    this.eAbilityUIObj = this.setupAbilityUI('E', ePositionX, abilityPositionY)
    this.rAbilityUIObj = this.setupAbilityUI('R', rPositionX, abilityPositionY)
  }

  private setupAbilityUI(
    key: string,
    xPosition: number,
    yPosition: number
  ): {
    [key: string]: Phaser.GameObjects.GameObject
  } {
    const abilityRect = this.add.rectangle(xPosition, yPosition, 26, 26, 0x000000, 0.5)
    this.add
      .text(abilityRect.x + 10, abilityRect.y + 10, key, {
        fontSize: '12px',
      })
      .setDepth(1000)
    const iconSprite = this.add.sprite(xPosition, yPosition, '').setVisible(false)
    const cooldownText = this.add
      .text(xPosition, yPosition, '', {
        fontSize: '12px',
        color: '#ffffff',
      })
      .setVisible(false)
    return {
      sprite: iconSprite,
      boundingRect: abilityRect,
      cooldownText,
    }
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

  setupPlayerManaBar() {
    this.playerManaBar = new UIValueBar(this, {
      x: Constants.WINDOW_WIDTH / 2 - 100 + 39,
      y: Constants.WINDOW_HEIGHT - 37,
      height: 10,
      width: 122,
      borderWidth: 1,
      fillColor: 0x0000ff,
      maxValue: Constants.CHAMPION_MANA_AMOUNT,
    })
    this.playerManaBarText = this.add
      .text(this.playerManaBar.x + this.playerManaBar.width / 2, this.playerManaBar.y, 'Mana', {
        fontSize: '10px',
      })
      .setDepth(1000)
  }

  setupPlayerHealthBar() {
    this.playerHealthBar = new UIValueBar(this, {
      x: Constants.WINDOW_WIDTH / 2 - 100 + 39,
      y: Constants.WINDOW_HEIGHT - 25,
      height: 10,
      width: 122,
      borderWidth: 1,
      fillColor: Constants.LEFT_COLOR,
      maxValue: Constants.CHAMPION_MANA_AMOUNT,
    })
    this.playerHealthBarText = this.add
      .text(this.playerHealthBar.x + this.playerHealthBar.width / 2, this.playerHealthBar.y, 'HP', {
        fontSize: '10px',
      })
      .setDepth(1000)
  }

  updatePlayerManaBar() {
    const player = Game.instance ? Game.instance.player : null
    if (player) {
      this.playerManaBar.setMaxValue(player.champion.maxManaAmount)
      this.playerManaBar.setCurrValue(player.champion.manaAmount)
      this.playerManaBarText.setText(
        `${player.champion.manaAmount}/${player.champion.maxManaAmount}`
      )
      this.playerManaBarText.setPosition(
        this.playerManaBar.x +
          this.playerManaBar.width / 2 -
          this.playerManaBarText.displayWidth / 2,
        this.playerManaBarText.y
      )
    }
  }

  updatePlayerHealthBar() {
    const player = Game.instance ? Game.instance.player : null
    if (player) {
      this.playerHealthBar.setMaxValue(player.champion.getTotalHealth())
      this.playerHealthBar.setCurrValue(player.champion.getHealth())
      this.playerHealthBarText.setText(
        `${player.champion.getHealth()}/${player.champion.getTotalHealth()}`
      )
      this.playerHealthBarText.setPosition(
        this.playerHealthBar.x +
          this.playerHealthBar.width / 2 -
          this.playerHealthBarText.displayWidth / 2,
        this.playerHealthBarText.y
      )
    }
  }

  setupPlayerExpBar() {
    const abilitySprite = this.qAbilityUIObj.sprite as Phaser.GameObjects.Sprite
    this.playerChampionExpBar = new UIValueBar(this, {
      x: abilitySprite.x - 25,
      y: Constants.WINDOW_HEIGHT - 73,
      maxValue: 100,
      height: 58,
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
    this.updatePlayerManaBar()
    this.updatePlayerHealthBar()
    this.updatePlayerRespawnTimer()
  }

  updatePlayerRespawnTimer() {
    const player = Game.instance ? Game.instance.player : null
    if (player) {
      const champion = player.champion
      if (champion.shouldShowRespawnTimer) {
        if (Game.instance.cameraGrayscaleFilter) {
          Game.instance.cameraGrayscaleFilter.intensity = 1
        }
        this.playerRespawnTimerText
          .setText(`${champion.secondsUntilRespawn}`)
          .setPosition(
            Constants.WINDOW_WIDTH / 2 - this.playerRespawnTimerText.displayWidth / 2,
            this.playerRespawningText.y + 30
          )
          .setVisible(true)
        this.playerRespawningText
          .setPosition(
            Constants.WINDOW_WIDTH / 2 - this.playerRespawningText.displayWidth / 2,
            Constants.WINDOW_HEIGHT / 2 - this.playerRespawningText.displayHeight / 2 - 20
          )
          .setVisible(true)
      } else {
        if (Game.instance.cameraGrayscaleFilter) {
          Game.instance.cameraGrayscaleFilter.intensity = 0
        }
        this.playerRespawnTimerText.setVisible(false)
        this.playerRespawningText.setVisible(false)
      }
    }
  }

  updatePlayerAbility(abilityKey: AbilityKeys, player: Player) {
    const ability = player.champion.abilities[abilityKey]
    let abilityUIObj: any
    switch (abilityKey) {
      case AbilityKeys.Q: {
        abilityUIObj = this.qAbilityUIObj
        break
      }
      case AbilityKeys.W: {
        abilityUIObj = this.wAbilityUIObj
        break
      }
      case AbilityKeys.E: {
        abilityUIObj = this.eAbilityUIObj
        break
      }
      case AbilityKeys.R: {
        abilityUIObj = this.rAbilityUIObj
        break
      }
    }

    if (ability) {
      const sprite = abilityUIObj.sprite as Phaser.GameObjects.Sprite
      const boundingRect = abilityUIObj.boundingRect as Phaser.GameObjects.Rectangle
      const cooldownText = abilityUIObj.cooldownText as Phaser.GameObjects.Text

      sprite.setVisible(true).setTexture(ability.iconTexture).setScale(1).setAlpha(0.9)

      if (ability.isInCooldown) {
        boundingRect.setDepth(sprite.depth + 1)
        cooldownText
          .setVisible(true)
          .setText(`${ability.secondsUntilCooldownExpires}`)
          .setDepth(boundingRect.depth + 1)
          .setPosition(
            boundingRect.x - cooldownText.displayWidth / 2,
            boundingRect.y - cooldownText.displayHeight / 2
          )
      } else {
        boundingRect.setDepth(sprite.depth - 1)
        cooldownText.setVisible(false)
      }
    }
  }

  updatePlayerChampionAbilities() {
    const player = Game.instance ? Game.instance.player : null
    if (player) {
      this.updatePlayerAbility(AbilityKeys.Q, player)
      this.updatePlayerAbility(AbilityKeys.W, player)
      this.updatePlayerAbility(AbilityKeys.E, player)
      this.updatePlayerAbility(AbilityKeys.R, player)
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

  public hideGameOverUI() {
    this.screenTint.setVisible(false)
    this.gameOverText.setVisible(false)
    this.resetText.setVisible(false)
  }

  public showGameOverUI(isVictory: boolean) {
    this.screenTint.setVisible(true)
    this.gameOverText
      .setText(`${isVictory ? 'Victory' : 'Defeat'}`)
      .setPosition(
        Constants.WINDOW_WIDTH / 2 - this.gameOverText.displayWidth / 2,
        Constants.WINDOW_HEIGHT / 2 - this.gameOverText.displayHeight / 2 - 20
      )
      .setDepth(this.screenTint.depth + 1)
      .setVisible(true)
    this.resetText
      .setText('Press Esc to Play Again')
      .setPosition(
        Constants.WINDOW_WIDTH / 2 - this.resetText.displayWidth / 2,
        this.gameOverText.y + 40
      )
      .setDepth(this.screenTint.depth + 1)
      .setVisible(true)
  }

  public static get instance() {
    return UI._instance
  }
}
