/**
 * Kizuna Haven - Local & Session Storage Persistence Adapter
 */

import { KizunaProfile, PromptAnswer, BottleMessage } from '../types';
import { KIZUNA_TIERS } from '../config';

export interface StorageDriver {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class InMemoryStorageDriver implements StorageDriver {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }
}

export class PersistenceManager {
  private driver: StorageDriver;
  private readonly PROFILE_KEY = 'kizuna_profile';
  private readonly ANSWERS_KEY = 'kizuna_answers';
  private readonly BOTTLES_KEY = 'kizuna_bottles';

  constructor(driver?: StorageDriver) {
    if (driver) {
      this.driver = driver;
    } else if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      this.driver = globalThis.localStorage as StorageDriver;
    } else {
      this.driver = new InMemoryStorageDriver();
    }
  }

  // ==========================================
  // Profile & Progression
  // ==========================================

  public getProfile(userId: string, defaultName = 'Explorer'): KizunaProfile {
    const raw = this.driver.getItem(`${this.PROFILE_KEY}_${userId}`);
    if (raw) {
      try {
        return JSON.parse(raw) as KizunaProfile;
      } catch {
        // Fallback to default on parse error
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const initialProfile: KizunaProfile = {
      userId,
      displayName: defaultName,
      kizunaLevel: 1,
      kizunaXp: 0,
      unlockedProps: [],
      dailyPromptsAnswered: 0,
      coopRoundsCompleted: 0,
      lastCheckInDate: today,
      streakDays: 1
    };

    this.saveProfile(initialProfile);
    return initialProfile;
  }

  public saveProfile(profile: KizunaProfile): void {
    this.driver.setItem(`${this.PROFILE_KEY}_${profile.userId}`, JSON.stringify(profile));
  }

  public addXp(userId: string, xpAmount: number): { profile: KizunaProfile; leveledUp: boolean; unlockedProps: string[] } {
    const profile = this.getProfile(userId);
    profile.kizunaXp += xpAmount;

    let leveledUp = false;
    const newlyUnlocked: string[] = [];

    // Calculate level progression against KIZUNA_TIERS
    for (const tier of KIZUNA_TIERS) {
      if (profile.kizunaXp >= tier.requiredXp && tier.level > profile.kizunaLevel) {
        profile.kizunaLevel = tier.level;
        leveledUp = true;
        if (tier.unlockedProp !== 'none' && !profile.unlockedProps.includes(tier.unlockedProp)) {
          profile.unlockedProps.push(tier.unlockedProp);
          newlyUnlocked.push(tier.unlockedProp);
        }
      }
    }

    this.saveProfile(profile);
    return { profile, leveledUp, unlockedProps: newlyUnlocked };
  }

  public recordDailyCheckIn(userId: string): { streak: number; isFirstCheckInToday: boolean } {
    const profile = this.getProfile(userId);
    const today = new Date().toISOString().split('T')[0];

    if (profile.lastCheckInDate === today) {
      return { streak: profile.streakDays, isFirstCheckInToday: false };
    }

    const lastDate = new Date(profile.lastCheckInDate);
    const currentDate = new Date(today);
    const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive streak continuation
      profile.streakDays += 1;
    } else {
      // Streak broken or new user
      profile.streakDays = 1;
    }

    profile.lastCheckInDate = today;
    this.saveProfile(profile);
    return { streak: profile.streakDays, isFirstCheckInToday: true };
  }

  // ==========================================
  // Daily Prompt Answers
  // ==========================================

  public saveAnswer(answer: PromptAnswer): void {
    const list = this.getAnswers();
    // Replace existing if already submitted for same prompt by same user
    const filtered = list.filter(a => !(a.promptId === answer.promptId && a.authorId === answer.authorId));
    filtered.push(answer);
    this.driver.setItem(this.ANSWERS_KEY, JSON.stringify(filtered));
  }

  public getAnswers(promptId?: string): PromptAnswer[] {
    const raw = this.driver.getItem(this.ANSWERS_KEY);
    if (!raw) return [];
    try {
      const all = JSON.parse(raw) as PromptAnswer[];
      return promptId ? all.filter(a => a.promptId === promptId) : all;
    } catch {
      return [];
    }
  }

  // ==========================================
  // Bottle Messages Cache
  // ==========================================

  public saveBottles(bottles: BottleMessage[]): void {
    this.driver.setItem(this.BOTTLES_KEY, JSON.stringify(bottles));
  }

  public getBottles(): BottleMessage[] {
    const raw = this.driver.getItem(this.BOTTLES_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as BottleMessage[];
    } catch {
      return [];
    }
  }
}
