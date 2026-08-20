/**
 * Kizuna Haven - Main Scene Entry Point & ECS Bootstrap
 */

import { ReactEcsRenderer } from '@dcl/sdk/react-ecs';
import { StateBroadcaster } from './network/StateBroadcaster';
import { PersistenceManager } from './network/Persistence';
import { DailyHearthSystem } from './systems/DailyHearthSystem';
import { BottleLagoonSystem } from './systems/BottleLagoonSystem';
import { LumiCompanionSystem } from './systems/LumiCompanionSystem';
import { CampfireHubScene } from './scenes/CampfireHubScene';
import { createMainAppUI, MainAppUIState } from './ui/MainAppUI';
import { BottleMessage, BottleReactionType } from './types';
import { KIZUNA_TIERS, WORLD_CONFIG } from './config';

export interface WorldContext {
  localUserId: string;
  broadcaster: StateBroadcaster;
  persistence: PersistenceManager;
  hearthSystem: DailyHearthSystem;
  lagoonSystem: BottleLagoonSystem;
  lumiSystem: LumiCompanionSystem;
  campfireScene?: CampfireHubScene;
  isInitialized: boolean;
}

let context: WorldContext | null = null;

// Reactive UI state
let isDailyPromptOpen = false;
let isBottleViewerOpen = false;
let selectedBottle: BottleMessage | null = null;
let toastMessage: string | null = null;
let toastTimer: any = null;

function showToast(msg: string): void {
  toastMessage = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage = null;
  }, 3500);
}

export function initializeWorld(userId = 'local-player', userName = 'Explorer', isHeadless = false): WorldContext {
  const persistence = new PersistenceManager();
  const broadcaster = new StateBroadcaster(userId);

  // Initialize Systems
  const hearthSystem = new DailyHearthSystem(persistence);
  const lagoonSystem = new BottleLagoonSystem(persistence, broadcaster);
  const lumiSystem = new LumiCompanionSystem();

  // Initialize user profile & streak
  const profile = persistence.getProfile(userId, userName);
  const checkIn = persistence.recordDailyCheckIn(userId);

  let campfireScene: CampfireHubScene | undefined;

  if (!isHeadless) {
    // 3D Scene Assembly
    campfireScene = new CampfireHubScene(lagoonSystem, lumiSystem, {
      onOpenDailyPrompt: () => {
        isDailyPromptOpen = true;
        isBottleViewerOpen = false;
      },
      onOpenBottle: (bottle: BottleMessage) => {
        selectedBottle = bottle;
        isBottleViewerOpen = true;
        isDailyPromptOpen = false;
      },
      onLumiInteract: () => {
        persistence.addXp(userId, 10);
        showToast('Interacted with Lumi Spirit Companion (+10 XP)');
      }
    });

    // Mount React-ECS Declarative UI
    const getUIState = (): MainAppUIState => {
      const p = persistence.getProfile(userId);
      const tier = KIZUNA_TIERS.find(t => t.level === p.kizunaLevel) ?? KIZUNA_TIERS[0];
      return {
        isDailyPromptOpen,
        activePrompt: hearthSystem.getActivePrompt(),
        isBottleViewerOpen,
        selectedBottle,
        kizunaLevel: p.kizunaLevel,
        kizunaXp: p.kizunaXp,
        kizunaTitle: tier.title,
        toastMessage
      };
    };

    const uiRenderer = createMainAppUI(getUIState, {
      onToggleDailyPrompt: () => {
        isDailyPromptOpen = !isDailyPromptOpen;
      },
      onSubmitDailyOption: (optionIndex: number) => {
        const activePrompt = hearthSystem.getActivePrompt();
        hearthSystem.submitAnswer({
          answerId: `ans_${Date.now()}`,
          promptId: activePrompt.promptId,
          authorId: userId,
          authorName: userName,
          selectedOptionIndex: optionIndex,
          timestamp: Date.now()
        });
        isDailyPromptOpen = false;
        const optText = activePrompt.options?.[optionIndex] ?? 'Option';
        showToast(`Answer Recorded: "${optText}" (+50 XP)`);
      },
      onReactToBottle: (bottleId: string, reaction: BottleReactionType) => {
        lagoonSystem.reactToBottle(bottleId, reaction);
        if (selectedBottle && selectedBottle.bottleId === bottleId) {
          selectedBottle = lagoonSystem.getBottleById(bottleId) ?? null;
        }
        showToast('Reacted to bottle note (+5 XP)');
      },
      onOpenBottleComposer: () => {
        // Cast sample friendly bottle
        lagoonSystem.launchBottle({
          authorId: userId,
          authorName: userName,
          content: 'Sending warm vibes from the campfire.',
          ribbonColor: 'gold'
        });
        campfireScene?.spawnLagoonBottles();
        isBottleViewerOpen = false;
        showToast('Cast a Message Bottle into the Lagoon (+30 XP)');
      },
      onCloseModals: () => {
        isDailyPromptOpen = false;
        isBottleViewerOpen = false;
        selectedBottle = null;
      }
    });

    ReactEcsRenderer.setUiRenderer(uiRenderer);
  }

  context = {
    localUserId: userId,
    broadcaster,
    persistence,
    hearthSystem,
    lagoonSystem,
    lumiSystem,
    campfireScene,
    isInitialized: true
  };

  console.log(`[Kizuna Haven] World started for ${profile.displayName} (Tier ${profile.kizunaLevel}, Streak: ${checkIn.streak} days)`);
  console.log(`[Kizuna Haven] Campfire at (${WORLD_CONFIG.CAMPFIRE_CENTER.x}, ${WORLD_CONFIG.CAMPFIRE_CENTER.z})`);

  return context;
}

export function getWorldContext(): WorldContext {
  if (!context) {
    return initializeWorld('local-player', 'Explorer', true);
  }
  return context;
}

export function main(): void {
  initializeWorld('local-player', 'Explorer', false);
}
