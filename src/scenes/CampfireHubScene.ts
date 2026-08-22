/**
 * Kizuna Haven - 3D Campfire Hub & Lagoon Scene Assembly
 * Pure SDK 7 ECS Scene with fallback procedural primitives and GLB container hooks
 */

import {
  engine,
  Entity,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  GltfContainer,
  pointerEventsSystem,
  InputAction
} from '@dcl/sdk/ecs';
import { Color4, Vector3, Quaternion } from '@dcl/sdk/math';
import { WORLD_CONFIG } from '../config';
import { BottleLagoonSystem } from '../systems/BottleLagoonSystem';
import { LumiCompanionSystem } from '../systems/LumiCompanionSystem';
import { BottleMessage } from '../types';

export interface CampfireSceneCallbacks {
  onOpenDailyPrompt: () => void;
  onOpenBottle: (bottle: BottleMessage) => void;
  onLumiInteract: () => void;
}

export class CampfireHubScene {
  private lagoonSystem: BottleLagoonSystem;
  private lumiSystem: LumiCompanionSystem;
  private callbacks: CampfireSceneCallbacks;

  // Scene entities
  private campfireEntity!: Entity;
  private fireGlowEntity!: Entity;
  private lumiEntity!: Entity;
  private bottleEntities: { entity: Entity; bottleId: string; offset: number }[] = [];

  constructor(
    lagoonSystem: BottleLagoonSystem,
    lumiSystem: LumiCompanionSystem,
    callbacks: CampfireSceneCallbacks
  ) {
    this.lagoonSystem = lagoonSystem;
    this.lumiSystem = lumiSystem;
    this.callbacks = callbacks;

    this.buildGround();
    this.buildCampfireHearth();
    this.buildLogBenches();
    this.buildLagoon();
    this.buildWishingTree();
    this.buildLumiCompanion();
    this.spawnLagoonBottles();

    // Register frame loop for water bobbing & campfire glow animation
    let elapsedSeconds = 0;
    engine.addSystem((dt: number) => {
      elapsedSeconds += dt;
      this.updateAnimations(elapsedSeconds, dt);
    });
  }

  private buildGround(): void {
    const ground = engine.addEntity();
    Transform.create(ground, {
      position: Vector3.create(16, 0.05, 16),
      scale: Vector3.create(32, 0.1, 32)
    });
    MeshRenderer.setBox(ground);
    MeshCollider.setBox(ground);
    Material.setPbrMaterial(ground, {
      albedoColor: Color4.create(0.12, 0.22, 0.18, 1.0), // Deep Forest Green
      metallic: 0.1,
      roughness: 0.85
    });
  }

  private buildCampfireHearth(): void {
    const { x, y, z } = WORLD_CONFIG.CAMPFIRE_CENTER;

    // Stone Ring Hearth
    this.campfireEntity = engine.addEntity();
    Transform.create(this.campfireEntity, {
      position: Vector3.create(x, y + 0.15, z),
      scale: Vector3.create(2.2, 0.3, 2.2)
    });
    MeshRenderer.setCylinder(this.campfireEntity);
    MeshCollider.setCylinder(this.campfireEntity);
    Material.setPbrMaterial(this.campfireEntity, {
      albedoColor: Color4.create(0.25, 0.25, 0.28, 1.0), // Slate cobblestone
      roughness: 0.9
    });

    // Flickering Fire Mesh
    this.fireGlowEntity = engine.addEntity();
    Transform.create(this.fireGlowEntity, {
      position: Vector3.create(x, y + 0.6, z),
      scale: Vector3.create(0.9, 1.0, 0.9)
    });
    MeshRenderer.setCylinder(this.fireGlowEntity);
    Material.setPbrMaterial(this.fireGlowEntity, {
      albedoColor: Color4.create(1.0, 0.5, 0.1, 0.9),
      emissiveColor: Color4.create(1.0, 0.45, 0.05, 1.0),
      emissiveIntensity: 3.5
    });

    // Tap Campfire -> Open Daily Prompt
    pointerEventsSystem.onPointerDown(
      {
        entity: this.campfireEntity,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Gather at Campfire (Daily Prompt)'
        }
      },
      () => {
        this.callbacks.onOpenDailyPrompt();
      }
    );
  }

  private buildLogBenches(): void {
    const { x, y, z } = WORLD_CONFIG.CAMPFIRE_CENTER;
    const benchAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    benchAngles.forEach((angle) => {
      const bench = engine.addEntity();
      const radius = 2.8;
      const bx = x + Math.cos(angle) * radius;
      const bz = z + Math.sin(angle) * radius;

      Transform.create(bench, {
        position: Vector3.create(bx, y + 0.3, bz),
        rotation: Quaternion.fromEulerDegrees(0, (-angle * 180) / Math.PI + 90, 0),
        scale: Vector3.create(1.8, 0.4, 0.6)
      });
      MeshRenderer.setBox(bench);
      MeshCollider.setBox(bench);
      Material.setPbrMaterial(bench, {
        albedoColor: Color4.create(0.35, 0.22, 0.14, 1.0), // Cedar Wood
        roughness: 0.8
      });
    });
  }

  private buildLagoon(): void {
    const { x, y, z } = WORLD_CONFIG.LAGOON_CENTER;

    const lagoonWater = engine.addEntity();
    Transform.create(lagoonWater, {
      position: Vector3.create(x, y + 0.1, z),
      scale: Vector3.create(8.0, 0.1, 8.0)
    });
    MeshRenderer.setCylinder(lagoonWater);
    MeshCollider.setCylinder(lagoonWater);
    Material.setPbrMaterial(lagoonWater, {
      albedoColor: Color4.create(0.04, 0.55, 0.68, 0.85), // Turquoise Lagoon
      emissiveColor: Color4.create(0.02, 0.4, 0.5, 1.0),
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metallic: 0.2
    });
  }

  private buildWishingTree(): void {
    const { x, y, z } = WORLD_CONFIG.WISHING_TREE_POS;

    // Tree Trunk
    const trunk = engine.addEntity();
    Transform.create(trunk, {
      position: Vector3.create(x, y + 2.0, z),
      scale: Vector3.create(1.2, 4.0, 1.2)
    });
    MeshRenderer.setCylinder(trunk);
    MeshCollider.setCylinder(trunk);
    Material.setPbrMaterial(trunk, {
      albedoColor: Color4.create(0.3, 0.18, 0.12, 1.0),
      roughness: 0.95
    });

    // Glowing Sakura / Starlight Canopy
    const canopy = engine.addEntity();
    Transform.create(canopy, {
      position: Vector3.create(x, y + 5.0, z),
      scale: Vector3.create(5.0, 3.2, 5.0)
    });
    MeshRenderer.setSphere(canopy);
    Material.setPbrMaterial(canopy, {
      albedoColor: Color4.create(0.98, 0.55, 0.75, 0.9), // Sakura Blossom
      emissiveColor: Color4.create(0.85, 0.35, 0.65, 1.0),
      emissiveIntensity: 1.8
    });
  }

  private buildLumiCompanion(): void {
    this.lumiEntity = engine.addEntity();
    const initial = this.lumiSystem.getState().targetPosition;

    Transform.create(this.lumiEntity, {
      position: Vector3.create(initial.x, initial.y, initial.z),
      scale: Vector3.create(0.5, 0.5, 0.5)
    });

    // Procedural kitsune body (models/lumi.glb, generated by tools/generate-lumi.ts)
    // Model origin is at the paws; offset so her body centers on the hover point
    const lumiBody = engine.addEntity();
    Transform.create(lumiBody, {
      parent: this.lumiEntity,
      position: Vector3.create(0, -0.85, 0)
    });
    GltfContainer.create(lumiBody, { src: 'models/lumi.glb' });

    // Soft starlight aura shell; doubles as the pointer interaction proxy
    MeshRenderer.setSphere(this.lumiEntity);
    Material.setPbrMaterial(this.lumiEntity, {
      albedoColor: Color4.create(1.0, 0.92, 0.45, 0.1),
      emissiveColor: Color4.create(1.0, 0.85, 0.2, 1.0),
      emissiveIntensity: 0.8,
      transparencyMode: 2
    });

    // Tap Lumi -> Interaction Cheer
    pointerEventsSystem.onPointerDown(
      {
        entity: this.lumiEntity,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Interact with Lumi Spirit Companion'
        }
      },
      () => {
        this.callbacks.onLumiInteract();
      }
    );
  }

  public spawnLagoonBottles(): void {
    // Clear old
    this.bottleEntities.forEach(b => engine.removeEntity(b.entity));
    this.bottleEntities = [];

    const bottles = this.lagoonSystem.getActiveBottles();

    bottles.forEach((bottle, idx) => {
      const bottleEntity = engine.addEntity();
      Transform.create(bottleEntity, {
        position: Vector3.create(bottle.position.x, bottle.position.y, bottle.position.z),
        scale: Vector3.create(0.3, 0.45, 0.3)
      });
      MeshRenderer.setCylinder(bottleEntity);
      MeshCollider.setCylinder(bottleEntity);

      // Color by ribbon
      const isGold = bottle.ribbonColor === 'gold';
      Material.setPbrMaterial(bottleEntity, {
        albedoColor: isGold ? Color4.create(1.0, 0.85, 0.2, 0.9) : Color4.create(0.2, 0.8, 1.0, 0.9),
        emissiveColor: isGold ? Color4.create(0.8, 0.6, 0.1, 1.0) : Color4.create(0.1, 0.5, 0.8, 1.0),
        emissiveIntensity: 2.0
      });

      // Pointer Click -> Open Bottle Viewer
      pointerEventsSystem.onPointerDown(
        {
          entity: bottleEntity,
          opts: {
            button: InputAction.IA_POINTER,
            hoverText: `Inspect bottle from ${bottle.authorName}`
          }
        },
        () => {
          this.callbacks.onOpenBottle(bottle);
        }
      );

      this.bottleEntities.push({
        entity: bottleEntity,
        bottleId: bottle.bottleId,
        offset: idx * 0.7
      });
    });
  }

  private updateAnimations(timeSeconds: number, dt: number): void {
    // 1. Water Bobbing for lagoon bottles
    this.bottleEntities.forEach(b => {
      if (Transform.has(b.entity)) {
        const tf = Transform.getMutable(b.entity);
        tf.position.y = this.lagoonSystem.calculateWaterBobbingY(timeSeconds, b.offset);
        tf.rotation = Quaternion.fromEulerDegrees(
          Math.sin(timeSeconds + b.offset) * 8,
          timeSeconds * 15 + b.offset * 30,
          Math.cos(timeSeconds + b.offset) * 8
        );
      }
    });

    // 2. Campfire Flickering Glow
    if (Transform.has(this.fireGlowEntity)) {
      const flicker = 0.9 + Math.sin(timeSeconds * 8.0) * 0.15;
      const tf = Transform.getMutable(this.fireGlowEntity);
      tf.scale = Vector3.create(flicker, 1.0 + Math.cos(timeSeconds * 6.0) * 0.1, flicker);
    }

    // 3. Track the local player so Lumi can follow them around
    const playerTf = Transform.getOrNull(engine.PlayerEntity);
    if (playerTf) {
      this.lumiSystem.updatePlayerPosition('local-player', {
        x: playerTf.position.x,
        y: playerTf.position.y,
        z: playerTf.position.z
      });
    }

    // 4. Lumi Position Lerp
    this.lumiSystem.tick(dt);
    if (Transform.has(this.lumiEntity)) {
      const lumiState = this.lumiSystem.getState();
      const tf = Transform.getMutable(this.lumiEntity);
      tf.position = Vector3.create(
        lumiState.targetPosition.x,
        lumiState.targetPosition.y + Math.sin(timeSeconds * 3.0) * 0.15, // Gentle hovering bob
        lumiState.targetPosition.z
      );

      // Face the player while guiding them
      if (lumiState.currentMode === 'FOLLOW_GUIDE' && playerTf) {
        const dx = playerTf.position.x - tf.position.x;
        const dz = playerTf.position.z - tf.position.z;
        if (Math.abs(dx) > 0.05 || Math.abs(dz) > 0.05) {
          const yaw = (Math.atan2(dx, dz) * 180) / Math.PI;
          tf.rotation = Quaternion.fromEulerDegrees(0, yaw, 0);
        }
      }
    }
  }
}
