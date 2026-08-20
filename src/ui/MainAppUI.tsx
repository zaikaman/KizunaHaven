/**
 * Kizuna Haven - Main React-ECS UI Overlay Container
 */

import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs';
import { DailyPrompt, BottleMessage, BottleReactionType } from '../types';
import { DailyPromptModal } from './DailyPromptModal';
import { BottleViewerModal } from './BottleViewerModal';

export interface MainAppUIState {
  isDailyPromptOpen: boolean;
  activePrompt: DailyPrompt;
  isBottleViewerOpen: boolean;
  selectedBottle: BottleMessage | null;
  kizunaLevel: number;
  kizunaTitle: string;
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
        {/* Top Mobile Status Header (Safe Area) */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 52,
            positionType: 'absolute',
            position: { top: 12, left: 0 },
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: { left: 16, right: 16 }
          }}
        >
          {/* Level Tier Badge */}
          <UiEntity
            uiTransform={{
              height: 38,
              padding: { left: 12, right: 12 },
              justifyContent: 'center',
              alignItems: 'center'
            }}
            uiBackground={{ color: { r: 0.1, g: 0.15, b: 0.25, a: 0.85 } }}
          >
            <Label
              value={`🌸 Tier ${state.kizunaLevel} • ${state.kizunaTitle}`}
              fontSize={13}
              color={{ r: 0.98, g: 0.85, b: 0.2, a: 1 }}
            />
          </UiEntity>

          {/* Quick Daily Prompt Button */}
          <Button
            value="🔥 Daily Question"
            variant="primary"
            fontSize={12}
            uiTransform={{
              height: 40,
              padding: { left: 14, right: 14 }
            }}
            uiBackground={{ color: { r: 0.98, g: 0.45, b: 0.09, a: 0.9 } }}
            onMouseDown={callbacks.onToggleDailyPrompt}
          />
        </UiEntity>

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
