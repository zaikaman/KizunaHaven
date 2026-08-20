/**
 * Kizuna Haven - Lumi Spirit Companion AI System (Solo Visitor Guide & Assist)
 */

import { LumiCompanionState, Vector3D } from '../types';
import { WORLD_CONFIG } from '../config';

export class LumiCompanionSystem {
  private state: LumiCompanionState;
  private currentCoords: Vector3D;
  private homePerch: Vector3D = { x: 16.0, y: 1.8, z: 17.5 }; // Perched on campfire log bench

  constructor() {
    this.currentCoords = { ...this.homePerch };
    this.state = {
      currentMode: 'IDLE_PERCH',
      targetPlayerId: null,
      targetPosition: { ...this.homePerch },
      assistPlateIndex: null,
      animationState: 'FLY_IDLE'
    };
  }

  public getState(): LumiCompanionState {
    return { ...this.state, targetPosition: { ...this.currentCoords } };
  }

  public updatePlayerPosition(playerId: string, playerPos: Vector3D, isSolo = true): void {
    if (!isSolo) {
      // Multiple players in world; Lumi rests happily near campfire
      if (this.state.currentMode === 'FOLLOW_GUIDE') {
        this.state.currentMode = 'IDLE_PERCH';
        this.state.targetPlayerId = null;
        this.state.animationState = 'FLY_IDLE';
        this.state.targetPosition = { ...this.homePerch };
      }
      return;
    }

    // Solo player: Accompany them with a soft floating offset (1.5m behind, 1.2m above)
    this.state.currentMode = 'FOLLOW_GUIDE';
    this.state.targetPlayerId = playerId;
    this.state.animationState = 'FLOAT_FOLLOW';
    this.state.targetPosition = {
      x: playerPos.x - 0.8,
      y: playerPos.y + 1.2,
      z: playerPos.z - 0.8
    };
  }

  public handleCoOpPlateInteraction(playerId: string, triggeredPlateIndex: number): void {
    if (this.state.targetPlayerId === playerId || this.state.currentMode === 'FOLLOW_GUIDE') {
      this.state.currentMode = 'COOP_ASSIST';
      // Partner with the solo player by standing on the opposing plate
      this.state.assistPlateIndex = triggeredPlateIndex === 0 ? 1 : 0;
      this.state.animationState = 'PRESS_SWITCH';

      // Move Lumi onto the assist plate position in the puzzle area
      this.state.targetPosition = {
        x: WORLD_CONFIG.COOP_PUZZLE_CENTER.x + (this.state.assistPlateIndex === 0 ? -1.5 : 1.5),
        y: WORLD_CONFIG.COOP_PUZZLE_CENTER.y + 0.5,
        z: WORLD_CONFIG.COOP_PUZZLE_CENTER.z
      };
    }
  }

  public resetToPerch(): void {
    this.state.currentMode = 'IDLE_PERCH';
    this.state.targetPlayerId = null;
    this.state.assistPlateIndex = null;
    this.state.animationState = 'FLY_IDLE';
    this.state.targetPosition = { ...this.homePerch };
  }

  public tick(dtSeconds: number): void {
    // Smooth exponential decay interpolation towards target position (lerp)
    const lerpFactor = Math.min(dtSeconds * 3.5, 1.0);
    this.currentCoords.x += (this.state.targetPosition.x - this.currentCoords.x) * lerpFactor;
    this.currentCoords.y += (this.state.targetPosition.y - this.currentCoords.y) * lerpFactor;
    this.currentCoords.z += (this.state.targetPosition.z - this.currentCoords.z) * lerpFactor;
  }
}
