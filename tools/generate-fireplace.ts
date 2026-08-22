/**
 * Kizuna Haven - Procedural Asset Forge: Stylized Animated Fireplace
 * Generates a stylized low-poly 3D Campfire Hearth model as a binary glTF 2.0 (GLB).
 *
 * Design:
 *   - 12 Faceted river boulders forming the stone hearth ring
 *   - Sunken glowing charcoal ember basin
 *   - 4 Crisscrossed cedar firewood logs with exposed cut end-grain
 *   - Concentric spiraling flame spires with incandescent core, helical mid cone, and outer licking tongues
 *   - 6 Staggered floating stardust spark crystals ascending in a continuous vortex
 * Animation:
 *   - 'Burn' clip (3.0s seamless fluid vortex loop @ 30 FPS)
 *
 * Run: npx tsx tools/generate-fireplace.ts
 * Output: models/fireplace.glb
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

export interface Geo {
  positions: Vec3[];
  indices: number[];
}

export interface PartOptions {
  translate?: Vec3;
  rotateDeg?: Vec3;
  scale?: Vec3;
}

// ---------------------------------------------------------------------------
// Math & Transformation Helpers
// ---------------------------------------------------------------------------

export function eulerToQuat(degX: number, degY: number, degZ: number): Vec4 {
  const radX = (degX * Math.PI) / 360;
  const radY = (degY * Math.PI) / 360;
  const radZ = (degZ * Math.PI) / 360;
  const c1 = Math.cos(radX), s1 = Math.sin(radX);
  const c2 = Math.cos(radY), s2 = Math.sin(radY);
  const c3 = Math.cos(radZ), s3 = Math.sin(radZ);

  // XYZ rotation order
  const x = s1 * c2 * c3 + c1 * s2 * s3;
  const y = c1 * s2 * c3 - s1 * c2 * s3;
  const z = c1 * c2 * s3 + s1 * s2 * c3;
  const w = c1 * c2 * c3 - s1 * s2 * s3;

  return [x, y, z, w];
}

export function transformGeo(geo: Geo, opts: PartOptions): Geo {
  const s = opts.scale ?? [1, 1, 1];
  const r = (opts.rotateDeg ?? [0, 0, 0]).map((d) => (d * Math.PI) / 180);
  const t = opts.translate ?? [0, 0, 0];

  const [sx, sy, sz] = s;
  const [rx, ry, rz] = r;

  const positions = geo.positions.map((p) => {
    let [x, y, z] = [p[0] * sx, p[1] * sy, p[2] * sz];

    // Rotate X
    let c = Math.cos(rx), n = Math.sin(rx);
    [y, z] = [y * c - z * n, y * n + z * c];
    // Rotate Y
    c = Math.cos(ry); n = Math.sin(ry);
    [x, z] = [x * c + z * n, -x * n + z * c];
    // Rotate Z
    c = Math.cos(rz); n = Math.sin(rz);
    [x, y] = [x * c - y * n, x * n + y * c];

    return [x + t[0], y + t[1], z + t[2]] as Vec3;
  });

  return { positions, indices: geo.indices };
}

/**
 * Explodes indexed geometry into per-face vertices with flat hard normals
 * to create the iconic low-poly cel-shaded look matching Lumi.
 */
export function flattenFlatShaded(geo: Geo): { positions: Float32Array; normals: Float32Array } {
  const pos: number[] = [];
  const nor: number[] = [];

  for (let i = 0; i < geo.indices.length; i += 3) {
    const a = geo.positions[geo.indices[i]];
    const b = geo.positions[geo.indices[i + 1]];
    const c = geo.positions[geo.indices[i + 2]];

    const u: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let nx = u[1] * v[2] - u[2] * v[1];
    let ny = u[2] * v[0] - u[0] * v[2];
    let nz = u[0] * v[1] - u[1] * v[0];
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;

    for (const p of [a, b, c]) {
      pos.push(p[0], p[1], p[2]);
      nor.push(nx, ny, nz);
    }
  }
  return { positions: new Float32Array(pos), normals: new Float32Array(nor) };
}

// ---------------------------------------------------------------------------
// Low-Poly Geometry Primitives
// ---------------------------------------------------------------------------

/**
 * Low-poly faceted boulder primitive with pseudo-random facet noise
 */
export function facetedStone(seed = 0): Geo {
  const latBands = 4;
  const lonSectors = 6;
  const positions: Vec3[] = [];
  const indices: number[] = [];

  const hash = (n: number) => Math.sin(seed * 997 + n * 137.5) * 0.5 + 0.5;

  for (let i = 0; i <= latBands; i++) {
    const theta = (i / latBands) * Math.PI;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    for (let j = 0; j <= lonSectors; j++) {
      const phi = (j / lonSectors) * Math.PI * 2;
      const noise = 0.82 + 0.36 * hash(i * 10 + j);
      const r = noise;

      const yOffset = cosT < -0.4 ? cosT * 0.7 : cosT;
      positions.push([r * sinT * Math.cos(phi), r * yOffset, r * sinT * Math.sin(phi)]);
    }
  }

  for (let i = 0; i < latBands; i++) {
    for (let j = 0; j < lonSectors; j++) {
      const first = i * (lonSectors + 1) + j;
      const second = first + lonSectors + 1;
      indices.push(first, first + 1, second, first + 1, second + 1, second);
    }
  }

  return { positions, indices };
}

/**
 * Low-poly faceted firewood log (hexagonal prism with flat cut end-caps)
 */
export function facetedCylinder(radius: number, height: number, segments = 6, capMaterials = false): {
  body: Geo;
  caps?: Geo;
} {
  const bodyPos: Vec3[] = [];
  const bodyIdx: number[] = [];
  const capsPos: Vec3[] = [];
  const capsIdx: number[] = [];

  const halfH = height / 2;

  // Body vertices: top ring and bottom ring
  for (let j = 0; j < segments; j++) {
    const phi = (j / segments) * Math.PI * 2;
    const x = radius * Math.cos(phi);
    const z = radius * Math.sin(phi);
    bodyPos.push([x, halfH, z]);   // top ring: j*2
    bodyPos.push([x, -halfH, z]);  // bot ring: j*2 + 1
  }

  for (let j = 0; j < segments; j++) {
    const next = (j + 1) % segments;
    const t0 = j * 2;
    const b0 = j * 2 + 1;
    const t1 = next * 2;
    const b1 = next * 2 + 1;
    // Quad face as 2 triangles (CCW looking from outside)
    bodyIdx.push(t0, t1, b0, t1, b1, b0);
  }

  // End caps
  const targetPos = capMaterials ? capsPos : bodyPos;
  const targetIdx = capMaterials ? capsIdx : bodyIdx;
  const topCenter = targetPos.length;
  targetPos.push([0, halfH, 0]);
  const botCenter = targetPos.length;
  targetPos.push([0, -halfH, 0]);

  const topOffset = targetPos.length;
  for (let j = 0; j < segments; j++) {
    const phi = (j / segments) * Math.PI * 2;
    targetPos.push([radius * Math.cos(phi), halfH, radius * Math.sin(phi)]);
  }

  const botOffset = targetPos.length;
  for (let j = 0; j < segments; j++) {
    const phi = (j / segments) * Math.PI * 2;
    targetPos.push([radius * Math.cos(phi), -halfH, radius * Math.sin(phi)]);
  }

  for (let j = 0; j < segments; j++) {
    const next = (j + 1) % segments;
    // Top cap (CCW looking from above)
    targetIdx.push(topCenter, topOffset + next, topOffset + j);
    // Bottom cap (CCW looking from below)
    targetIdx.push(botCenter, botOffset + j, botOffset + next);
  }

  if (capMaterials) {
    return { body: { positions: bodyPos, indices: bodyIdx }, caps: { positions: capsPos, indices: capsIdx } };
  }
  return { body: { positions: bodyPos, indices: bodyIdx } };
}

/**
 * Low-poly faceted helical spiral flame spire.
 * Helical fluting ensures that rotation around the Y-axis creates the optical
 * illusion of fluid upward-flowing flames.
 */
export function stylizedSpiralFlame(
  height = 1.0,
  baseRadius = 0.22,
  midRadius = 0.32,
  helixTwist = 1.1,
  segments = 6,
  flutingDepth = 0.20
): Geo {
  const positions: Vec3[] = [];
  const indices: number[] = [];

  const baseCenter = 0;
  positions.push([0, 0, 0]);

  const apex = 1;
  positions.push([0, height, 0]);

  const ringCount = 4;
  const ringOffsets: number[] = [];

  for (let r = 0; r < ringCount; r++) {
    const v = (r + 1) / (ringCount + 1); // 0.2, 0.4, 0.6, 0.8
    const y = v * height;
    const profile = Math.sin(v * Math.PI) * midRadius + (1 - v) * baseRadius * 0.45;
    const twist = v * helixTwist;
    const ringStart = positions.length;
    ringOffsets.push(ringStart);

    for (let j = 0; j < segments; j++) {
      const phi = (j / segments) * Math.PI * 2 + twist;
      const flute = 1.0 + Math.sin(j * 2) * flutingDepth;
      const rad = profile * flute;
      positions.push([rad * Math.cos(phi), y, rad * Math.sin(phi)]);
    }
  }

  // Connect base to ring 0 (CCW from outside)
  for (let j = 0; j < segments; j++) {
    const next = (j + 1) % segments;
    indices.push(baseCenter, ringOffsets[0] + j, ringOffsets[0] + next);
  }

  // Connect mid rings (CCW from outside)
  for (let r = 0; r < ringCount - 1; r++) {
    const rA = ringOffsets[r];
    const rB = ringOffsets[r + 1];
    for (let j = 0; j < segments; j++) {
      const next = (j + 1) % segments;
      const a0 = rA + j;
      const a1 = rA + next;
      const b0 = rB + j;
      const b1 = rB + next;
      indices.push(a0, b0, a1);
      indices.push(a1, b0, b1);
    }
  }

  // Connect top ring to apex (CCW from outside)
  const topRing = ringOffsets[ringCount - 1];
  for (let j = 0; j < segments; j++) {
    const next = (j + 1) % segments;
    indices.push(apex, topRing + next, topRing + j);
  }

  return { positions, indices };
}

/**
 * Curved flame tongue shard with dynamic tip lean
 */
export function curvedFlameTongue(
  height = 0.8,
  baseRadius = 0.16,
  midRadius = 0.22,
  leanDeg = 20,
  segments = 5
): Geo {
  const positions: Vec3[] = [];
  const indices: number[] = [];

  const baseCenter = 0;
  positions.push([0, 0, 0]);

  const leanRad = (leanDeg * Math.PI) / 180;
  const apexOffset: Vec3 = [Math.sin(leanRad) * height * 0.35, height, Math.cos(leanRad) * height * 0.15];
  const apex = 1;
  positions.push(apexOffset);

  const ring1Offset = positions.length;
  const y1 = height * 0.28;
  for (let j = 0; j < segments; j++) {
    const phi = (j / segments) * Math.PI * 2;
    positions.push([baseRadius * Math.cos(phi), y1, baseRadius * Math.sin(phi)]);
  }

  const ring2Offset = positions.length;
  const y2 = height * 0.62;
  for (let j = 0; j < segments; j++) {
    const phi = (j / segments) * Math.PI * 2 + 0.35;
    positions.push([
      midRadius * Math.cos(phi) + apexOffset[0] * 0.5,
      y2,
      midRadius * Math.sin(phi) + apexOffset[2] * 0.5
    ]);
  }

  for (let j = 0; j < segments; j++) {
    const next = (j + 1) % segments;
    const r1_a = ring1Offset + j;
    const r1_b = ring1Offset + next;
    const r2_a = ring2Offset + j;
    const r2_b = ring2Offset + next;

    indices.push(baseCenter, r1_a, r1_b);
    indices.push(r1_a, r2_a, r1_b);
    indices.push(r1_b, r2_a, r2_b);
    indices.push(apex, r2_b, r2_a);
  }

  return { positions, indices };
}

/**
 * Faceted celestial sparkle / stardust crystal (octahedron)
 */
export function sparkDiamond(size = 0.06): Geo {
  const positions: Vec3[] = [
    [size, 0, 0],
    [-size, 0, 0],
    [0, size * 1.6, 0],
    [0, -size * 1.6, 0],
    [0, 0, size],
    [0, 0, -size]
  ];
  const indices = [
    2, 4, 0, 2, 0, 5, 2, 5, 1, 2, 1, 4,
    3, 0, 4, 3, 5, 0, 3, 1, 5, 3, 4, 1
  ];
  return { positions, indices };
}

// ---------------------------------------------------------------------------
// Materials Palette
// ---------------------------------------------------------------------------

export const FIREPLACE_MATERIALS = [
  {
    name: 'StoneSlate',
    baseColor: [0.34, 0.35, 0.38, 1.0],
    emissive: [0.0, 0.0, 0.0],
    roughness: 0.92,
    metallic: 0.05
  },
  {
    name: 'StoneGranite',
    baseColor: [0.46, 0.42, 0.38, 1.0],
    emissive: [0.0, 0.0, 0.0],
    roughness: 0.88,
    metallic: 0.05
  },
  {
    name: 'LogCedar',
    baseColor: [0.36, 0.22, 0.14, 1.0],
    emissive: [0.02, 0.01, 0.0],
    roughness: 0.85,
    metallic: 0.0
  },
  {
    name: 'LogWoodCore',
    baseColor: [0.72, 0.54, 0.34, 1.0],
    emissive: [0.04, 0.02, 0.0],
    roughness: 0.8,
    metallic: 0.0
  },
  {
    name: 'CharcoalEmber',
    baseColor: [0.18, 0.12, 0.10, 1.0],
    emissive: [0.75, 0.28, 0.04],
    roughness: 0.9,
    metallic: 0.0
  },
  {
    name: 'FlameCore',
    baseColor: [1.0, 0.96, 0.68, 1.0],
    emissive: [1.0, 0.94, 0.48],
    roughness: 0.15,
    metallic: 0.0
  },
  {
    name: 'FlameMid',
    baseColor: [0.98, 0.52, 0.10, 1.0],
    emissive: [0.95, 0.44, 0.06],
    roughness: 0.25,
    metallic: 0.0
  },
  {
    name: 'FlameOuter',
    baseColor: [0.92, 0.22, 0.05, 1.0],
    emissive: [0.85, 0.16, 0.02],
    roughness: 0.3,
    metallic: 0.0
  },
  {
    name: 'StardustSpark',
    baseColor: [1.0, 0.96, 0.72, 1.0],
    emissive: [1.0, 0.92, 0.40],
    roughness: 0.1,
    metallic: 0.0
  }
];

export const MAT_STONE_SLATE = 0;
export const MAT_STONE_GRANITE = 1;
export const MAT_LOG_CEDAR = 2;
export const MAT_LOG_CORE = 3;
export const MAT_CHARCOAL_EMBER = 4;
export const MAT_FLAME_CORE = 5;
export const MAT_FLAME_MID = 6;
export const MAT_FLAME_OUTER = 7;
export const MAT_STARDUST_SPARK = 8;

// ---------------------------------------------------------------------------
// Model Composition & Node Hierarchy
// ---------------------------------------------------------------------------

export interface Part {
  material: number;
  geo: Geo;
}

export interface ModelNodeDef {
  name: string;
  parts: Part[];
  initialTranslation?: Vec3;
  initialRotation?: Vec4;
  initialScale?: Vec3;
}

export function buildFireplaceNodes(): ModelNodeDef[] {
  // 1. Static Hearth & Firewood
  const hearthParts: Part[] = [];
  const addHearth = (mat: number, geo: Geo, opts: PartOptions = {}) => {
    hearthParts.push({ material: mat, geo: transformGeo(geo, opts) });
  };

  // Sunken Ash Basin & Glowing Ember Bed
  const emberBasin = facetedCylinder(0.95, 0.12, 10);
  addHearth(MAT_CHARCOAL_EMBER, emberBasin.body, { translate: [0, 0.05, 0] });

  // Glowing Coal Chunks in hearth center
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2 + i * 0.4;
    const dist = 0.28 + (i % 3) * 0.18;
    addHearth(MAT_CHARCOAL_EMBER, facetedStone(100 + i), {
      scale: [0.18, 0.12, 0.18],
      translate: [Math.cos(angle) * dist, 0.12, Math.sin(angle) * dist],
      rotateDeg: [i * 30, i * 45, i * 20]
    });
  }

  // Stone Hearth Ring: 11 stylized river stones
  const stoneCount = 11;
  const ringRadius = 1.15;
  for (let i = 0; i < stoneCount; i++) {
    const angle = (i / stoneCount) * Math.PI * 2;
    const stoneScaleX = 0.32 + ((i * 7) % 5) * 0.04;
    const stoneScaleY = 0.22 + ((i * 3) % 4) * 0.04;
    const stoneScaleZ = 0.38 + ((i * 11) % 5) * 0.03;
    const sx = Math.cos(angle) * ringRadius;
    const sz = Math.sin(angle) * ringRadius;
    const mat = i % 2 === 0 ? MAT_STONE_SLATE : MAT_STONE_GRANITE;

    addHearth(mat, facetedStone(i + 1), {
      scale: [stoneScaleX, stoneScaleY, stoneScaleZ],
      translate: [sx, stoneScaleY * 0.75, sz],
      rotateDeg: [((i * 13) % 20) - 10, (-angle * 180) / Math.PI + 90 + (i % 3) * 15, ((i * 7) % 20) - 10]
    });
  }

  // 4 Crisscrossed Cedar Firewood Logs
  const logRadius = 0.11;
  const logLength = 0.95;

  const log1 = facetedCylinder(logRadius, logLength, 6, true);
  addHearth(MAT_LOG_CEDAR, log1.body, { translate: [-0.28, 0.28, 0.26], rotateDeg: [35, 40, -25] });
  if (log1.caps) addHearth(MAT_LOG_CORE, log1.caps, { translate: [-0.28, 0.28, 0.26], rotateDeg: [35, 40, -25] });

  const log2 = facetedCylinder(logRadius, logLength, 6, true);
  addHearth(MAT_LOG_CEDAR, log2.body, { scale: [0.95, 1.05, 0.95], translate: [0.28, 0.28, 0.24], rotateDeg: [32, -45, 28] });
  if (log2.caps) addHearth(MAT_LOG_CORE, log2.caps, { scale: [0.95, 1.05, 0.95], translate: [0.28, 0.28, 0.24], rotateDeg: [32, -45, 28] });

  const log3 = facetedCylinder(logRadius, logLength, 6, true);
  addHearth(MAT_LOG_CEDAR, log3.body, { scale: [1.02, 0.92, 1.02], translate: [0.0, 0.32, -0.32], rotateDeg: [-38, 0, 0] });
  if (log3.caps) addHearth(MAT_LOG_CORE, log3.caps, { scale: [1.02, 0.92, 1.02], translate: [0.0, 0.32, -0.32], rotateDeg: [-38, 0, 0] });

  const log4 = facetedCylinder(logRadius * 0.9, 0.8, 6, true);
  addHearth(MAT_LOG_CEDAR, log4.body, { translate: [-0.05, 0.16, 0.42], rotateDeg: [0, 80, 85] });
  if (log4.caps) addHearth(MAT_LOG_CORE, log4.caps, { translate: [-0.05, 0.16, 0.42], rotateDeg: [0, 80, 85] });

  // 2. Animated Inner Flame Core (Incandescent White-Gold Spire)
  const flameCoreParts: Part[] = [
    {
      material: MAT_FLAME_CORE,
      geo: transformGeo(stylizedSpiralFlame(1.25, 0.14, 0.20, 0.8, 5, 0.15), { translate: [0, 0.05, 0] })
    }
  ];

  // 3. Animated Middle Spiral Flame Cone (Vibrant Fiery Orange)
  const flameMidParts: Part[] = [
    {
      material: MAT_FLAME_MID,
      geo: transformGeo(stylizedSpiralFlame(1.05, 0.25, 0.34, 1.4, 6, 0.25), { translate: [0, 0.02, 0] })
    }
  ];

  // 4. Animated Outer Licking Flame Tongue 1 (Front Left)
  const flameOuter1Parts: Part[] = [
    {
      material: MAT_FLAME_OUTER,
      geo: transformGeo(curvedFlameTongue(0.82, 0.16, 0.24, 22, 5), { translate: [0, 0, 0] })
    },
    {
      material: MAT_FLAME_MID,
      geo: transformGeo(curvedFlameTongue(0.52, 0.10, 0.15, 16, 5), { translate: [0, 0.02, 0] })
    }
  ];

  // 5. Animated Outer Licking Flame Tongue 2 (Front Right)
  const flameOuter2Parts: Part[] = [
    {
      material: MAT_FLAME_OUTER,
      geo: transformGeo(curvedFlameTongue(0.88, 0.18, 0.25, -24, 5), { translate: [0, 0, 0] })
    },
    {
      material: MAT_FLAME_MID,
      geo: transformGeo(curvedFlameTongue(0.58, 0.11, 0.16, -18, 5), { translate: [0, 0.02, 0] })
    }
  ];

  // 6. Animated Outer Licking Flame Tongue 3 (Back)
  const flameOuter3Parts: Part[] = [
    {
      material: MAT_FLAME_OUTER,
      geo: transformGeo(curvedFlameTongue(0.78, 0.15, 0.22, 18, 5), { translate: [0, 0, 0] })
    },
    {
      material: MAT_FLAME_CORE,
      geo: transformGeo(curvedFlameTongue(0.44, 0.08, 0.12, 12, 5), { translate: [0, 0.03, 0] })
    }
  ];

  // 7-12: 6 Independent Ascending Stardust Spark Crystals
  const sparkNodes: ModelNodeDef[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r = 0.12 + (i % 2) * 0.08;
    sparkNodes.push({
      name: `SparkNode${i}`,
      parts: [
        {
          material: MAT_STARDUST_SPARK,
          geo: sparkDiamond(0.05 + (i % 3) * 0.015)
        }
      ],
      initialTranslation: [Math.cos(angle) * r, 0.95 + (i % 3) * 0.22, Math.sin(angle) * r]
    });
  }

  return [
    { name: 'HearthAndLogs', parts: hearthParts },
    { name: 'FlameCore', parts: flameCoreParts, initialTranslation: [0, 0.22, 0] },
    { name: 'FlameMid', parts: flameMidParts, initialTranslation: [0, 0.22, 0] },
    { name: 'FlameOuter1', parts: flameOuter1Parts, initialTranslation: [-0.22, 0.22, 0.12] },
    { name: 'FlameOuter2', parts: flameOuter2Parts, initialTranslation: [0.20, 0.20, 0.10] },
    { name: 'FlameOuter3', parts: flameOuter3Parts, initialTranslation: [0.0, 0.24, -0.22] },
    ...sparkNodes
  ];
}

/**
 * Returns full triangle soup for offline preview rasterization
 */
export function buildFireplaceTriangleSoup(): Array<{
  verts: [Vec3, Vec3, Vec3];
  material: number;
  color: [number, number, number];
  emissive: [number, number, number];
}> {
  const nodes = buildFireplaceNodes();
  const tris: Array<{
    verts: [Vec3, Vec3, Vec3];
    material: number;
    color: [number, number, number];
    emissive: [number, number, number];
  }> = [];

  for (const node of nodes) {
    const t = node.initialTranslation ?? [0, 0, 0];
    const s = node.initialScale ?? [1, 1, 1];
    for (const part of node.parts) {
      const mat = FIREPLACE_MATERIALS[part.material];
      const geo = transformGeo(part.geo, { translate: t, scale: s });
      for (let i = 0; i < geo.indices.length; i += 3) {
        const a = geo.positions[geo.indices[i]];
        const b = geo.positions[geo.indices[i + 1]];
        const c = geo.positions[geo.indices[i + 2]];
        if (
          Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) < 1e-6 ||
          Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]) < 1e-6
        ) {
          continue;
        }
        tris.push({
          verts: [a, b, c],
          material: part.material,
          color: mat.baseColor.slice(0, 3) as [number, number, number],
          emissive: mat.emissive as [number, number, number]
        });
      }
    }
  }
  return tris;
}

// ---------------------------------------------------------------------------
// glTF 2.0 Binary Packer with Smooth Fluid Vortex Animation
// ---------------------------------------------------------------------------

interface PackedPrimitive {
  attributes: { POSITION: number; NORMAL: number };
  indices: number;
  material: number;
  mode: number;
}

export function buildFireplaceGlb(): Buffer {
  const nodeDefs = buildFireplaceNodes();

  const binChunks: Buffer[] = [];
  let byteOffset = 0;
  const bufferViews: object[] = [];
  const accessors: object[] = [];

  const addBufferView = (data: Buffer, target?: number): number => {
    const pad = (4 - (byteOffset % 4)) % 4;
    if (pad > 0) {
      binChunks.push(Buffer.alloc(pad));
      byteOffset += pad;
    }
    binChunks.push(data);
    const view: any = { buffer: 0, byteOffset, byteLength: data.length };
    if (target) view.target = target;
    bufferViews.push(view);
    byteOffset += data.length;
    return bufferViews.length - 1;
  };

  const meshes: Array<{ name: string; primitives: PackedPrimitive[] }> = [];
  const nodes: object[] = [
    // Root node 0: references all child nodes
    {
      name: 'FireplaceRoot',
      children: nodeDefs.map((_, idx) => idx + 1)
    }
  ];

  nodeDefs.forEach((nodeDef) => {
    const byMaterial = new Map<number, Geo>();
    for (const part of nodeDef.parts) {
      const target = byMaterial.get(part.material) ?? { positions: [], indices: [] };
      const offset = target.positions.length;
      target.positions.push(...part.geo.positions);
      target.indices.push(...part.geo.indices.map((i) => i + offset));
      byMaterial.set(part.material, target);
    }

    const primitives: PackedPrimitive[] = [];

    for (const [material, geo] of [...byMaterial.entries()].sort((a, b) => a[0] - b[0])) {
      const flat = flattenFlatShaded(geo);
      const vertexCount = flat.positions.length / 3;

      const posView = addBufferView(
        Buffer.from(flat.positions.buffer, flat.positions.byteOffset, flat.positions.byteLength),
        34962
      );
      const norView = addBufferView(
        Buffer.from(flat.normals.buffer, flat.normals.byteOffset, flat.normals.byteLength),
        34962
      );

      const IndexArray = vertexCount > 65535 ? Uint32Array : Uint16Array;
      const indexData = new IndexArray(vertexCount);
      for (let i = 0; i < vertexCount; i++) {
        indexData[i] = i;
      }
      const idxView = addBufferView(
        Buffer.from(indexData.buffer, indexData.byteOffset, indexData.byteLength),
        34963
      );

      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      for (let i = 0; i < flat.positions.length; i += 3) {
        minX = Math.min(minX, flat.positions[i]);
        maxX = Math.max(maxX, flat.positions[i]);
        minY = Math.min(minY, flat.positions[i + 1]);
        maxY = Math.max(maxY, flat.positions[i + 1]);
        minZ = Math.min(minZ, flat.positions[i + 2]);
        maxZ = Math.max(maxZ, flat.positions[i + 2]);
      }

      accessors.push({
        bufferView: posView,
        componentType: 5126,
        count: vertexCount,
        type: 'VEC3',
        min: [minX, minY, minZ],
        max: [maxX, maxY, maxZ]
      });
      accessors.push({
        bufferView: norView,
        componentType: 5126,
        count: vertexCount,
        type: 'VEC3'
      });
      accessors.push({
        bufferView: idxView,
        componentType: vertexCount > 65535 ? 5125 : 5123,
        count: vertexCount,
        type: 'SCALAR'
      });

      primitives.push({
        attributes: { POSITION: accessors.length - 3, NORMAL: accessors.length - 2 },
        indices: accessors.length - 1,
        material,
        mode: 4
      });
    }

    const meshIdx = meshes.length;
    meshes.push({ name: `${nodeDef.name}Mesh`, primitives });

    const gltfNode: any = {
      name: nodeDef.name,
      mesh: meshIdx
    };
    if (nodeDef.initialTranslation) gltfNode.translation = nodeDef.initialTranslation;
    if (nodeDef.initialRotation) gltfNode.rotation = nodeDef.initialRotation;
    if (nodeDef.initialScale) gltfNode.scale = nodeDef.initialScale;

    nodes.push(gltfNode);
  });

  // -------------------------------------------------------------------------
  // glTF 2.0 Keyframe Animation: 'Burn' (3.0s Fluid Loop @ 30 FPS)
  // -------------------------------------------------------------------------

  const duration = 3.0;
  const fps = 30;
  const frameCount = Math.round(duration * fps) + 1; // 91 keyframes
  const keyframeTimes: number[] = [];
  for (let f = 0; f < frameCount; f++) {
    keyframeTimes.push(f / fps);
  }

  const timeBuffer = new Float32Array(keyframeTimes);
  const timeView = addBufferView(Buffer.from(timeBuffer.buffer, timeBuffer.byteOffset, timeBuffer.byteLength));
  const timeAcc = accessors.length;
  accessors.push({
    bufferView: timeView,
    componentType: 5126,
    count: keyframeTimes.length,
    type: 'SCALAR',
    min: [0.0],
    max: [duration]
  });

  const samplers: any[] = [];
  const channels: any[] = [];

  const addAnimationChannel = (
    nodeIndex: number,
    path: 'scale' | 'translation' | 'rotation',
    values: number[]
  ) => {
    const valBuffer = new Float32Array(values);
    const valView = addBufferView(Buffer.from(valBuffer.buffer, valBuffer.byteOffset, valBuffer.byteLength));
    const valAcc = accessors.length;
    const type = path === 'rotation' ? 'VEC4' : 'VEC3';
    const count = values.length / (path === 'rotation' ? 4 : 3);

    accessors.push({
      bufferView: valView,
      componentType: 5126,
      count,
      type
    });

    const samplerIdx = samplers.length;
    samplers.push({
      input: timeAcc,
      interpolation: 'LINEAR',
      output: valAcc
    });

    channels.push({
      sampler: samplerIdx,
      target: {
        node: nodeIndex,
        path
      }
    });
  };

  // Node indices:
  // Node 0: Root
  // Node 1: HearthAndLogs
  // Node 2: FlameCore
  // Node 3: FlameMid
  // Node 4: FlameOuter1
  // Node 5: FlameOuter2
  // Node 6: FlameOuter3
  // Node 7..12: SparkNode0..5

  // 1. FlameCore (Incandescent Heart): Steady breathing + slow clockwise swirl
  const coreScale: number[] = [];
  const coreRot: number[] = [];
  keyframeTimes.forEach((t) => {
    const p = (t / duration) * Math.PI * 2;
    const sy = 1.0 + Math.sin(p * 2) * 0.07;
    const sxz = 1.0 - Math.sin(p * 2) * 0.035;
    coreScale.push(sxz, sy, sxz);

    const degY = ((t / duration) * 360) % 360;
    coreRot.push(...eulerToQuat(0, degY, 0));
  });
  addAnimationChannel(2, 'scale', coreScale);
  addAnimationChannel(2, 'rotation', coreRot);

  // 2. FlameMid (Helical Cone): Continuous upward optical vortex via rotation + gentle wave
  const midScale: number[] = [];
  const midRot: number[] = [];
  const midTrans: number[] = [];
  keyframeTimes.forEach((t) => {
    const p = (t / duration) * Math.PI * 2;
    const sy = 1.0 + Math.sin(p * 2 + 1.2) * 0.09;
    const sxz = 1.0 - Math.sin(p * 2 + 1.2) * 0.04;
    midScale.push(sxz, sy, sxz);

    const degY = ((t / duration) * 360) % 360;
    const swayX = Math.sin(p) * 2.5;
    const swayZ = Math.cos(p) * 2.5;
    midRot.push(...eulerToQuat(swayX, degY, swayZ));

    const ty = 0.22 + Math.sin(p * 2) * 0.015;
    midTrans.push(0, ty, 0);
  });
  addAnimationChannel(3, 'scale', midScale);
  addAnimationChannel(3, 'rotation', midRot);
  addAnimationChannel(3, 'translation', midTrans);

  // 3. FlameOuter1 (Front-Left Tongue): Out-of-phase curling wave
  const outer1Scale: number[] = [];
  const outer1Rot: number[] = [];
  keyframeTimes.forEach((t) => {
    const p = (t / duration) * Math.PI * 2;
    const sy = 0.96 + Math.sin(p * 2 + 0.0) * 0.12;
    outer1Scale.push(1.0, sy, 1.0);

    const degX = 10 + Math.sin(p * 2) * 5.0;
    const degZ = -15 + Math.cos(p * 2) * 6.0;
    outer1Rot.push(...eulerToQuat(degX, 30, degZ));
  });
  addAnimationChannel(4, 'scale', outer1Scale);
  addAnimationChannel(4, 'rotation', outer1Rot);

  // 4. FlameOuter2 (Front-Right Tongue)
  const outer2Scale: number[] = [];
  const outer2Rot: number[] = [];
  keyframeTimes.forEach((t) => {
    const p = (t / duration) * Math.PI * 2;
    const sy = 0.96 + Math.sin(p * 2 + 2.1) * 0.14;
    outer2Scale.push(1.0, sy, 1.0);

    const degX = 8 + Math.cos(p * 2) * 5.0;
    const degZ = 18 + Math.sin(p * 2) * 6.0;
    outer2Rot.push(...eulerToQuat(degX, -35, degZ));
  });
  addAnimationChannel(5, 'scale', outer2Scale);
  addAnimationChannel(5, 'rotation', outer2Rot);

  // 5. FlameOuter3 (Rear Tongue)
  const outer3Scale: number[] = [];
  const outer3Rot: number[] = [];
  keyframeTimes.forEach((t) => {
    const p = (t / duration) * Math.PI * 2;
    const sy = 0.96 + Math.sin(p * 2 + 4.2) * 0.12;
    outer3Scale.push(1.0, sy, 1.0);

    const degX = -15 + Math.sin(p * 2) * 5.0;
    const degZ = Math.cos(p * 2) * 5.0;
    outer3Rot.push(...eulerToQuat(degX, 180, degZ));
  });
  addAnimationChannel(6, 'scale', outer3Scale);
  addAnimationChannel(6, 'rotation', outer3Rot);

  // 6-11: Sparks 0..5 (Continuous Staggered Buoyant Ascent Vortex)
  for (let i = 0; i < 6; i++) {
    const sparkNodeIdx = 7 + i;
    const trans: number[] = [];
    const scale: number[] = [];
    const rot: number[] = [];

    const baseAngle = (i / 6) * Math.PI * 2;

    keyframeTimes.forEach((t) => {
      const u = ((t / duration) + i / 6) % 1.0; // 0.0 -> 1.0
      // Continuous rise from coal bed (Y=0.15) to upper air (Y=1.05)
      const y = 0.15 + u * 0.90;
      const r = 0.08 + u * 0.14;
      const angle = baseAngle + u * Math.PI * 2.2;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      trans.push(x, y, z);

      // Smooth parabolic birth-and-fade envelope (zero at bottom, 1 in mid-air, zero at top)
      const s = Math.sin(u * Math.PI) * 0.85;
      scale.push(s, s, s);

      // Diamond tumbling
      const spin = (u * 360 * 2) % 360;
      rot.push(...eulerToQuat(u * 90, spin, u * 45));
    });

    addAnimationChannel(sparkNodeIdx, 'translation', trans);
    addAnimationChannel(sparkNodeIdx, 'scale', scale);
    addAnimationChannel(sparkNodeIdx, 'rotation', rot);
  }

  const binBuffer = Buffer.concat(binChunks);

  const gltf = {
    asset: { version: '2.0', generator: 'Kizuna Haven Procedural Asset Forge' },
    scene: 0,
    scenes: [{ nodes: [0], name: 'FireplaceScene' }],
    nodes,
    meshes,
    materials: FIREPLACE_MATERIALS.map((m) => ({
      name: m.name,
      doubleSided: true,
      pbrMetallicRoughness: {
        baseColorFactor: m.baseColor,
        metallicFactor: m.metallic ?? 0.0,
        roughnessFactor: m.roughness ?? 0.85
      },
      emissiveFactor: m.emissive
    })),
    animations: [
      {
        name: 'Burn',
        samplers,
        channels
      }
    ],
    buffers: [{ byteLength: binBuffer.length }],
    bufferViews,
    accessors
  };

  // Pack GLB container
  const jsonChunk = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPadding = (4 - (jsonChunk.length % 4)) % 4;
  const jsonPadded = Buffer.concat([jsonChunk, Buffer.alloc(jsonPadding, 0x20)]);

  const binPadding = (4 - (binBuffer.length % 4)) % 4;
  const binPadded = Buffer.concat([binBuffer, Buffer.alloc(binPadding, 0)]);

  const totalLength = 12 + 8 + jsonPadded.length + 8 + binPadded.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // 'glTF'
  header.writeUInt32LE(2, 4);          // version 2
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonPadded.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binPadded.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);  // 'BIN'

  return Buffer.concat([header, jsonHeader, jsonPadded, binHeader, binPadded]);
}

// ---------------------------------------------------------------------------
// Self-Consistency Binary Validation & CLI Entry
// ---------------------------------------------------------------------------

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  console.log('[*] Kizuna Haven Fireplace Asset Forge: Generating models/fireplace.glb...');

  let outward = 0;
  let inward = 0;
  const nodes = buildFireplaceNodes();
  for (const node of nodes) {
    for (const part of node.parts) {
      const flat = flattenFlatShaded(part.geo);
      const pos = flat.positions;
      const nor = flat.normals;
      let cx = 0, cy = 0, cz = 0;
      for (let i = 0; i < pos.length; i += 3) {
        cx += pos[i]; cy += pos[i + 1]; cz += pos[i + 2];
      }
      const n = pos.length / 3;
      if (n === 0) continue;
      cx /= n; cy /= n; cz /= n;

      for (let i = 0; i < pos.length; i += 9) {
        const ax = pos[i + 3] - pos[i];
        const ay = pos[i + 4] - pos[i + 1];
        const az = pos[i + 5] - pos[i + 2];
        if (Math.hypot(ax, ay, az) < 1e-6) continue;
        const mx = (pos[i] + pos[i + 3] + pos[i + 6]) / 3 - cx;
        const my = (pos[i + 1] + pos[i + 4] + pos[i + 7]) / 3 - cy;
        const mz = (pos[i + 2] + pos[i + 5] + pos[i + 8]) / 3 - cz;
        const dot =
          nor[i] * mx + nor[i + 1] * my + nor[i + 2] * mz +
          nor[i + 3] * mx + nor[i + 4] * my + nor[i + 5] * mz +
          nor[i + 6] * mx + nor[i + 7] * my + nor[i + 8] * mz;
        if (dot > 0) outward++;
        else inward++;
      }
    }
  }

  if (inward > outward * 0.15) {
    console.error(`[!] Winding check warning: ${inward} inward vs ${outward} outward faces`);
  } else {
    console.log(`[ok] Face winding check: ${outward} outward faces dominant`);
  }

  const outPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'models', 'fireplace.glb');
  mkdirSync(dirname(outPath), { recursive: true });
  const glb = buildFireplaceGlb();

  const jl = glb.readUInt32LE(12);
  const g = JSON.parse(glb.subarray(20, 20 + jl).toString());
  const binStart = 20 + jl + 8;

  const readAcc = (idx: number): Float32Array | Uint16Array | Uint32Array => {
    const a = g.accessors[idx];
    const v = g.bufferViews[a.bufferView];
    const off = (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
    if (a.componentType === 5126) {
      const mul = a.type === 'SCALAR' ? 1 : a.type === 'VEC3' ? 3 : a.type === 'VEC4' ? 4 : 1;
      return new Float32Array(glb.buffer, glb.byteOffset + binStart + off, a.count * mul);
    }
    const is32 = a.componentType === 5125;
    const dv = new DataView(glb.buffer, glb.byteOffset + binStart + off);
    const r = is32 ? new Uint32Array(a.count) : new Uint16Array(a.count);
    for (let k = 0; k < a.count; k++) {
      r[k] = is32 ? dv.getUint32(k * 4, true) : dv.getUint16(k * 2, true);
    }
    return r;
  };

  let totalFaces = 0;
  let match = 0;
  let mismatch = 0;

  for (const mesh of g.meshes) {
    for (const prim of mesh.primitives) {
      const pos = readAcc(prim.attributes.POSITION) as Float32Array;
      const nor = readAcc(prim.attributes.NORMAL) as Float32Array;
      const idx = readAcc(prim.indices) as Uint16Array | Uint32Array;

      for (let t = 0; t < idx.length; t += 3) {
        totalFaces++;
        const i0 = idx[t] * 3;
        const i1 = idx[t + 1] * 3;
        const i2 = idx[t + 2] * 3;

        if (idx[t] >= pos.length / 3 || idx[t + 1] >= pos.length / 3 || idx[t + 2] >= pos.length / 3) {
          console.error('[!] Index out of range in exported GLB');
          process.exit(1);
        }

        const e1: Vec3 = [pos[i1] - pos[i0], pos[i1 + 1] - pos[i0 + 1], pos[i1 + 2] - pos[i0 + 2]];
        const e2: Vec3 = [pos[i2] - pos[i0], pos[i2 + 1] - pos[i0 + 1], pos[i2 + 2] - pos[i0 + 2]];
        const fn: Vec3 = [
          e1[1] * e2[2] - e1[2] * e2[1],
          e1[2] * e2[0] - e1[0] * e2[2],
          e1[0] * e2[1] - e1[1] * e2[0]
        ];
        if (Math.hypot(...fn) < 1e-9) continue;

        let good = true;
        for (const k of [i0, i1, i2]) {
          if (nor[k] * fn[0] + nor[k + 1] * fn[1] + nor[k + 2] * fn[2] <= 0) {
            good = false;
            break;
          }
        }
        good ? match++ : mismatch++;
      }
    }
  }

  if (mismatch > 0) {
    console.error(`[!] Exported GLB normal mismatch: ${mismatch} mismatched faces`);
    process.exit(1);
  }
  console.log(`[ok] Exported GLB self-consistency: ${match} faces verified (${totalFaces} total)`);

  const anim = g.animations[0];
  if (!anim || anim.name !== 'Burn') {
    console.error('[!] Missing "Burn" animation clip in exported GLB');
    process.exit(1);
  }
  console.log(`[ok] Animation clip 'Burn' verified: ${anim.channels.length} channels, ${anim.samplers.length} samplers`);

  writeFileSync(outPath, glb);
  console.log(`[ok] Wrote ${outPath} (${(glb.length / 1024).toFixed(1)} KB)`);
}
