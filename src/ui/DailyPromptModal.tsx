/**
 * Kizuna Haven - Daily Prompt Mobile Modal Component (React-ECS)
 */

import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs';
import { DailyPrompt } from '../types';

export interface DailyPromptModalProps {
  isOpen: boolean;
  prompt: DailyPrompt;
  onSubmitOption: (optionIndex: number) => void;
  onSubmitText: (text: string) => void;
  onClose: () => void;
  hasAnswered?: boolean;
}

export function DailyPromptModal(props: DailyPromptModalProps): ReactEcs.JSX.Element | null {
  if (!props.isOpen) return null;

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        positionType: 'absolute',
        position: { top: 0, left: 0 }
      }}
    >
      {/* Background Dimmer */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          positionType: 'absolute'
        }}
        uiBackground={{ color: { r: 0.05, g: 0.08, b: 0.15, a: 0.75 } }}
        onMouseDown={props.onClose}
      />

      {/* Modal Card */}
      <UiEntity
        uiTransform={{
          width: 360,
          flexDirection: 'column',
          alignItems: 'center',
          padding: { top: 20, right: 20, bottom: 20, left: 20 }
        }}
        uiBackground={{ color: { r: 0.1, g: 0.15, b: 0.25, a: 0.95 } }}
      >
        {/* Header Badge */}
        <UiEntity
          uiTransform={{
            padding: { top: 4, right: 12, bottom: 4, left: 12 },
            margin: { bottom: 10 }
          }}
          uiBackground={{ color: { r: 0.98, g: 0.45, b: 0.09, a: 0.9 } }}
        >
          <Label
            value={`🔥 DAILY QUESTION • ${props.prompt.category.toUpperCase()}`}
            fontSize={12}
            color={{ r: 1, g: 1, b: 1, a: 1 }}
          />
        </UiEntity>

        {/* Question Text */}
        <Label
          value={props.prompt.questionText}
          fontSize={16}
          textAlign="middle-center"
          uiTransform={{
            width: '100%',
            margin: { bottom: 16 }
          }}
          color={{ r: 0.98, g: 0.98, b: 0.98, a: 1 }}
        />

        {/* Options / Answer Buttons */}
        {props.prompt.options?.map((option, idx) => (
          <Button
            key={`opt_${idx}`}
            value={option}
            variant="primary"
            fontSize={13}
            uiTransform={{
              width: '100%',
              height: 48, // 48px mobile touch hitbox
              margin: { bottom: 8 }
            }}
            uiBackground={{ color: { r: 0.2, g: 0.3, b: 0.5, a: 0.9 } }}
            onMouseDown={() => {
              props.onSubmitOption(idx);
              props.onClose();
            }}
          />
        ))}

        {/* Close Button */}
        <Button
          value="Back to Haven"
          variant="secondary"
          fontSize={12}
          uiTransform={{
            width: '100%',
            height: 44,
            margin: { top: 8 }
          }}
          onMouseDown={props.onClose}
        />
      </UiEntity>
    </UiEntity>
  );
}
