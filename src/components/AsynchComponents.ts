/**
 * Kizuna Haven - Asynchronous ECS Components
 */

import { BottleMessage, DailyPrompt } from '../types';

export interface BottleItemComponent {
  bottle: BottleMessage;
  bobbingOffset: number;
  bobbingSpeed: number;
  isHovered: boolean;
}

export interface DailyHearthComponent {
  prompt: DailyPrompt;
  flameIntensity: number; // 0.0 to 1.0
  particleRate: number;
  isPlayerNearby: boolean;
}
