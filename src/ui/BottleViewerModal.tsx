/**
 * Kizuna Haven - Bottle Mail Viewer & Sender Modal (React-ECS)
 */

import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs';
import { BottleMessage, BottleReactionType } from '../types';

export interface BottleViewerModalProps {
  isOpen: boolean;
  bottle: BottleMessage | null;
  onReact: (bottleId: string, reaction: BottleReactionType) => void;
  onOpenComposer: () => void;
  onClose: () => void;
}

export function BottleViewerModal(props: BottleViewerModalProps): ReactEcs.JSX.Element | null {
  if (!props.isOpen || !props.bottle) return null;

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
        uiBackground={{ color: { r: 0.08, g: 0.18, b: 0.28, a: 0.95 } }}
      >
        {/* Ribbon Header */}
        <UiEntity
          uiTransform={{
            padding: { top: 4, right: 12, bottom: 4, left: 12 },
            margin: { bottom: 12 }
          }}
          uiBackground={{ color: { r: 0.02, g: 0.71, b: 0.83, a: 0.9 } }}
        >
          <Label
            value={`🌊 MESSAGE FROM ${props.bottle.authorName.toUpperCase()}`}
            fontSize={12}
            color={{ r: 1, g: 1, b: 1, a: 1 }}
          />
        </UiEntity>

        {/* Note Body */}
        <UiEntity
          uiTransform={{
            width: '100%',
            padding: { top: 12, right: 12, bottom: 12, left: 12 },
            margin: { bottom: 16 }
          }}
          uiBackground={{ color: { r: 0.05, g: 0.12, b: 0.2, a: 0.8 } }}
        >
          <Label
            value={`"${props.bottle.content}"`}
            fontSize={15}
            textAlign="middle-center"
            color={{ r: 0.95, g: 0.98, b: 1.0, a: 1 }}
          />
        </UiEntity>

        {/* 3 Large Reaction Buttons in Thumb Zone */}
        <UiEntity
          uiTransform={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            margin: { bottom: 12 }
          }}
        >
          <Button
            value={`❤️ ${props.bottle.reactions.heart}`}
            uiTransform={{ width: '31%', height: 48 }}
            uiBackground={{ color: { r: 0.85, g: 0.2, b: 0.4, a: 0.8 } }}
            fontSize={14}
            onMouseDown={() => props.onReact(props.bottle!.bottleId, 'HEART')}
          />
          <Button
            value={`⭐ ${props.bottle.reactions.star}`}
            uiTransform={{ width: '31%', height: 48 }}
            uiBackground={{ color: { r: 0.9, g: 0.7, b: 0.1, a: 0.8 } }}
            fontSize={14}
            onMouseDown={() => props.onReact(props.bottle!.bottleId, 'STAR')}
          />
          <Button
            value={`🤝 ${props.bottle.reactions.handshake}`}
            uiTransform={{ width: '31%', height: 48 }}
            uiBackground={{ color: { r: 0.2, g: 0.6, b: 0.8, a: 0.8 } }}
            fontSize={14}
            onMouseDown={() => props.onReact(props.bottle!.bottleId, 'HANDSHAKE')}
          />
        </UiEntity>

        {/* Cast Your Own Bottle Button */}
        <Button
          value="✍️ Cast a Message into Lagoon (+30 XP)"
          variant="primary"
          fontSize={12}
          uiTransform={{
            width: '100%',
            height: 46,
            margin: { bottom: 8 }
          }}
          uiBackground={{ color: { r: 0.98, g: 0.45, b: 0.09, a: 0.9 } }}
          onMouseDown={() => {
            props.onOpenComposer();
          }}
        />

        {/* Close Button */}
        <Button
          value="Return to Shore"
          variant="secondary"
          fontSize={12}
          uiTransform={{ width: '100%', height: 42 }}
          onMouseDown={props.onClose}
        />
      </UiEntity>
    </UiEntity>
  );
}
