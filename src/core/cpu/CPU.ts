import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../champion/Champion'
import { BehaviorTreeNode } from './behavior-tree/BehaviorTreeNode'
import { Blackboard } from './behavior-tree/Blackboard'
import { SelectorNode } from './behavior-tree/SelectorNode'
import { SequenceNode } from './behavior-tree/SequenceNode'
import { AttackNexus } from './behaviors/attack-nexus/AttackNexus'
import { CheckNexusTargetable } from './behaviors/attack-nexus/CheckNexusTargetable'
import { AttackPlayer } from './behaviors/attack-player/AttackPlayer'
import { CheckPlayerAttackable } from './behaviors/attack-player/CheckPlayerAttackable'
import { CheckPlayerLowHealth } from './behaviors/attack-player/CheckPlayerLowHealth'
import { CheckPlayerVulnerable } from './behaviors/attack-player/CheckPlayerVulnerable'
import { SetTargetCandidates } from './behaviors/attack-player/SetTargetCandidates'
import { TargetPlayer } from './behaviors/attack-player/TargetPlayer'
import { AttackTower } from './behaviors/attack-tower/AttackTower'
import { CheckTowerVulnerable } from './behaviors/attack-tower/CheckTowerVulnerable'
import { SetTargetTower } from './behaviors/attack-tower/SetTargetTower'
import { CheckIsDead } from './behaviors/death/CheckIsDead'
import { HandleDeath } from './behaviors/death/HandleDeath'
import { AttackMinion } from './behaviors/farm-minions/AttackMinion'
import { TargetMinion } from './behaviors/farm-minions/TargetMinion'
import { CheckCompletedOncePerSpawn } from './behaviors/init/CheckCompletedOncePerSpawn'
import { MarkCompletedOncePerSpawn } from './behaviors/init/MarkCompletedOncePerSpawn'
import { MoveToStartPosition } from './behaviors/init/MoveToStartPosition'
import { PopulateBlackboard } from './behaviors/PopulateBlackboard'
import { Idle } from './behaviors/retreat/Idle'
import { IsInDanger } from './behaviors/retreat/IsInDanger'
import { MoveTowardsBase } from './behaviors/retreat/MoveTowardsBase'

export class CPU {
  public game: Game
  public champion: Champion
  public side: Side = Side.RIGHT
  public behaviorTree!: BehaviorTreeNode
  public didCompleteOnSpawn: boolean = false

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
    this.champion.onDestroyedCallbacks.push(() => {
      this.didCompleteOnSpawn = false
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
    const setTargetCandidates = new SetTargetCandidates(blackboard)
    const checkPlayerAttackable = new CheckPlayerAttackable(blackboard)
    const checkPlayerLowHealth = new CheckPlayerLowHealth(blackboard)
    const checkPlayerVulnerable = new CheckPlayerVulnerable(blackboard)
    const targetPlayer = new TargetPlayer(blackboard)
    const attackPlayer = new AttackPlayer(blackboard)
    const attackPlayerSequence = new SequenceNode('AttackPlayerSequence', blackboard, [
      setTargetCandidates,
      checkPlayerAttackable,
      checkPlayerLowHealth,
      checkPlayerVulnerable,
      targetPlayer,
      attackPlayer,
    ])

    // Attack Turret Behaviors
    const setTargetTower = new SetTargetTower(blackboard)
    const checkTowerVulnerable = new CheckTowerVulnerable(blackboard)
    const attackTower = new AttackTower(blackboard)
    const attackTowerSequence = new SequenceNode('AttackTowerSequence', blackboard, [
      setTargetTower,
      checkTowerVulnerable,
      attackTower,
    ])

    // Attack Nexus Behavior
    const checkNexusTargetable = new CheckNexusTargetable(blackboard)
    const attackNexus = new AttackNexus(blackboard)
    const attackNexusSequence = new SequenceNode('AttackNexusSequence', blackboard, [
      checkNexusTargetable,
      attackNexus,
    ])

    const attackObjectivesSelector = new SelectorNode(
      'AttackObjectivesSelector',
      blackboard,
      attackTowerSequence,
      attackNexusSequence
    )

    const pushLaneSelector = new SelectorNode(
      'PushLaneSelector',
      blackboard,
      attackPlayerSequence,
      attackObjectivesSelector
    )

    // Farm Minion Behaviors
    const targetMinion = new TargetMinion(blackboard)
    const attackMinion = new AttackMinion(blackboard)
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
    const isInDanger = new IsInDanger(blackboard)
    const moveTowardsBase = new MoveTowardsBase(blackboard)
    const moveOutOfDangerSequence = new SequenceNode('MoveTowardsBaseSequence', blackboard, [
      isInDanger,
      moveTowardsBase,
    ])
    const idle = new Idle(blackboard)
    const retreatBehaviorSelector = new SelectorNode(
      'RetreatSelector',
      blackboard,
      moveOutOfDangerSequence,
      idle
    )

    // Configure selector for what behavior to follow after reaching initial position in lane
    const postInitializationSelector = new SelectorNode(
      'PostInitializeSelector',
      blackboard,
      attackBehaviorSelector,
      retreatBehaviorSelector
    )

    // Configure once per spawn behaviors
    const checkCompletedOncePerSpawn = new CheckCompletedOncePerSpawn(blackboard, this)
    const moveToStartPosition = new MoveToStartPosition(blackboard)
    const markCompletedOncePerSpawn = new MarkCompletedOncePerSpawn(blackboard, this)
    const oncePerSpawnBehaviorSequence = new SequenceNode(
      'OncePerSpawnBehaviorSequence',
      blackboard,
      [checkCompletedOncePerSpawn, moveToStartPosition, markCompletedOncePerSpawn]
    )

    // Configure selector between attack/retreat
    const championBehaviorSelector = new SelectorNode(
      'ChampionAliveSelector',
      blackboard,
      oncePerSpawnBehaviorSequence,
      postInitializationSelector
    )

    const checkIsDead = new CheckIsDead(blackboard)
    const handleDeath = new HandleDeath(blackboard)
    const handleDeathSequence = new SequenceNode('HandleDeathSequence', blackboard, [
      checkIsDead,
      handleDeath,
    ])

    const topLevelSelector = new SelectorNode(
      'TopLevel',
      blackboard,
      handleDeathSequence,
      championBehaviorSelector
    )

    // Populate blackboard before selecting between behaviors
    const populateBlackboardNode = new PopulateBlackboard(blackboard, this)
    const topLevelSequenceNode = new SequenceNode('TopLevelSequence', blackboard, [
      populateBlackboardNode,
      topLevelSelector,
    ])

    // Behavior Tree
    this.behaviorTree = topLevelSequenceNode
  }
}
