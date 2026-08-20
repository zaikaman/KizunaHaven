/**
 * Kizuna Haven - Authentic Decentraland Game Quest Card System
 * Styled to match official DCL Genesis Plaza quest & reward modals.
 */

import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs';

export const DCL_THEME = {
  CARD_BG: { r: 0.07, g: 0.08, b: 0.12, a: 0.96 },
  CARD_BORDER: { r: 0.18, g: 0.2, b: 0.28, a: 1.0 },
  ROW_BG: { r: 0.14, g: 0.16, b: 0.22, a: 0.95 },
  ROW_BG_HOVER: { r: 0.2, g: 0.24, b: 0.32, a: 1.0 },
  REWARD_PURPLE_BG: { r: 0.45, g: 0.15, b: 0.75, a: 0.95 },
  ORANGE_BADGE: { r: 0.98, g: 0.48, b: 0.12, a: 1.0 },
  CORAL_ACTION: { r: 0.95, g: 0.25, b: 0.42, a: 1.0 },
  CYAN_ACTION: { r: 0.06, g: 0.72, b: 0.88, a: 1.0 },
  TEXT_WHITE: { r: 0.98, g: 0.98, b: 1.0, a: 1.0 },
  TEXT_MUTED: { r: 0.65, g: 0.7, b: 0.8, a: 1.0 },
  TEXT_GOLD: { r: 1.0, g: 0.82, b: 0.25, a: 1.0 }
};

export interface QuestOptionRowProps {
  key?: string;
  iconText: string;
  title: string;
  badgeText?: string;
  badgeColor?: { r: number; g: number; b: number; a: number };
  onMouseDown: () => void;
}

export function QuestOptionRow(props: QuestOptionRowProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 42,
        margin: { bottom: 8 },
        padding: { left: 10, right: 8 },
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      uiBackground={{ color: DCL_THEME.ROW_BG }}
    >
      {/* Left Title with Icon */}
      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Label
          value={`${props.iconText}  ${props.title}`}
          fontSize={13}
          color={DCL_THEME.TEXT_WHITE}
        />
      </UiEntity>

      {/* Right Action Button */}
      <Button
        value={props.badgeText ?? '->'}
        fontSize={12}
        uiTransform={{
          width: props.badgeText ? 80 : 36,
          height: 30
        }}
        uiBackground={{ color: props.badgeColor ?? DCL_THEME.CORAL_ACTION }}
        onMouseDown={props.onMouseDown}
      />
    </UiEntity>
  );
}

export interface DCLGameModalProps {
  title: string;
  subtitle: string;
  rewardTitle: string;
  rewardSubtitle: string;
  rewardHighlight: string;
  rewardFooterText: string;
  rewardGradientColor?: { r: number; g: number; b: number; a: number };
  onClose: () => void;
  children?: any;
}

export function DCLGameModal(props: DCLGameModalProps): ReactEcs.JSX.Element {
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
      uiBackground={{ color: { r: 0.02, g: 0.02, b: 0.05, a: 0.75 } }}
    >
      {/* 2-Column DCL Quest Card (720px width) */}
      <UiEntity
        uiTransform={{
          width: 720,
          minHeight: 280,
          flexDirection: 'row',
          padding: { top: 16, right: 16, bottom: 16, left: 20 }
        }}
        uiBackground={{ color: DCL_THEME.CARD_BG }}
      >
        {/* Left Column (60%): Title + Quest Prompt + Interactive Rows */}
        <UiEntity
          uiTransform={{
            width: '62%',
            flexDirection: 'column',
            padding: { right: 16 }
          }}
        >
          {/* Main Title */}
          <Label
            value={props.title.toUpperCase()}
            fontSize={18}
            color={DCL_THEME.TEXT_WHITE}
            uiTransform={{ margin: { bottom: 4 } }}
          />

          {/* Subtitle / Question Description */}
          <Label
            value={props.subtitle}
            fontSize={12}
            color={DCL_THEME.TEXT_MUTED}
            uiTransform={{ margin: { bottom: 14 } }}
          />

          {/* Action List / Children */}
          {props.children}

          {/* Close Action Link */}
          <Button
            value="Close Window"
            fontSize={11}
            uiTransform={{
              width: 110,
              height: 26,
              margin: { top: 6 }
            }}
            uiBackground={{ color: { r: 0.2, g: 0.22, b: 0.3, a: 0.8 } }}
            onMouseDown={props.onClose}
          />
        </UiEntity>

        {/* Right Column (38%): Reward Showcase Banner */}
        <UiEntity
          uiTransform={{
            width: '38%',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: { top: 12, right: 14, bottom: 12, left: 14 }
          }}
          uiBackground={{ color: props.rewardGradientColor ?? DCL_THEME.REWARD_PURPLE_BG }}
        >
          {/* Reward Top Badge */}
          <UiEntity
            uiTransform={{
              height: 24,
              padding: { left: 10, right: 10 },
              justifyContent: 'center',
              alignItems: 'center'
            }}
            uiBackground={{ color: DCL_THEME.ORANGE_BADGE }}
          >
            <Label
              value={props.rewardTitle.toUpperCase()}
              fontSize={10}
              color={DCL_THEME.TEXT_WHITE}
            />
          </UiEntity>

          {/* Center Showcase Graphic & Reward XP */}
          <UiEntity
            uiTransform={{
              flexDirection: 'column',
              alignItems: 'center',
              margin: { top: 12, bottom: 12 }
            }}
          >
            <Label
              value={props.rewardHighlight}
              fontSize={24}
              color={DCL_THEME.TEXT_GOLD}
              textAlign="middle-center"
            />
            <Label
              value={props.rewardSubtitle}
              fontSize={12}
              color={DCL_THEME.TEXT_WHITE}
              textAlign="middle-center"
              uiTransform={{ margin: { top: 4 } }}
            />
          </UiEntity>

          {/* Bottom Countdown / Status Pill */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 28,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            uiBackground={{ color: { r: 0.05, g: 0.05, b: 0.1, a: 0.7 } }}
          >
            <Label
              value={props.rewardFooterText}
              fontSize={11}
              color={DCL_THEME.TEXT_WHITE}
            />
          </UiEntity>
        </UiEntity>
      </UiEntity>
    </UiEntity>
  );
}
