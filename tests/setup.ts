/**
 * Kizuna Haven - Vitest Setup & Mocked ECS Environment
 */

import { vi, beforeEach } from 'vitest';
import { InMemoryStorageDriver } from '../src/network/Persistence';
import { InMemoryTransport, StateBroadcaster } from '../src/network/StateBroadcaster';

// Polyfill global storage if missing
if (typeof globalThis.localStorage === 'undefined') {
  const inMemory = new InMemoryStorageDriver();
  (globalThis as any).localStorage = {
    getItem: (k: string) => inMemory.getItem(k),
    setItem: (k: string, v: string) => inMemory.setItem(k, v),
    removeItem: (k: string) => inMemory.removeItem(k),
    clear: () => {
      // Clear in-memory
    }
  };
}

/**
 * Creates a two-client simulated network session for multiplayer testing
 */
export function createMockNetworkPair(): {
  clientA: { id: string; broadcaster: StateBroadcaster };
  clientB: { id: string; broadcaster: StateBroadcaster };
  transport: InMemoryTransport;
} {
  const sharedTransport = new InMemoryTransport();
  const clientA = {
    id: 'user-alice-0x111',
    broadcaster: new StateBroadcaster('user-alice-0x111', sharedTransport)
  };
  const clientB = {
    id: 'user-bob-0x222',
    broadcaster: new StateBroadcaster('user-bob-0x222', sharedTransport)
  };

  return { clientA, clientB, transport: sharedTransport };
}

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
