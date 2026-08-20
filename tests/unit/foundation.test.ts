import { describe, it, expect } from 'vitest';
import { PersistenceManager, InMemoryStorageDriver } from '../../src/network/Persistence';
import { initializeWorld } from '../../src/index';
import { createMockNetworkPair } from '../setup';

describe('Foundational Infrastructure', () => {
  it('initializes world and loads KizunaProfile', () => {
    const context = initializeWorld('test-user-1', 'Aria', true);
    expect(context.isInitialized).toBe(true);
    expect(context.localUserId).toBe('test-user-1');

    const profile = context.persistence.getProfile('test-user-1');
    expect(profile.displayName).toBe('Aria');
    expect(profile.kizunaLevel).toBe(1);
    expect(profile.kizunaXp).toBe(0);
    expect(profile.streakDays).toBe(1);
  });

  it('calculates Kizuna XP leveling and unlocks props correctly', () => {
    const memory = new InMemoryStorageDriver();
    const persistence = new PersistenceManager(memory);

    // Initial level 1
    const p1 = persistence.getProfile('user-level-test', 'Kiko');
    expect(p1.kizunaLevel).toBe(1);

    // Add 100 XP -> should hit Level 2 (Campfire Friend) and unlock 'sparkler'
    const result1 = persistence.addXp('user-level-test', 100);
    expect(result1.leveledUp).toBe(true);
    expect(result1.profile.kizunaLevel).toBe(2);
    expect(result1.profile.unlockedProps).toContain('sparkler');

    // Add 350 XP -> Total 450 XP -> should hit Level 4 and unlock 'lofi_boombox'
    const result2 = persistence.addXp('user-level-test', 350);
    expect(result2.leveledUp).toBe(true);
    expect(result2.profile.kizunaLevel).toBe(4);
    expect(result2.profile.unlockedProps).toContain('lofi_boombox');
  });

  it('broadcasts and receives strongly-typed messages between multiple clients', () => {
    const { clientA, clientB } = createMockNetworkPair();
    let receivedPayload: any = null;
    let senderReceived = '';

    // Bob listens for High-Five requests
    clientB.broadcaster.on('SOCIAL_GESTURE_REQUEST', (payload, senderId) => {
      receivedPayload = payload;
      senderReceived = senderId;
    });

    // Alice broadcasts High-Five request to Bob
    clientA.broadcaster.broadcast('SOCIAL_GESTURE_REQUEST', {
      targetUserId: clientB.id,
      gestureType: 'HIGH_FIVE',
      originPosition: { x: 16, y: 0, z: 16 }
    });

    expect(receivedPayload).not.toBeNull();
    expect(receivedPayload.gestureType).toBe('HIGH_FIVE');
    expect(senderReceived).toBe(clientA.id);
  });
});
