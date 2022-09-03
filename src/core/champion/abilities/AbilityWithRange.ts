export interface AbilityWithRange {
  abilityRange: number
  abilityTarget: { x: number; y: number } | null
  triggerAbilityAtPosition(
    position: { x: number; y: number },
    onCompleteCallback: Function | null
  ): void
  isInRange(): boolean
}
