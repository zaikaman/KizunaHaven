/**
 * Kizuna Haven - Floating Bottle Mail Lagoon System (Asynchronous Notes & Physics)
 */

import { BottleMessage, BottleReactionType, BottleRibbonColor, Vector3D } from '../types';
import { PersistenceManager } from '../network/Persistence';
import { StateBroadcaster } from '../network/StateBroadcaster';
import { WORLD_CONFIG } from '../config';

export interface LaunchBottleParams {
  authorId: string;
  authorName: string;
  content: string;
  ribbonColor: BottleRibbonColor;
}

export class BottleLagoonSystem {
  private persistence: PersistenceManager;
  private broadcaster: StateBroadcaster;
  private activeBottles: BottleMessage[] = [];

  constructor(persistence: PersistenceManager, broadcaster: StateBroadcaster) {
    this.persistence = persistence;
    this.broadcaster = broadcaster;
    this.initializeBottles();

    // Listen to network events from other players
    this.broadcaster.on<BottleMessage>('BOTTLE_LAUNCH', (newBottle) => {
      this.handleRemoteBottleLaunch(newBottle);
    });

    this.broadcaster.on<{ bottleId: string; reactionType: BottleReactionType }>('BOTTLE_REACT', (data) => {
      this.handleRemoteReaction(data.bottleId, data.reactionType);
    });
  }

  private initializeBottles(): void {
    const saved = this.persistence.getBottles();
    if (saved && saved.length > 0) {
      this.activeBottles = saved;
    } else {
      // Seed with heartwarming default notes
      this.activeBottles = [
        {
          bottleId: 'seed-bottle-1',
          authorId: 'system-spirit',
          authorName: 'Lumi ✨',
          content: 'Welcome to Kizuna Haven! Take a deep breath and enjoy the stars.',
          createdAt: Date.now() - 3600000,
          reactions: { heart: 5, star: 8, handshake: 3 },
          ribbonColor: 'gold',
          position: { x: 7.5, y: 0.2, z: 23.5 }
        },
        {
          bottleId: 'seed-bottle-2',
          authorId: 'wanderer-kiko',
          authorName: 'Kiko',
          content: 'Remember: whatever you are creating, your voice matters!',
          createdAt: Date.now() - 7200000,
          reactions: { heart: 12, star: 4, handshake: 6 },
          ribbonColor: 'pink',
          position: { x: 9.0, y: 0.2, z: 25.0 }
        }
      ];
      this.persistence.saveBottles(this.activeBottles);
    }
  }

  public getActiveBottles(): BottleMessage[] {
    return [...this.activeBottles];
  }

  public getBottleById(bottleId: string): BottleMessage | undefined {
    return this.activeBottles.find(b => b.bottleId === bottleId);
  }

  public launchBottle(params: LaunchBottleParams): { success: boolean; bottle?: BottleMessage; error?: string } {
    if (!params.content || params.content.trim().length === 0) {
      return { success: false, error: 'Bottle message content cannot be empty.' };
    }

    if (params.content.length > 180) {
      return { success: false, error: 'Bottle message exceeds 180 character limit.' };
    }

    // Generate random lagoon position within 3m radius of LAGOON_CENTER
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.0 + Math.random() * 2.5;
    const position: Vector3D = {
      x: WORLD_CONFIG.LAGOON_CENTER.x + Math.cos(angle) * radius,
      y: 0.2,
      z: WORLD_CONFIG.LAGOON_CENTER.z + Math.sin(angle) * radius
    };

    const newBottle: BottleMessage = {
      bottleId: `btl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      authorId: params.authorId,
      authorName: params.authorName,
      content: params.content.trim(),
      createdAt: Date.now(),
      reactions: { heart: 0, star: 0, handshake: 0 },
      ribbonColor: params.ribbonColor,
      position
    };

    this.activeBottles.unshift(newBottle);

    // Enforce 20 bottle limit by trimming oldest
    if (this.activeBottles.length > WORLD_CONFIG.MAX_LAGOON_BOTTLES) {
      this.activeBottles = this.activeBottles.slice(0, WORLD_CONFIG.MAX_LAGOON_BOTTLES);
    }

    this.persistence.saveBottles(this.activeBottles);
    this.persistence.addXp(params.authorId, 30); // 30 XP for bottle mail
    this.broadcaster.broadcast('BOTTLE_LAUNCH', newBottle);

    return { success: true, bottle: newBottle };
  }

  public reactToBottle(bottleId: string, reaction: BottleReactionType): boolean {
    const bottle = this.activeBottles.find(b => b.bottleId === bottleId);
    if (!bottle) return false;

    if (reaction === 'HEART') bottle.reactions.heart += 1;
    else if (reaction === 'STAR') bottle.reactions.star += 1;
    else if (reaction === 'HANDSHAKE') bottle.reactions.handshake += 1;

    this.persistence.saveBottles(this.activeBottles);
    this.broadcaster.broadcast('BOTTLE_REACT', { bottleId, reactionType: reaction });
    return true;
  }

  public calculateWaterBobbingY(timeSeconds: number, offset: number): number {
    return 0.2 + Math.sin(timeSeconds * 2.0 + offset) * 0.12;
  }

  private handleRemoteBottleLaunch(newBottle: BottleMessage): void {
    if (!this.activeBottles.some(b => b.bottleId === newBottle.bottleId)) {
      this.activeBottles.unshift(newBottle);
      if (this.activeBottles.length > WORLD_CONFIG.MAX_LAGOON_BOTTLES) {
        this.activeBottles = this.activeBottles.slice(0, WORLD_CONFIG.MAX_LAGOON_BOTTLES);
      }
      this.persistence.saveBottles(this.activeBottles);
    }
  }

  private handleRemoteReaction(bottleId: string, reaction: BottleReactionType): void {
    const bottle = this.activeBottles.find(b => b.bottleId === bottleId);
    if (bottle) {
      if (reaction === 'HEART') bottle.reactions.heart += 1;
      else if (reaction === 'STAR') bottle.reactions.star += 1;
      else if (reaction === 'HANDSHAKE') bottle.reactions.handshake += 1;
      this.persistence.saveBottles(this.activeBottles);
    }
  }
}
