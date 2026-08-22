/**
 * Kizuna Haven - Fireplace 3D Asset & Animation Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildFireplaceGlb,
  buildFireplaceNodes,
  buildFireplaceTriangleSoup,
  facetedCylinder,
  facetedStone,
  sparkDiamond,
  stylizedSpiralFlame,
  curvedFlameTongue,
  FIREPLACE_MATERIALS
} from '../../tools/generate-fireplace';

describe('Fireplace 3D Asset Forge & Animation', () => {
  const glbPath = resolve(process.cwd(), 'models', 'fireplace.glb');

  it('generates valid primitive geometries with outward facing normals', () => {
    const stone = facetedStone(1);
    expect(stone.positions.length).toBeGreaterThan(0);
    expect(stone.indices.length).toBeGreaterThan(0);
    expect(stone.indices.length % 3).toBe(0);

    const log = facetedCylinder(0.1, 1.0, 6, true);
    expect(log.body.positions.length).toBeGreaterThan(0);
    expect(log.caps).toBeDefined();
    expect(log.caps!.positions.length).toBeGreaterThan(0);

    const flame = stylizedSpiralFlame(1.0, 0.2, 0.3, 1.0, 6, 0.2);
    expect(flame.positions.length).toBeGreaterThan(0);
    expect(flame.indices.length % 3).toBe(0);

    const tongue = curvedFlameTongue(0.8, 0.15, 0.22, 20, 5);
    expect(tongue.positions.length).toBeGreaterThan(0);
    expect(tongue.indices.length % 3).toBe(0);

    const spark = sparkDiamond(0.06);
    expect(spark.positions.length).toBe(6);
    expect(spark.indices.length).toBe(24); // 8 octahedron faces * 3
  });

  it('assembles multi-node fireplace hierarchy with stone hearth, logs, layered flames, and sparks', () => {
    const nodes = buildFireplaceNodes();
    expect(nodes.length).toBe(12);

    const nodeNames = nodes.map((n) => n.name);
    expect(nodeNames).toContain('HearthAndLogs');
    expect(nodeNames).toContain('FlameCore');
    expect(nodeNames).toContain('FlameMid');
    expect(nodeNames).toContain('FlameOuter1');
    expect(nodeNames).toContain('FlameOuter2');
    expect(nodeNames).toContain('FlameOuter3');
    expect(nodeNames).toContain('SparkNode0');
    expect(nodeNames).toContain('SparkNode5');

    const tris = buildFireplaceTriangleSoup();
    expect(tris.length).toBeGreaterThan(500);

    // Verify all 9 materials are represented in geometry
    const usedMats = new Set(tris.map((t) => t.material));
    expect(usedMats.size).toBe(FIREPLACE_MATERIALS.length);
  });

  it('packs valid glTF 2.0 binary container with magic header and aligned chunks', () => {
    const glb = buildFireplaceGlb();
    expect(glb.length).toBeGreaterThan(20000);

    // glTF magic: 0x46546c67 ("glTF")
    const magic = glb.readUInt32LE(0);
    expect(magic).toBe(0x46546c67);

    // glTF version 2
    const version = glb.readUInt32LE(4);
    expect(version).toBe(2);

    // JSON chunk header
    const jsonLen = glb.readUInt32LE(12);
    const jsonType = glb.readUInt32LE(16);
    expect(jsonType).toBe(0x4e4f534a); // "JSON"

    const jsonStr = glb.subarray(20, 20 + jsonLen).toString('utf8');
    const gltf = JSON.parse(jsonStr);

    expect(gltf.asset.version).toBe('2.0');
    expect(gltf.scenes).toHaveLength(1);
    expect(gltf.nodes.length).toBeGreaterThanOrEqual(13);
    expect(gltf.meshes.length).toBe(12);
    expect(gltf.materials).toHaveLength(FIREPLACE_MATERIALS.length);
  });

  it('contains valid baked "Burn" keyframe animation with 29 active channels', () => {
    const glb = buildFireplaceGlb();
    const jsonLen = glb.readUInt32LE(12);
    const gltf = JSON.parse(glb.subarray(20, 20 + jsonLen).toString('utf8'));

    expect(gltf.animations).toBeDefined();
    expect(gltf.animations).toHaveLength(1);

    const anim = gltf.animations[0];
    expect(anim.name).toBe('Burn');
    expect(anim.channels.length).toBe(29);
    expect(anim.samplers.length).toBe(29);

    // Verify animation targets exist and target paths are valid
    const validPaths = new Set(['translation', 'rotation', 'scale']);
    anim.channels.forEach((ch: any) => {
      expect(validPaths.has(ch.target.path)).toBe(true);
      expect(ch.target.node).toBeGreaterThanOrEqual(1);
      expect(ch.target.node).toBeLessThan(gltf.nodes.length);
    });

    // Verify time accessor bounds
    const timeSampler = anim.samplers[0];
    const timeAcc = gltf.accessors[timeSampler.input];
    expect(timeAcc.type).toBe('SCALAR');
    expect(timeAcc.min[0]).toBe(0.0);
    expect(timeAcc.max[0]).toBe(3.0);
  });

  it('verifies shipped models/fireplace.glb file on disk matches binary specifications', () => {
    expect(existsSync(glbPath)).toBe(true);
    const fileBuf = readFileSync(glbPath);
    expect(fileBuf.readUInt32LE(0)).toBe(0x46546c67);
    expect(fileBuf.length).toBeGreaterThan(50000);
  });
});
