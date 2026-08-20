/**
 * Kizuna Haven - Lumi Spirit Companion ECS Component
 */

import { LumiCompanionState, Vector3D } from '../types';

export interface LumiCompanionComponent {
  state: LumiCompanionState;
  homePerch: Vector3D;
  currentVelocity: Vector3D;
  glowIntensity: number; // 0.0 to 1.0
  hoverHeight: number;
}
