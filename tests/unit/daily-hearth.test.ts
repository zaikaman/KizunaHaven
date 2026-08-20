import { describe, it, expect } from 'vitest';
import { DailyHearthSystem } from '../../src/systems/DailyHearthSystem';
import { PersistenceManager, InMemoryStorageDriver } from '../../src/network/Persistence';

describe('DailyHearthSystem (Asynchronous Daily Prompt)', () => {
  it('deterministically calculates the same prompt for all users on the same calendar day', () => {
    const memoryA = new InMemoryStorageDriver();
    const memoryB = new InMemoryStorageDriver();
    const persistenceA = new PersistenceManager(memoryA);
    const persistenceB = new PersistenceManager(memoryB);

    const hearthA = new DailyHearthSystem(persistenceA);
    const hearthB = new DailyHearthSystem(persistenceB);

    const fixedDate = new Date('2026-08-20T12:00:00Z').getTime();
    const promptA = hearthA.getActivePrompt(fixedDate);
    const promptB = hearthB.getActivePrompt(fixedDate);

    expect(promptA.promptId).toBe(promptB.promptId);
    expect(promptA.questionText).toBe(promptB.questionText);
    expect(promptA.category).toBe(promptB.category);
  });

  it('rotates to a different question when the day changes', () => {
    const memory = new InMemoryStorageDriver();
    const persistence = new PersistenceManager(memory);
    const hearth = new DailyHearthSystem(persistence);

    const day1 = new Date('2026-08-20T12:00:00Z').getTime();
    const day2 = new Date('2026-08-21T12:00:00Z').getTime();

    const promptDay1 = hearth.getActivePrompt(day1);
    const promptDay2 = hearth.getActivePrompt(day2);

    expect(promptDay1.promptId).not.toBe(promptDay2.promptId);
  });

  it('allows answering and tallies multiple-choice votes or text responses correctly', () => {
    const memory = new InMemoryStorageDriver();
    const persistence = new PersistenceManager(memory);
    const hearth = new DailyHearthSystem(persistence);

    const activePrompt = hearth.getActivePrompt();

    // User 1 votes option 0
    const ans1 = hearth.submitAnswer({
      answerId: 'ans-1',
      promptId: activePrompt.promptId,
      authorId: 'user-1',
      authorName: 'Aria',
      selectedOptionIndex: 0,
      timestamp: Date.now()
    });
    expect(ans1.success).toBe(true);

    // User 2 writes text response
    const ans2 = hearth.submitAnswer({
      answerId: 'ans-2',
      promptId: activePrompt.promptId,
      authorId: 'user-2',
      authorName: 'Kiko',
      textAnswer: 'Midnight City by M83',
      timestamp: Date.now()
    });
    expect(ans2.success).toBe(true);

    const answers = persistence.getAnswers(activePrompt.promptId);
    expect(answers.length).toBe(2);
    expect(answers.find(a => a.authorId === 'user-2')?.textAnswer).toBe('Midnight City by M83');
  });

  it('rejects text answers exceeding 140 character limit', () => {
    const memory = new InMemoryStorageDriver();
    const persistence = new PersistenceManager(memory);
    const hearth = new DailyHearthSystem(persistence);

    const activePrompt = hearth.getActivePrompt();
    const longText = 'A'.repeat(141);

    const result = hearth.submitAnswer({
      answerId: 'ans-long',
      promptId: activePrompt.promptId,
      authorId: 'user-3',
      authorName: 'Spammer',
      textAnswer: longText,
      timestamp: Date.now()
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('140');
  });
});
