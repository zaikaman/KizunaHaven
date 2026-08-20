/**
 * Kizuna Haven - Main React-ECS Game HUD & UI Overlay Container
 */

import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs';
import { DailyPrompt, BottleMessage, BottleReactionType } from '../types';
import { DailyPromptModal } from './DailyPromptModal';
import { BottleViewerModal } from './BottleViewerModal';
import { DCL_THEME } from './GameQuestCard';

export interface MainAppUIState {
  isDailyPromptOpen: boolean;
  activePrompt: DailyPrompt;
  isBottleViewerOpen: boolean;
  selectedBottle: BottleMessage | null;
  kizunaLevel: number;
  kizunaXp: number;
  kizunaTitle: string;
  toastMessage: string | null;
}

export interface MainAppUICallbacks {
  onToggleDailyPrompt: () => void;
  onSubmitDailyOption: (optionIndex: number) => void;
  onReactToBottle: (bottleId: string, reaction: BottleReactionType) => void;
  onCloseModals: () => void;
  onOpenBottleComposer: () => void;
}

export function createMainAppUI(
  getState: () => MainAppUIState,
  callbacks: MainAppUICallbacks
): () => ReactEcs.JSX.Element {
  return () => {
    const state = getState();

    return (
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          positionType: 'absolute',
          position: { top: 0, left: 0 }
        }}
      >
        {/* Top Game HUD Header (Centered in safe viewport area) */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 48,
            positionType: 'absolute',
            position: { top: 20, left: 0 },
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Level & XP Status Capsule */}
          <UiEntity
            uiTransform={{
              height: 38,
              padding: { left: 16, right: 18 },
              flexDirection: 'row',
              alignItems: 'center',
              margin: { right: 12 }
            }}
            uiBackground={{ color: DCL_THEME.CARD_BG }}
          >
            <Label
              value={`TIER ${state.kizunaLevel}`}
              fontSize={13}
              color={DCL_THEME.TEXT_GOLD}
              uiTransform={{ margin: { right: 8 } }}
            />
            <Label
              value={`-  ${state.kizunaTitle}  (${state.kizunaXp} XP)`}
              fontSize={13}
              color={DCL_THEME.TEXT_WHITE}
            />
          </UiEntity>

          {/* DCL Gaming Quest Action Button */}
          <Button
            value="HEARTH QUEST"
            fontSize={12}
            uiTransform={{
              height: 38,
              padding: { left: 18, right: 18 }
            }}
            uiBackground={{ color: DCL_THEME.ORANGE_BADGE }}
            onMouseDown={callbacks.onToggleDailyPrompt}
          />
        </UiEntity>

        {/* Celebration Toast Banner (DCL Reward Banner Style) */}
        {state.toastMessage && (
          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              position: { top: 76, left: '25%' },
              width: '50%',
              height: 42,
              justifyContent: 'center',
              alignItems: 'center',
              padding: { left: 16, right: 16 }
            }}
            uiBackground={{ color: DCL_THEME.CORAL_ACTION }}
          >
            <Label
              value={state.toastMessage}
              fontSize={13}
              color={DCL_THEME.TEXT_WHITE}
            />
          </UiEntity>
        )}

        {/* Modals */}
        <DailyPromptModal
          isOpen={state.isDailyPromptOpen}
          prompt={state.activePrompt}
          onSubmitOption={callbacks.onSubmitDailyOption}
          onSubmitText={() => {}}
          onClose={callbacks.onCloseModals}
        />

        <BottleViewerModal
          isOpen={state.isBottleViewerOpen}
          bottle={state.selectedBottle}
          onReact={callbacks.onReactToBottle}
          onOpenComposer={callbacks.onOpenBottleComposer}
          onClose={callbacks.onCloseModals}
        />
      </UiEntity>
    );
  };
}
