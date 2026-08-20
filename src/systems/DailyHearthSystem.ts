/**
 * Kizuna Haven - Daily Question Hearth System (Asynchronous 24h Prompt Engine)
 */

import { DailyPrompt, PromptAnswer } from '../types';
import { PersistenceManager } from '../network/Persistence';
import { DEFAULT_PROMPTS_POOL, WORLD_CONFIG } from '../config';

export class DailyHearthSystem {
  private persistence: PersistenceManager;

  constructor(persistence: PersistenceManager) {
    this.persistence = persistence;
  }

  /**
   * Deterministically calculates the active 24-hour question prompt based on UTC date.
   */
  public getActivePrompt(timestamp = Date.now()): DailyPrompt {
    const epochDay = Math.floor(timestamp / WORLD_CONFIG.DAILY_PROMPT_ROTATION_MS);
    const poolIndex = Math.abs(epochDay) % DEFAULT_PROMPTS_POOL.length;
    const promptItem = DEFAULT_PROMPTS_POOL[poolIndex];

    const dateStr = new Date(timestamp).toISOString().split('T')[0];
    const promptId = `prompt-${dateStr}`;

    const answers = this.persistence.getAnswers(promptId);
    const voteDistribution: Record<string, number> = {};

    for (const ans of answers) {
      if (ans.selectedOptionIndex !== undefined) {
        const key = `opt_${ans.selectedOptionIndex}`;
        voteDistribution[key] = (voteDistribution[key] ?? 0) + 1;
      }
    }

    let options = ['Definitely Yes', 'Maybe / Depends', 'Not really'];
    if (promptItem.category === 'music') {
      options = ['Lo-Fi & Ambient', 'Acoustic & Chill', 'Synthwave & Dream', 'R&B & Soul'];
    } else if (promptItem.category === 'story') {
      options = ['Hilariously Chaotic', 'Super Wholesome', 'Epic Adventure', 'Secret Mystery'];
    } else if (promptItem.category === 'chill') {
      options = ['Warm Tea & Books', 'Stargazing Campfire', 'Late-Night Gaming', 'Peaceful Walk'];
    } else if (promptItem.category === 'hot-take') {
      options = ['Spicy Hot-Take', 'Deep Philosophy', 'Futuristic Vision', 'Pure Chaos'];
    }

    return {
      promptId,
      questionText: promptItem.question,
      category: promptItem.category,
      options,
      voteDistribution,
      activeDate: dateStr
    };
  }

  /**
   * Submits a player's response, validates text constraints, and awards Kizuna XP.
   */
  public submitAnswer(answer: PromptAnswer): { success: boolean; error?: string; xpEarned?: number } {
    if (answer.textAnswer && answer.textAnswer.length > 140) {
      return { success: false, error: 'Text answer exceeds 140 character limit.' };
    }

    if (!answer.textAnswer && answer.selectedOptionIndex === undefined) {
      return { success: false, error: 'Must provide either an option selection or text answer.' };
    }

    this.persistence.saveAnswer(answer);

    // Award 50 Kizuna XP for engaging with the daily icebreaker
    this.persistence.addXp(answer.authorId, 50);

    // Update profile count
    const profile = this.persistence.getProfile(answer.authorId);
    profile.dailyPromptsAnswered += 1;
    this.persistence.saveProfile(profile);

    return { success: true, xpEarned: 50 };
  }

  public getPromptAnswers(promptId?: string): PromptAnswer[] {
    const activeId = promptId ?? this.getActivePrompt().promptId;
    return this.persistence.getAnswers(activeId);
  }
}
