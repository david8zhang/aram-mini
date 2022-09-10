import { Game } from '~/scenes/Game'
import { ChampionTypes } from '~/utils/ChampionTypes'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { AbilityKeys } from '../champion/abilities/AbilityKeys'
import { Fireball } from '../champion/abilities/wizard/Fireball'
import { FireBlastAOE } from '../champion/abilities/wizard/FireBlastAOE'
import { FlameSpread } from '../champion/abilities/wizard/FlameSpread'
import { TrackingFirebomb } from '../champion/abilities/wizard/TrackingFirebomb'
import { AutoAttackType } from '../champion/auto-attack/AutoAttackType'
import { Champion } from '../champion/Champion'
import { BehaviorTreeNode } from './behavior-tree/BehaviorTreeNode'
import { Blackboard } from './behavior-tree/Blackboard'
import { SelectorNode } from './behavior-tree/SelectorNode'
import { SequenceNode } from './behavior-tree/SequenceNode'
import { AttackNexus } from './behaviors/attack-nexus/AttackNexus'
import { CheckNexusTargetable } from './behaviors/attack-nexus/CheckNexusTargetable'
import { AutoAttackPlayer } from './behaviors/attack-player/AutoAttackPlayer'
import { CheckPlayerAttackable } from './behaviors/attack-player/CheckPlayerAttackable'
import { CheckPlayerLowHealth } from './behaviors/attack-player/CheckPlayerLowHealth'
import { CheckPlayerVulnerable } from './behaviors/attack-player/CheckPlayerVulnerable'
import { SelectAbility } from './behaviors/attack-player/SelectAbility'
import { SetTargetCandidates } from './behaviors/attack-player/SetTargetCandidates'
import { TargetPlayer } from './behaviors/attack-player/TargetPlayer'
import { UseAbility } from './behaviors/attack-player/UseAbility'
import { AttackTower } from './behaviors/attack-tower/AttackTower'
import { CheckTowerVulnerable } from './behaviors/attack-tower/CheckTowerVulnerable'
import { SetTargetTower } from './behaviors/attack-tower/SetTargetTower'
import { CheckStatusEffect } from './behaviors/CheckStatusEffect'
import { CheckIsDead } from './behaviors/death/CheckIsDead'
import { HandleDeath } from './behaviors/death/HandleDeath'
import { HasEnoughHealth } from './behaviors/emergency-retreat/HasEnoughHealth'
import { IsSafeFromTower } from './behaviors/emergency-retreat/IsSafeFromTower'
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
  public lastUsedAbilityTimestamp: number = 0

  constructor(game: Game) {
    this.game = game
    this.champion = new Champion(this.game, {
      texture: ChampionTypes.WIZARD,
      position: {
        x: Constants.RIGHT_NEXUS_SPAWN.x,
        y: Constants.RIGHT_NEXUS_SPAWN.y,
      },
      abilities: {
        [AbilityKeys.Q]: Fireball,
        [AbilityKeys.W]: FireBlastAOE,
        [AbilityKeys.E]: FlameSpread,
        [AbilityKeys.R]: TrackingFirebomb,
      },
      side: Side.RIGHT,
      autoAttackType: AutoAttackType.RANGED,
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

    // Choose to use either an ability or an auto attack
    const useAbilitySequence = new SequenceNode('UseAbilitySequence', blackboard, [
      new SelectAbility(blackboard, this),
      new UseAbility(blackboard),
    ])
    const autoAttackPlayer = new AutoAttackPlayer(blackboard)
    const abilityOrAutoAttackSelector = new SelectorNode(
      'AbilityOrAutoAttackSelector',
      blackboard,
      useAbilitySequence,
      autoAttackPlayer
    )

    const attackPlayerSequence = new SequenceNode('AttackPlayerSequence', blackboard, [
      setTargetCandidates,
      checkPlayerAttackable,
      checkPlayerLowHealth,
      checkPlayerVulnerable,
      targetPlayer,
      abilityOrAutoAttackSelector,
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
    // Add some pre-checks to see if it is safe to continue attacking or if retreat is necessary
    const isSafeFromTower = new IsSafeFromTower(blackboard)
    const hasEnoughHealth = new HasEnoughHealth(blackboard)
    const checkIsSafeSequence = new SequenceNode('IsSafeSequence', blackboard, [
      isSafeFromTower,
      hasEnoughHealth,
    ])
    const attackDecisionSequence = new SequenceNode('AttackDecisionSequence', blackboard, [
      checkIsSafeSequence,
      attackBehaviorSelector,
    ])

    // Retreat behaviors
    const isInDanger = new IsInDanger(blackboard)
    const moveTowardsBase = new MoveTowardsBase(blackboard)
    const moveOutOfDangerSequence = new SequenceNode('MoveTowardsBaseSequence', blackboard, [
      isInDanger,
      moveTowardsBase,
    ])
    const idle = new Idle(blackboard)
    const defensiveBehaviorSelector = new SelectorNode(
      'DefensiveSelector',
      blackboard,
      moveOutOfDangerSequence,
      idle
    )

    // Configure selector for what behavior to follow after reaching initial position in lane
    const postInitializationSelector = new SelectorNode(
      'PostInitializeSelector',
      blackboard,
      attackDecisionSequence,
      defensiveBehaviorSelector
    )

    // Check status effects in case status prevents champion from taking action (e.g. Stun)
    const checkStatusEffect = new CheckStatusEffect(blackboard)
    const postInitSequence = new SequenceNode('PostInitSeqeunce', blackboard, [
      checkStatusEffect,
      postInitializationSelector,
    ])

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
      postInitSequence
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
