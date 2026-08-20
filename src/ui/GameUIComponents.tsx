/**
 * Kizuna Haven - Stylized Game UI Design System
 * Pure React-ECS implementation of 3D layered game frames, embossed buttons, and RPG status pills.
 */

import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs';

// ==========================================
// 1. Color Palette Tokens for Game UI
// ==========================================
export const GAME_COLORS = {
  GOLD_BORDER: { r: 0.95, g: 0.75, b: 0.25, a: 0.95 },
  GOLD_ACCENT: { r: 1.0, g: 0.85, b: 0.3, a: 1.0 },
  EMBER_ORANGE: { r: 0.98, g: 0.45, b: 0.1, a: 1.0 },
  CYAN_LAGOON: { r: 0.05, g: 0.75, b: 0.9, a: 1.0 },
  EMERALD_GREEN: { r: 0.15, g: 0.75, b: 0.4, a: 1.0 },
  PURPLE_NEBULA: { r: 0.65, g: 0.3, b: 0.95, a: 1.0 },
  
  PANEL_OUTER: { r: 0.04, g: 0.07, b: 0.14, a: 0.98 },
  PANEL_INNER: { r: 0.07, g: 0.12, b: 0.22, a: 0.98 },
  CARD_INSET: { r: 0.04, g: 0.08, b: 0.16, a: 0.95 },
  
  BTN_BLUE_TOP: { r: 0.18, g: 0.38, b: 0.68, a: 1.0 },
  BTN_BLUE_BOTTOM: { r: 0.1, g: 0.22, b: 0.45, a: 1.0 },
  BTN_GOLD_TOP: { r: 0.98, g: 0.72, b: 0.15, a: 1.0 },
  BTN_GOLD_BOTTOM: { r: 0.75, g: 0.48, b: 0.05, a: 1.0 },
  BTN_GREEN_TOP: { r: 0.18, g: 0.72, b: 0.42, a: 1.0 },
  BTN_GREEN_BOTTOM: { r: 0.08, g: 0.48, b: 0.25, a: 1.0 },
  BTN_DARK_TOP: { r: 0.2, g: 0.25, b: 0.35, a: 1.0 },
  BTN_DARK_BOTTOM: { r: 0.12, g: 0.15, b: 0.22, a: 1.0 }
};

// ==========================================
// 2. Layered Game Modal Frame (Gold Rim + Inset Panel)
// ==========================================
export interface GameModalFrameProps {
  title: string;
  categoryTag?: string;
  tagColor?: { r: number; g: number; b: number; a: number };
  width?: number;
  onClose?: () => void;
  children?: any;
}

export function GameModalFrame(props: GameModalFrameProps): ReactEcs.JSX.Element {
  const modalWidth = props.width ?? 420;

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
      uiBackground={{ color: { r: 0.02, g: 0.03, b: 0.06, a: 0.85 } }}
    >
      {/* Outer Golden Bezel Frame */}
      <UiEntity
        uiTransform={{
          width: modalWidth,
          flexDirection: 'column',
          alignItems: 'center',
          padding: { top: 3, right: 3, bottom: 3, left: 3 }
        }}
        uiBackground={{ color: GAME_COLORS.GOLD_BORDER }}
      >
        {/* Main Inner Dark Velvet Panel */}
        <UiEntity
          uiTransform={{
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            padding: { top: 16, right: 20, bottom: 18, left: 20 }
          }}
          uiBackground={{ color: GAME_COLORS.PANEL_INNER }}
        >
          {/* Top Floating Ribbon Banner */}
          <UiEntity
            uiTransform={{
              height: 36,
              padding: { left: 16, right: 16 },
              margin: { bottom: 14 },
              justifyContent: 'center',
              alignItems: 'center'
            }}
            uiBackground={{ color: props.tagColor ?? GAME_COLORS.EMBER_ORANGE }}
          >
            <Label
              value={props.categoryTag ? `${props.categoryTag.toUpperCase()} - ${props.title}` : props.title}
              fontSize={14}
              color={{ r: 1, g: 1, b: 1, a: 1 }}
            />
          </UiEntity>

          {/* Children Content */}
          {props.children}
        </UiEntity>
      </UiEntity>
    </UiEntity>
  );
}

// ==========================================
// 3. Tactile 3D Game Action Button
// ==========================================
export interface GameActionButtonProps {
  key?: string;
  label: string;
  scheme?: 'blue' | 'gold' | 'green' | 'dark';
  height?: number;
  fontSize?: number;
  onMouseDown: () => void;
}

export function GameActionButton(props: GameActionButtonProps): ReactEcs.JSX.Element {
  const scheme = props.scheme ?? 'blue';
  const btnHeight = props.height ?? 48;
  const fontSize = props.fontSize ?? 14;

  let topColor = GAME_COLORS.BTN_BLUE_TOP;
  let bottomLip = GAME_COLORS.BTN_BLUE_BOTTOM;

  if (scheme === 'gold') {
    topColor = GAME_COLORS.BTN_GOLD_TOP;
    bottomLip = GAME_COLORS.BTN_GOLD_BOTTOM;
  } else if (scheme === 'green') {
    topColor = GAME_COLORS.BTN_GREEN_TOP;
    bottomLip = GAME_COLORS.BTN_GREEN_BOTTOM;
  } else if (scheme === 'dark') {
    topColor = GAME_COLORS.BTN_DARK_TOP;
    bottomLip = GAME_COLORS.BTN_DARK_BOTTOM;
  }

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: btnHeight,
        margin: { bottom: 10 },
        padding: { bottom: 4 } // Bottom 3D shadow lip
      }}
      uiBackground={{ color: bottomLip }}
    >
      <Button
        value={props.label}
        fontSize={fontSize}
        uiTransform={{
          width: '100%',
          height: btnHeight - 4
        }}
        uiBackground={{ color: topColor }}
        onMouseDown={props.onMouseDown}
      />
    </UiEntity>
  );
}

// ==========================================
// 4. Stylized Inset Message Card (Parchment/Cyber Inset)
// ==========================================
export interface GameInsetCardProps {
  text: string;
  fontSize?: number;
  height?: number;
}

export function GameInsetCard(props: GameInsetCardProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: props.height ?? 64,
        padding: { left: 16, right: 16, top: 10, bottom: 10 },
        margin: { bottom: 16 },
        justifyContent: 'center',
        alignItems: 'center'
      }}
      uiBackground={{ color: GAME_COLORS.CARD_INSET }}
    >
      <Label
        value={props.text}
        fontSize={props.fontSize ?? 15}
        textAlign="middle-center"
        color={{ r: 0.95, g: 0.98, b: 1.0, a: 1.0 }}
      />
    </UiEntity>
  );
}
