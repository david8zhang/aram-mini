import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../champion/Champion'
import { BehaviorTreeNode } from './behavior-tree/BehaviorTreeNode'
import { Blackboard } from './behavior-tree/Blackboard'
import { SelectorNode } from './behavior-tree/SelectorNode'
import { SequenceNode } from './behavior-tree/SequenceNode'
import { AttackPlayer } from './behaviors/attack-player/AttackPlayer'
import { CheckPlayerAttackable } from './behaviors/attack-player/CheckPlayerAttackable'
import { CheckPlayerLowHealth } from './behaviors/attack-player/CheckPlayerLowHealth'
import { CheckPlayerVulnerable } from './behaviors/attack-player/CheckPlayerVulnerable'
import { SetTargetCandidates } from './behaviors/attack-player/SetTargetCandidates'
import { TargetPlayer } from './behaviors/attack-player/TargetPlayer'
import { AttackTower } from './behaviors/attack-tower/AttackTower'
import { CheckTowerVulnerable } from './behaviors/attack-tower/CheckTowerVulnerable'
import { SetTargetTower } from './behaviors/attack-tower/SetTargetTower'
import { AttackMinion } from './behaviors/farm-minions/AttackMinion'
import { TargetMinion } from './behaviors/farm-minions/TargetMinion'
import { PopulateBlackboard } from './behaviors/PopulateBlackboard'
import { Idle } from './behaviors/retreat/Idle'
import { IsInDanger } from './behaviors/retreat/IsInDanger'
import { MoveTowardsBase } from './behaviors/retreat/MoveTowardsBase'

export class CPU {
  public game: Game
  public champion: Champion
  public side: Side = Side.RIGHT
  public behaviorTree!: BehaviorTreeNode

  constructor(game: Game) {
    this.game = game
    this.champion = new Champion(this.game, {
      texture: 'wizard',
      position: {
        x: Constants.RIGHT_NEXUS_SPAWN.x,
        y: Constants.RIGHT_NEXUS_SPAWN.y,
      },
      side: Side.RIGHT,
    })
    this.setupBehaviorTree()
  }

  update() {
    this.champion.update()
    this.behaviorTree.tick()
  }

  setupBehaviorTree() {
    const blackboard = new Blackboard()

    // Attack Player Behaviors
    const setTargetCandidates = new SetTargetCandidates('SetTargetCandidates', blackboard)
    const checkPlayerAttackable = new CheckPlayerAttackable('CheckPlayerAttackable', blackboard)
    const checkPlayerLowHealth = new CheckPlayerLowHealth('CheckPlayerLowHealth', blackboard)
    const checkPlayerVulnerable = new CheckPlayerVulnerable('CheckPlayerVulnerable', blackboard)
    const targetPlayer = new TargetPlayer('TargetPlayer', blackboard)
    const attackPlayer = new AttackPlayer('AttackPlayer', blackboard)
    const attackPlayerSequence = new SequenceNode('AttackPlayerSequence', blackboard, [
      setTargetCandidates,
      checkPlayerAttackable,
      checkPlayerLowHealth,
      checkPlayerVulnerable,
      targetPlayer,
      attackPlayer,
    ])

    // Attack Turret Behaviors
    const setTargetTower = new SetTargetTower('SetTargetTower', blackboard)
    const checkTowerVulnerable = new CheckTowerVulnerable('CheckTowerVulnerable', blackboard)
    const attackTower = new AttackTower('AttackTower', blackboard)
    const attackTowerSequence = new SequenceNode('AttackTowerSequence', blackboard, [
      setTargetTower,
      checkTowerVulnerable,
      attackTower,
    ])
    const pushLaneSelector = new SelectorNode(
      'PushLaneSelector',
      blackboard,
      attackPlayerSequence,
      attackTowerSequence
    )

    // Farm Minion Behaviors
    const targetMinion = new TargetMinion('TargetMinion', blackboard)
    const attackMinion = new AttackMinion('AttackMinion', blackboard)
    const farmMinionSequence = new SequenceNode('FarmMinionSequence', blackboard, [
      targetMinion,
      attackMinion,
    ])

    // Select between Attack Behaviors
    const attackBehaviorSelector = new SelectorNode(
      'AttackSelector',
      blackboard,
      pushLaneSelector,
      farmMinionSequence
    )

    // Retreat behaviors
    const isInDanger = new IsInDanger('IsInDanger', blackboard)
    const moveTowardsBase = new MoveTowardsBase('MoveTowardsBase', blackboard)
    const moveOutOfDangerSequence = new SequenceNode('MoveTowardsBaseSequence', blackboard, [
      isInDanger,
      moveTowardsBase,
    ])
    const idle = new Idle('Idle', blackboard)
    const retreatBehaviorSelector = new SelectorNode(
      'RetreatSelector',
      blackboard,
      moveOutOfDangerSequence,
      idle
    )

    // Configure selector between attack/retreat
    const topLevelSelector = new SelectorNode(
      'TopLevel',
      blackboard,
      attackBehaviorSelector,
      retreatBehaviorSelector
    )

    // Populate blackboard before selecting between behaviors
    const populateBlackboardNode = new PopulateBlackboard('PopulateBlackboard', blackboard, this)
    const topLevelSequenceNode = new SequenceNode('TopLevelSequence', blackboard, [
      populateBlackboardNode,
      topLevelSelector,
    ])

    // Behavior Tree
    this.behaviorTree = topLevelSequenceNode
  }
}
