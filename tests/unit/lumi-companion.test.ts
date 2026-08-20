import { describe, it, expect } from 'vitest';
import { LumiCompanionSystem } from '../../src/systems/LumiCompanionSystem';
import { Vector3D } from '../../src/types';

describe('LumiCompanionSystem (Solo Spirit AI Guide & Assist)', () => {
  it('initializes in IDLE_PERCH mode near campfire when no players are active', () => {
    const lumi = new LumiCompanionSystem();
    const state = lumi.getState();

    expect(state.currentMode).toBe('IDLE_PERCH');
    expect(state.targetPlayerId).toBeNull();
    expect(state.animationState).toBe('FLY_IDLE');
  });

  it('transitions to FOLLOW_GUIDE mode when a solo player approaches', () => {
    const lumi = new LumiCompanionSystem();

    const playerPos: Vector3D = { x: 16, y: 0, z: 12 };
    lumi.updatePlayerPosition('solo-user-1', playerPos, true); // true = isSolo

    const state = lumi.getState();
    expect(state.currentMode).toBe('FOLLOW_GUIDE');
    expect(state.targetPlayerId).toBe('solo-user-1');
    expect(state.animationState).toBe('FLOAT_FOLLOW');
  });

  it('transitions to COOP_ASSIST when solo player steps onto a 2-player co-op trigger plate', () => {
    const lumi = new LumiCompanionSystem();

    // Player steps on Co-op Plate 0
    lumi.updatePlayerPosition('solo-user-1', { x: 23, y: 2, z: 23 }, true);
    lumi.handleCoOpPlateInteraction('solo-user-1', 0);

    const state = lumi.getState();
    expect(state.currentMode).toBe('COOP_ASSIST');
    expect(state.assistPlateIndex).toBe(1); // steps on plate 1 to assist plate 0
    expect(state.animationState).toBe('PRESS_SWITCH');
  });

  it('smoothly interpolates position towards target player or perch', () => {
    const lumi = new LumiCompanionSystem();
    const initialPos = { ...lumi.getState().targetPosition };

    // Move player far away
    lumi.updatePlayerPosition('solo-user-1', { x: 8, y: 0, z: 24 }, true);
    lumi.tick(0.5); // 500ms delta time

    const updatedPos = lumi.getState().targetPosition;
    expect(updatedPos.x).not.toBe(initialPos.x);
    expect(updatedPos.z).not.toBe(initialPos.z);
  });
});
