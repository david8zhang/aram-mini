export class Constants {
  public static readonly MINION_KILL_EXP = 32
  public static readonly MINION_MOVE_SPEED = 50
  public static readonly MINION_ATTACK_DELAY = 2000
  public static readonly MINION_DAMAGE = 10
  public static readonly MINION_HEALTH = 50
  public static readonly MINION_ATTACK_RANGE = 50

  public static readonly CHAMPION_MOVE_SPEED = 100
  public static readonly CHAMPION_ATTACK_DELAY = 1000
  public static readonly CHAMPION_HEALTH = 500
  public static readonly CHAMPION_MANA_AMOUNT = 250
  public static readonly CHAMPION_RESPAWN_DELAY_MILLISECONDS = 10000

  public static readonly CHAMPION_ATTACK_RANGE_RANGED = 75
  public static readonly CHAMPION_ATTACK_RANGE_MELEE = 20
  public static readonly CHAMPION_DAMAGE_RANGED = 15
  public static readonly CHAMPION_DAMAGE_MELEE = 25

  public static readonly TOWER_DAMAGE_MAPPING = {
    Minion: 40,
    Champion: 80,
  }
  public static readonly TOWER_ATTACK_DELAY = 2000
  public static readonly TOWER_HEALTH = 500
  public static readonly TOWER_ATTACK_RADIUS = 75

  public static readonly HEALTH_RELIC_HEAL_AMOUNT = 100
  public static readonly HEALTH_RELIC_MANA_REGEN_AMOUNT = 100

  public static readonly ATTACK_RANGE_COLOR = 0xadd8e6
  public static readonly UI_HIGHLIGHT_COLOR = 0x77e8d5
  public static readonly EXP_BAR_COLOR = 0x8e44ad
  public static readonly EXP_TO_LEVEL_RANGES = [
    [0, 280],
    [280, 660],
    [660, 1140],
    [1140, 1720],
    [1720, 2400],
    [2400, 3180],
    [3180, 4060],
    [4060, 5040],
    [5040, 6120],
    [6120, 7300],
    [7300, 8580],
    [8580, 9960],
    [9960, 11440],
    [11440, 13020],
    [13020, 14700],
    [14700, 16480],
    [16480, 18360],
  ]

  public static getLevelDiffExpAdjuster(attackerLevel: number, targetLevel: number) {
    if (attackerLevel > targetLevel) {
      return 0.75
    } else if (attackerLevel < targetLevel) {
      return 1.25
    } else {
      return 1
    }
  }

  public static readonly NEXUS_HEALTH = 500

  public static readonly WINDOW_HEIGHT = 320
  public static readonly WINDOW_WIDTH = 480
  public static readonly GAME_HEIGHT = 800
  public static readonly GAME_WIDTH = 800

  public static LEFT_COLOR = 0x25956a
  public static RIGHT_COLOR = 0xff0000

  public static readonly LEFT_NEXUS_SPAWN = {
    x: 45,
    y: 750,
  }
  public static readonly RIGHT_NEXUS_SPAWN = {
    x: 750,
    y: 45,
  }

  public static readonly LEFT_SPAWN = {
    x: 15,
    y: 780,
  }

  public static readonly RIGHT_SPAWN = {
    x: 780,
    y: 15,
  }

  public static readonly LEFT_STARTING_POSITION = {
    x: 260,
    y: 460,
  }

  public static readonly RIGHT_STARTING_POSITION = {
    x: 460,
    y: 260,
  }

  public static LEFT_TOWER_CONFIGS = [
    {
      position: {
        x: 140,
        y: 660,
      },
    },
    {
      position: {
        x: 300,
        y: 500,
      },
    },
  ]

  public static RIGHT_TOWER_CONFIGS = [
    {
      position: {
        x: 660,
        y: 140,
      },
    },
    {
      position: {
        x: 500,
        y: 300,
      },
    },
  ]
}
