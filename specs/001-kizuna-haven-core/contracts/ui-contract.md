# UI Interface Contracts: Kizuna Haven React-ECS Components

**Feature**: `specs/001-kizuna-haven-core`  
**Date**: 2026-08-20  
**Status**: Completed

---

## 1. Declarative UI Component Tree

```
<ScreenInsetArea>
  ├── <MobileTopHUD />
  │     ├── <TierBadge level={number} title={string} />
  │     ├── <DailyPromptBanner question={string} onOpenModal={fn} />
  │     └── <PolaroidCameraTrigger onCapture={fn} />
  │
  ├── <RadialSocialMenu isOpen={boolean} onSelectAction={fn} />
  │     ├── <HighFiveButton />
  │     ├── <HugButton />
  │     ├── <EmoteWheel />
  │     └── <SparklerToggle />
  │
  ├── <CoOpPuzzleHUD active={boolean} session={CoOpSession} />
  │     ├── <PartnerStatusPortrait name={string} isVoiceActive={boolean} />
  │     ├── <SyncComboBar multiplier={number} />
  │     ├── <GlyphControlPad onTriggerBridge={fn} /> <!-- Visible only to Operator -->
  │     └── <JumpActionPad onAction={fn} />         <!-- Visible only to Runner -->
  │
  ├── <DailyPromptModal isOpen={boolean} prompt={DailyPrompt} onSubmitAnswer={fn} onClose={fn} />
  ├── <BottleViewerModal isOpen={boolean} bottle={BottleMessage} onReact={fn} onClose={fn} />
  └── <PolaroidShareModal isOpen={boolean} photoUrl={string} warpUrl={string} onClose={fn} />
</ScreenInsetArea>
```

---

## 2. Component Props & Callback Contracts

### 2.1 `RadialSocialMenu`
```typescript
export interface RadialSocialMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectAction: (actionType: 'HIGH_FIVE' | 'HUG' | 'SPARKLER' | 'BOOMBOX' | 'EMOTE') => void;
  isNearPlayer: boolean;
  targetPlayerName?: string;
}
```

### 2.2 `CoOpPuzzleHUD`
```typescript
export interface CoOpPuzzleHUDProps {
  active: boolean;
  role: 'OPERATOR' | 'RUNNER';
  remainingTimeSeconds: number;
  starShardsCollected: number;
  totalStarShards: number;
  syncMultiplier: number;
  partnerName: string;
  onTriggerGlyph: (glyphColor: 'BLUE' | 'ORANGE' | 'PURPLE') => void;
}
```

### 2.3 `PolaroidShareModal`
```typescript
export interface PolaroidShareModalProps {
  isOpen: boolean;
  photoDate: string;
  avatarNames: string[];
  worldCoords: { x: number; y: number };
  warpDeepLink: string;
  onCopyLink: () => void;
  onClose: () => void;
}
```
