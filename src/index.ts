/**
 * Kizuna Haven - Main Scene Entry Point & ECS Bootstrap
 */

import { StateBroadcaster } from './network/StateBroadcaster';
import { PersistenceManager } from './network/Persistence';
import { WORLD_CONFIG } from './config';

export interface WorldContext {
  localUserId: string;
  broadcaster: StateBroadcaster;
  persistence: PersistenceManager;
  isInitialized: boolean;
}

let context: WorldContext | null = null;

export function initializeWorld(userId = 'local-player', userName = 'Explorer'): WorldContext {
  const persistence = new PersistenceManager();
  const broadcaster = new StateBroadcaster(userId);

  // Initialize or load user profile
  const profile = persistence.getProfile(userId, userName);
  const checkIn = persistence.recordDailyCheckIn(userId);

  context = {
    localUserId: userId,
    broadcaster,
    persistence,
    isInitialized: true
  };

  console.log(`[Kizuna Haven] Initialized world for ${profile.displayName} (Level ${profile.kizunaLevel}, Streak: ${checkIn.streak} days)`);
  console.log(`[Kizuna Haven] Scene center: (${WORLD_CONFIG.CAMPFIRE_CENTER.x}, ${WORLD_CONFIG.CAMPFIRE_CENTER.z})`);

  return context;
}

export function getWorldContext(): WorldContext {
  if (!context) {
    return initializeWorld();
  }
  return context;
}

/**
 * Decentraland SDK 7 main entry function
 */
export function main(): void {
  initializeWorld();
}
