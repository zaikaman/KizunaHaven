/**
 * Kizuna Haven - World Configuration Constants & Design Tokens
 */

export const WORLD_CONFIG = {
  // World Coordinates & Boundaries (2x2 parcels = 32m x 32m)
  SCENE_SIZE_METERS: 32,
  
  // Landmark Centers
  CAMPFIRE_CENTER: { x: 16.0, y: 0.0, z: 16.0 },
  LAGOON_CENTER: { x: 8.0, y: 0.0, z: 24.0 },
  COOP_PUZZLE_CENTER: { x: 24.0, y: 2.0, z: 24.0 },
  DANCE_FLOOR_CENTER: { x: 24.0, y: 0.2, z: 8.0 },
  WISHING_TREE_POS: { x: 8.0, y: 0.0, z: 8.0 },

  // Asynchronous Limits
  MAX_LAGOON_BOTTLES: 20,
  DAILY_PROMPT_ROTATION_MS: 86_400_000, // 24 hours

  // Co-Op Challenge Configuration
  COOP_SESSION_DURATION_MS: 120_000,    // 2 minutes
  COOP_BRIDGE_ACTIVE_MS: 4_000,         // 4 seconds per bridge activation
  MAX_STAR_SHARDS: 15,
  MAX_COMBO_MULTIPLIER: 4.0,

  // Mobile UX Standards
  MIN_TAP_TARGET_PX: 48,
  SAFE_AREA_INSET_PX: 16
} as const;

export const COLOR_PALETTE = {
  // Theme Tokens
  BG_DARK: '#0F172A',         // Slate 900
  BG_CARD: '#1E293B',         // Slate 800
  ACCENT_EMBER: '#F97316',    // Warm Campfire Orange
  ACCENT_GOLD: '#FACC15',     // Celestial Star Yellow
  ACCENT_CYAN: '#06B6D4',     // Lagoon Glow Cyan
  ACCENT_PURPLE: '#A855F7',   // Nebula Purple
  ACCENT_ROSE: '#FB7185',     // Sakura Blossom Pink
  TEXT_LIGHT: '#F8FAFC',      // Crisp White
  TEXT_MUTED: '#94A3B8'       // Soft Slate
} as const;

export interface KizunaTier {
  level: number;
  title: string;
  requiredXp: number;
  unlockedProp: string;
  icon: string;
}

export const KIZUNA_TIERS: readonly KizunaTier[] = [
  { level: 1, title: 'Wanderer', requiredXp: 0, unlockedProp: 'none', icon: '🌱' },
  { level: 2, title: 'Campfire Friend', requiredXp: 100, unlockedProp: 'sparkler', icon: '✨' },
  { level: 3, title: 'Lagoon Fisher', requiredXp: 250, unlockedProp: 'paper_lantern', icon: '🏮' },
  { level: 4, title: 'Harmonizer', requiredXp: 450, unlockedProp: 'lofi_boombox', icon: '📻' },
  { level: 5, title: 'Tandem Master', requiredXp: 700, unlockedProp: 'stardust_trail', icon: '🌠' },
  { level: 6, title: 'Haven Keeper', requiredXp: 1000, unlockedProp: 'mini_campfire', icon: '🔥' },
  { level: 7, title: 'Celestial Duo', requiredXp: 1400, unlockedProp: 'cosmic_wings', icon: '🪽' },
  { level: 8, title: 'Star Guardian', requiredXp: 1900, unlockedProp: 'aura_crown', icon: '👑' },
  { level: 9, title: 'Kizuna Elder', requiredXp: 2500, unlockedProp: 'spirit_whistle', icon: '🦊' },
  { level: 10, title: 'Eternal Bond', requiredXp: 3200, unlockedProp: 'supernova_fireworks', icon: '🎆' }
] as const;

export const DEFAULT_PROMPTS_POOL: readonly { question: string; category: 'music' | 'story' | 'metaverse' | 'chill' | 'hot-take' }[] = [
  { question: "What is a late-night song that feels like a warm hug?", category: 'music' },
  { question: "What's the funniest or most chaotic thing that happened to you in a virtual world?", category: 'story' },
  { question: "If you could manifest any superpower right now for 1 hour, what would it be?", category: 'chill' },
  { question: "What is your biggest metaverse hot take that most people disagree with?", category: 'hot-take' },
  { question: "Describe your current mood using only three emojis.", category: 'chill' },
  { question: "What is a hobby you secretly want to try but haven't started yet?", category: 'story' },
  { question: "Which track would you play if you were DJing the closing party of the universe?", category: 'music' }
] as const;
