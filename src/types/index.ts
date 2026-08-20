/**
 * Kizuna Haven - Core Data Models & Type Definitions
 */

// ==========================================
// 1. User & Kizuna Progression
// ==========================================

export interface KizunaProfile {
  userId: string;
  displayName: string;
  kizunaLevel: number; // 1 to 10
  kizunaXp: number;
  unlockedProps: string[];
  dailyPromptsAnswered: number;
  coopRoundsCompleted: number;
  lastCheckInDate: string; // YYYY-MM-DD
  streakDays: number;
}

// ==========================================
// 2. Daily Question Hearth (Asynchronous)
// ==========================================

export type PromptCategory = 'music' | 'story' | 'metaverse' | 'chill' | 'hot-take';

export interface DailyPrompt {
  promptId: string;
  questionText: string;
  category: PromptCategory;
  options?: string[];
  voteDistribution?: Record<string, number>;
  activeDate: string; // YYYY-MM-DD
}

export interface PromptAnswer {
  answerId: string;
  promptId: string;
  authorId: string;
  authorName: string;
  textAnswer?: string;
  selectedOptionIndex?: number;
  timestamp: number;
}

// ==========================================
// 3. Bottle Mail Lagoon (Asynchronous)
// ==========================================

export type BottleRibbonColor = 'pink' | 'gold' | 'cyan' | 'purple';
export type BottleReactionType = 'HEART' | 'STAR' | 'HANDSHAKE';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BottleMessage {
  bottleId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  reactions: {
    heart: number;
    star: number;
    handshake: number;
  };
  ribbonColor: BottleRibbonColor;
  position: Vector3D;
}

// ==========================================
// 4. Co-Op Platforming (Tandem Bridge Rush)
// ==========================================

export type CoOpRole = 'OPERATOR' | 'RUNNER';
export type CoOpPhase = 'IDLE' | 'STAGING' | 'RUNNING' | 'CHECKPOINT_SWAP' | 'VICTORY' | 'FAILED';
export type BridgeColor = 'BLUE' | 'ORANGE' | 'PURPLE';

export interface BridgeState {
  bridgeIndex: number; // 0 to 4
  isActive: boolean;
  color: BridgeColor;
  remainingDurationMs: number;
}

export interface CoOpSession {
  sessionId: string;
  operatorId: string;
  runnerId: string;
  phase: CoOpPhase;
  currentCheckpoint: number; // 0 (Start), 1 (Midpoint), 2 (Goal)
  starShardsCollected: number;
  syncMultiplier: number;
  elapsedTimeMs: number;
  maxDurationMs: number;
  bridges: BridgeState[];
}

// ==========================================
// 5. Emote Synchro-Dance Floor
// ==========================================

export interface DanceFloorPerformance {
  activeDancers: string[];
  partyEnergy: number; // 0 to 100
  currentSyncStreak: number;
  activeBeatIndex: number;
  beatIntervalMs: number;
  targetEmoteId: string;
}

// ==========================================
// 6. Autonomous Spirit Guide (Lumi)
// ==========================================

export type LumiMode = 'IDLE_PERCH' | 'FOLLOW_GUIDE' | 'COOP_ASSIST' | 'CELEBRATE';

export interface LumiCompanionState {
  currentMode: LumiMode;
  targetPlayerId: string | null;
  targetPosition: Vector3D;
  assistPlateIndex: number | null;
  animationState: 'FLY_IDLE' | 'FLOAT_FOLLOW' | 'PRESS_SWITCH' | 'SPARKLE_CHEER';
}

// ==========================================
// 7. Multi-Client Network Events
// ==========================================

export type SocialGestureType = 'HIGH_FIVE' | 'HUG' | 'SPARKLER_DUET';

export interface SocialGestureRequestPayload {
  targetUserId: string;
  gestureType: SocialGestureType;
  originPosition: Vector3D;
}

export interface SocialGestureAcceptPayload {
  initiatorUserId: string;
  gestureType: SocialGestureType;
  syncAnimationId: string;
}

export interface CoOpBridgeTriggerPayload {
  sessionId: string;
  bridgeIndex: number;
  color: BridgeColor;
  durationMs: number;
}

export interface CoOpShardCollectedPayload {
  sessionId: string;
  shardIndex: number;
  totalCollected: number;
  currentMultiplier: number;
}

export interface BottleLaunchPayload {
  bottleId: string;
  authorName: string;
  content: string;
  ribbonColor: BottleRibbonColor;
  spawnPosition: Vector3D;
}

export interface BottleReactPayload {
  bottleId: string;
  reactionType: BottleReactionType;
}

export type NetworkEventType =
  | 'SOCIAL_GESTURE_REQUEST'
  | 'SOCIAL_GESTURE_ACCEPT'
  | 'COOP_SESSION_START'
  | 'COOP_BRIDGE_TRIGGER'
  | 'COOP_SHARD_COLLECTED'
  | 'COOP_CHECKPOINT_REACHED'
  | 'BOTTLE_LAUNCH'
  | 'BOTTLE_REACT'
  | 'DANCE_BEAT_SYNC';

export interface NetworkMessage<T = unknown> {
  type: NetworkEventType;
  senderId: string;
  timestamp: number;
  payload: T;
}
