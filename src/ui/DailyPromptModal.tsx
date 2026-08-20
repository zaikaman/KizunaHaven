/**
 * Kizuna Haven - Daily Prompt DCL Quest Card (React-ECS)
 */

import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs';
import { DailyPrompt } from '../types';
import { DCLGameModal, QuestOptionRow, DCL_THEME } from './GameQuestCard';

export interface DailyPromptModalProps {
  isOpen: boolean;
  prompt: DailyPrompt;
  onSubmitOption: (optionIndex: number) => void;
  onSubmitText: (text: string) => void;
  onClose: () => void;
  hasAnswered?: boolean;
}

export function DailyPromptModal(props: DailyPromptModalProps): ReactEcs.JSX.Element {
  if (!props.isOpen) {
    return <UiEntity uiTransform={{ display: 'none' }} />;
  }

  return (
    <DCLGameModal
      title={`DAILY HEARTH QUEST: ${props.prompt.category}`}
      subtitle={`"${props.prompt.questionText}"`}
      rewardTitle="TODAY'S REWARD"
      rewardHighlight="+50 XP"
      rewardSubtitle="Kizuna Bond Progression"
      rewardFooterText="Daily Reset: 00:00 UTC"
      rewardGradientColor={DCL_THEME.REWARD_PURPLE_BG}
      onClose={props.onClose}
    >
      {/* Interactive Quest Choice Rows */}
      <UiEntity
        uiTransform={{
          width: '100%',
          flexDirection: 'column'
        }}
      >
        {props.prompt.options?.map((option, idx) => (
          <QuestOptionRow
            key={`opt_${idx}`}
            iconText={`[ ${idx + 1} ]`}
            title={option}
            badgeText="SELECT"
            badgeColor={DCL_THEME.CORAL_ACTION}
            onMouseDown={() => {
              props.onSubmitOption(idx);
            }}
          />
        ))}
      </UiEntity>
    </DCLGameModal>
  );
}
