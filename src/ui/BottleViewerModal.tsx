/**
 * Kizuna Haven - Bottle Mail DCL Game Modal (React-ECS)
 */

import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs';
import { BottleMessage, BottleReactionType } from '../types';
import { DCLGameModal, QuestOptionRow, DCL_THEME } from './GameQuestCard';

export interface BottleViewerModalProps {
  isOpen: boolean;
  bottle: BottleMessage | null;
  onReact: (bottleId: string, reaction: BottleReactionType) => void;
  onOpenComposer: () => void;
  onClose: () => void;
}

export function BottleViewerModal(props: BottleViewerModalProps): ReactEcs.JSX.Element {
  if (!props.isOpen || !props.bottle) {
    return <UiEntity uiTransform={{ display: 'none' }} />;
  }

  return (
    <DCLGameModal
      title="LAGOON BOTTLE NOTE"
      subtitle={`Discovered note left by ${props.bottle.authorName}`}
      rewardTitle="EXPLORER REWARD"
      rewardHighlight="+30 XP"
      rewardSubtitle="Cast your own message"
      rewardFooterText="Lagoon Mail Post"
      rewardGradientColor={{ r: 0.05, g: 0.45, b: 0.65, a: 0.95 }}
      onClose={props.onClose}
    >
      {/* Note Content Box */}
      <UiEntity
        uiTransform={{
          width: '100%',
          minHeight: 50,
          padding: { left: 12, right: 12, top: 10, bottom: 10 },
          margin: { bottom: 12 }
        }}
        uiBackground={{ color: { r: 0.1, g: 0.12, b: 0.18, a: 0.95 } }}
      >
        <Label
          value={`"${props.bottle.content}"`}
          fontSize={14}
          color={DCL_THEME.TEXT_WHITE}
          textAlign="middle-left"
        />
      </UiEntity>

      {/* 2 Interactive Reaction Rows */}
      <QuestOptionRow
        iconText="[ HEART ]"
        title={`Send Warm Heart (${props.bottle.reactions.heart})`}
        badgeText="+5 XP"
        badgeColor={DCL_THEME.CORAL_ACTION}
        onMouseDown={() => props.onReact(props.bottle!.bottleId, 'HEART')}
      />

      <QuestOptionRow
        iconText="[ STAR ]"
        title={`Send Star Praise (${props.bottle.reactions.star})`}
        badgeText="+5 XP"
        badgeColor={DCL_THEME.ORANGE_BADGE}
        onMouseDown={() => props.onReact(props.bottle!.bottleId, 'STAR')}
      />

      {/* Cast New Note Button */}
      <Button
        value="Cast Message Bottle into Lagoon (+30 XP)"
        fontSize={12}
        uiTransform={{
          width: '100%',
          height: 38,
          margin: { top: 6, bottom: 4 }
        }}
        uiBackground={{ color: DCL_THEME.ORANGE_BADGE }}
        onMouseDown={props.onOpenComposer}
      />
    </DCLGameModal>
  );
}
