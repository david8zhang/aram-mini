export class Constants {
  public static readonly MINION_MOVE_SPEED = 50
  public static readonly MINION_ATTACK_DELAY = 2000
  public static readonly MINION_DAMAGE = 10
  public static readonly MINION_HEALTH = 50
  public static readonly MINION_ATTACK_RANGE = 50

  public static readonly CHAMPION_MOVE_SPEED = 100
  public static readonly CHAMPION_ATTACK_DELAY = 1000
  public static readonly CHAMPION_DAMAGE = 20
  public static readonly CHAMPION_HEALTH = 500
  public static readonly CHAMPION_ATTACK_RANGE = 75

  public static readonly TOWER_DAMAGE_MAPPING = {
    Minion: 40,
    Champion: 160,
  }
  public static readonly TOWER_ATTACK_DELAY = 2000
  public static readonly TOWER_HEALTH = 500
  public static readonly TOWER_ATTACK_RADIUS = 75

  public static readonly NEXUS_HEALTH = 500

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
