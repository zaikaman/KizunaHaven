import { describe, it, expect } from 'vitest';
import { BottleLagoonSystem } from '../../src/systems/BottleLagoonSystem';
import { PersistenceManager, InMemoryStorageDriver } from '../../src/network/Persistence';
import { StateBroadcaster } from '../../src/network/StateBroadcaster';
import { createMockNetworkPair } from '../setup';
import { WORLD_CONFIG } from '../../src/config';

describe('BottleLagoonSystem (Asynchronous Bottle Mail & Physics)', () => {
  it('launches a new bottle and persists in lagoon with valid bounds', () => {
    const memory = new InMemoryStorageDriver();
    const persistence = new PersistenceManager(memory);
    const broadcaster = new StateBroadcaster('user-1');
    const lagoon = new BottleLagoonSystem(persistence, broadcaster);

    const result = lagoon.launchBottle({
      authorId: 'user-1',
      authorName: 'Aria',
      content: 'Hope you have a wonderful day exploring!',
      ribbonColor: 'gold'
    });

    expect(result.success).toBe(true);
    expect(result.bottle).toBeDefined();
    expect(result.bottle?.reactions.heart).toBe(0);

    const bottles = lagoon.getActiveBottles();
    expect(bottles.length).toBeGreaterThanOrEqual(1);
    expect(bottles[0].authorName).toBe('Aria');
  });

  it('rejects bottle messages with empty content or over 180 characters', () => {
    const memory = new InMemoryStorageDriver();
    const persistence = new PersistenceManager(memory);
    const broadcaster = new StateBroadcaster('user-1');
    const lagoon = new BottleLagoonSystem(persistence, broadcaster);

    const emptyResult = lagoon.launchBottle({
      authorId: 'user-1',
      authorName: 'Aria',
      content: '',
      ribbonColor: 'pink'
    });
    expect(emptyResult.success).toBe(false);

    const longResult = lagoon.launchBottle({
      authorId: 'user-1',
      authorName: 'Aria',
      content: 'Z'.repeat(181),
      ribbonColor: 'pink'
    });
    expect(longResult.success).toBe(false);
  });

  it('enforces maximum 20 bottles in lagoon, archiving oldest entries', () => {
    const memory = new InMemoryStorageDriver();
    const persistence = new PersistenceManager(memory);
    const broadcaster = new StateBroadcaster('user-1');
    const lagoon = new BottleLagoonSystem(persistence, broadcaster);

    // Launch 25 bottles
    for (let i = 1; i <= 25; i++) {
      lagoon.launchBottle({
        authorId: `user-${i}`,
        authorName: `User ${i}`,
        content: `Note #${i}`,
        ribbonColor: 'cyan'
      });
    }

    const active = lagoon.getActiveBottles();
    expect(active.length).toBeLessThanOrEqual(WORLD_CONFIG.MAX_LAGOON_BOTTLES);
    // Most recent note #25 must be present
    expect(active.some(b => b.content === 'Note #25')).toBe(true);
  });

  it('broadcasts reaction to a bottle and increments reaction count', () => {
    const { clientA, clientB } = createMockNetworkPair();
    const persistenceA = new PersistenceManager(new InMemoryStorageDriver());
    const persistenceB = new PersistenceManager(new InMemoryStorageDriver());

    const lagoonA = new BottleLagoonSystem(persistenceA, clientA.broadcaster);
    const lagoonB = new BottleLagoonSystem(persistenceB, clientB.broadcaster);

    const launch = lagoonA.launchBottle({
      authorId: clientA.id,
      authorName: 'Alice',
      content: 'Music is life',
      ribbonColor: 'purple'
    });

    const bottleId = launch.bottle!.bottleId;

    // Bob reacts with HEART
    lagoonB.reactToBottle(bottleId, 'HEART');

    const updatedBottle = lagoonA.getBottleById(bottleId);
    expect(updatedBottle?.reactions.heart).toBe(1);
  });

  it('calculates smooth sine-wave bobbing heights over delta time', () => {
    const memory = new InMemoryStorageDriver();
    const persistence = new PersistenceManager(memory);
    const broadcaster = new StateBroadcaster('user-1');
    const lagoon = new BottleLagoonSystem(persistence, broadcaster);

    const initialY = lagoon.calculateWaterBobbingY(0, 0);
    const elevatedY = lagoon.calculateWaterBobbingY(1.0, 0); // after 1s

    expect(typeof initialY).toBe('number');
    expect(typeof elevatedY).toBe('number');
    expect(elevatedY).not.toBe(initialY);
  });
});
