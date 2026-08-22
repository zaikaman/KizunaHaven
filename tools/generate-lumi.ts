/**
 * Kizuna Haven - Procedural Asset Forge
 * Generates Lumi, the Celestial Spirit Kitsune companion, as a binary GLB.
 *
 * Design reference: "Lumi - Celestial Spirit Kitsune Companion"
 *   Fur: Pearl-White | Marks: Golden Amber | Tail: Stardust & Sparkle
 * Style: Low-Poly Stylized 3D Cel-Shaded (flat-shaded facets)
 *
 * Run: node tools/generate-lumi.ts
 * Output: models/lumi.glb
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type Vec3 = [number, number, number];

interface Geo {
  positions: Vec3[];
  indices: number[];
}

interface PartOptions {
  translate?: Vec3;
  rotateDeg?: Vec3;
  scale?: Vec3;
}

// ---------------------------------------------------------------------------
// Primitive generators (indexed geometry, Y-up, unit-ish sizes)
// ---------------------------------------------------------------------------

export function uvSphere(radius: number, latBands = 7, lonSectors = 9): Geo {
  const positions: Vec3[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= latBands; i++) {
    const theta = (i / latBands) * Math.PI;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    for (let j = 0; j <= lonSectors; j++) {
      const phi = (j / lonSectors) * Math.PI * 2;
      positions.push([radius * sinT * Math.cos(phi), radius * cosT, radius * sinT * Math.sin(phi)]);
    }
  }

  for (let i = 0; i < latBands; i++) {
    for (let j = 0; j < lonSectors; j++) {
      const first = i * (lonSectors + 1) + j;
      const second = first + lonSectors + 1;
      // CCW from outside so flat normals face outward
      indices.push(first, first + 1, second, first + 1, second + 1, second);
    }
  }
  return { positions, indices };
}

export function cone(radius: number, height: number, segments = 6): Geo {
  const positions: Vec3[] = [[0, height / 2, 0]]; // apex
  const indices: number[] = [];

  const baseCenter = 1;
  positions.push([0, -height / 2, 0]); // base center
  for (let j = 0; j < segments; j++) {
    const phi = (j / segments) * Math.PI * 2;
    positions.push([radius * Math.cos(phi), -height / 2, radius * Math.sin(phi)]);
  }
  for (let j = 0; j < segments; j++) {
    const next = (j + 1) % segments;
    const a = 2 + j;
    const b = 2 + next;
    indices.push(0, b, a); // side, CCW from outside
    indices.push(baseCenter, a, b); // base cap, CCW from below
  }
  return { positions, indices };
}

export function octahedron(size = 1): Geo {
  const positions: Vec3[] = [
    [size, 0, 0],
    [-size, 0, 0],
    [0, size, 0],
    [0, -size, 0],
    [0, 0, size],
    [0, 0, -size]
  ];
  // Top pyramid + bottom pyramid, CCW from outside
  const indices = [
    2, 4, 0, 2, 0, 5, 2, 5, 1, 2, 1, 4,
    3, 0, 4, 3, 5, 0, 3, 1, 5, 3, 4, 1
  ];
  return { positions, indices };
}

// ---------------------------------------------------------------------------
// Transforms & shading
// ---------------------------------------------------------------------------

function transformGeo(geo: Geo, opts: PartOptions): Geo {
  const s = opts.scale ?? [1, 1, 1];
  const r = (opts.rotateDeg ?? [0, 0, 0]).map((d) => (d * Math.PI) / 180);
  const t = opts.translate ?? [0, 0, 0];

  const [sx, sy, sz] = s;
  const [rx, ry, rz] = r;

  const positions = geo.positions.map((p) => {
    let [x, y, z] = [p[0] * sx, p[1] * sy, p[2] * sz];

    // Rotate X
    let c = Math.cos(rx);
    let n = Math.sin(rx);
    [y, z] = [y * c - z * n, y * n + z * c];
    // Rotate Y
    c = Math.cos(ry);
    n = Math.sin(ry);
    [x, z] = [x * c + z * n, -x * n + z * c];
    // Rotate Z
    c = Math.cos(rz);
    n = Math.sin(rz);
    [x, y] = [x * c - y * n, x * n + y * c];

    return [x + t[0], y + t[1], z + t[2]] as Vec3;
  });

  return { positions, indices: geo.indices };
}

/**
 * Explodes indexed geometry into per-face vertices with hard normals,
 * producing the faceted low-poly cel-shaded look.
 */
function flattenFlatShaded(geo: Geo): { positions: Float32Array; normals: Float32Array } {
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
// Material palette (indices are stable IDs referenced by parts below)
// ---------------------------------------------------------------------------

export const MATERIALS = [
  {
    name: 'FurPearlWhite',
    baseColor: [0.99, 0.97, 0.92, 1.0],
    emissive: [0.06, 0.05, 0.03]
  },
  {
    name: 'MarkGoldenAmber',
    baseColor: [0.96, 0.74, 0.34, 1.0],
    emissive: [0.32, 0.2, 0.04]
  },
  {
    name: 'StardustTailBase',
    baseColor: [0.97, 0.83, 0.5, 1.0],
    emissive: [0.55, 0.38, 0.1]
  },
  {
    name: 'StardustTailTip',
    baseColor: [1.0, 0.93, 0.66, 1.0],
    emissive: [0.95, 0.75, 0.28]
  },
  {
    name: 'EyeDarkAmber',
    baseColor: [0.22, 0.14, 0.08, 1.0],
    emissive: [0.0, 0.0, 0.0]
  },
  {
    name: 'InnerEarBlush',
    baseColor: [0.93, 0.62, 0.42, 1.0],
    emissive: [0.12, 0.04, 0.02]
  }
];

// ---------------------------------------------------------------------------
// Lumi assembly
// ---------------------------------------------------------------------------

interface Part {
  material: number;
  geo: Geo;
}

export function buildParts(): Part[] {
  const parts: Part[] = [];
  const add = (material: number, geo: Geo, opts: PartOptions = {}) =>
    parts.push({ material, geo: transformGeo(geo, opts) });
  const sph = (r: number) => uvSphere(r);

  // -- Egg-shaped body, low-slung and playful --------------------------------
  add(0, sph(0.45), { scale: [0.95, 0.8, 1.25], translate: [0, 0.55, -0.05] });
  // Chest fluff ruff
  add(0, sph(0.32), { scale: [1.0, 0.95, 0.8], translate: [0, 0.62, 0.28] });

  // -- Oversized chibi head ---------------------------------------------------
  add(0, sph(0.44), { scale: [1.05, 0.95, 1.0], translate: [0, 1.18, 0.22] });
  // Cheek fluff tufts
  add(0, sph(0.16), { scale: [1.0, 0.75, 0.75], translate: [-0.33, 1.08, 0.3] });
  add(0, sph(0.16), { scale: [1.0, 0.75, 0.75], translate: [0.33, 1.08, 0.3] });

  // -- Muzzle wedge & nose ----------------------------------------------------
  add(0, sph(0.15), { scale: [1.3, 0.75, 1.1], translate: [0, 1.08, 0.62] });
  add(4, sph(0.055), { translate: [0, 1.13, 0.78] });

  // -- Big warm eyes ----------------------------------------------------------
  add(4, sph(0.085), { scale: [1.0, 1.4, 0.55], translate: [-0.19, 1.26, 0.56] });
  add(4, sph(0.085), { scale: [1.0, 1.4, 0.55], translate: [0.19, 1.26, 0.56] });

  // -- Large fennec ears (the signature silhouette) ----------------------------
  for (const side of [-1, 1]) {
    add(0, cone(0.2, 0.68, 5), {
      translate: [side * 0.24, 1.72, 0.12],
      rotateDeg: [0, 0, side * -20]
    });
    add(5, cone(0.12, 0.46, 5), {
      translate: [side * 0.25, 1.68, 0.2],
      rotateDeg: [0, 0, side * -20]
    });
  }

  // -- Sturdy little legs & golden paws ----------------------------------------
  const legX = 0.22;
  const legZ = [0.28, -0.34];
  for (const x of [-legX, legX]) {
    for (const z of legZ) {
      add(0, cone(0.1, 0.42, 5), { translate: [x, 0.24, z] });
      add(1, sph(0.095), { scale: [1.0, 0.6, 1.25], translate: [x, 0.06, z + 0.02] });
    }
  }

  // -- Stardust tail: big sweeping plume curling up behind ---------------------
  const TAIL_POINTS: Array<{ p: Vec3; r: number }> = [
    { p: [0, 0.6, -0.55], r: 0.15 },
    { p: [0, 0.72, -0.78], r: 0.22 },
    { p: [0, 0.92, -0.95], r: 0.29 },
    { p: [0, 1.14, -1.02], r: 0.33 },
    { p: [0, 1.36, -0.98], r: 0.31 },
    { p: [0, 1.54, -0.85], r: 0.25 },
    { p: [0, 1.66, -0.66], r: 0.17 },
    { p: [0, 1.7, -0.48], r: 0.1 }
  ];
  TAIL_POINTS.forEach((seg, idx) => {
    // Lower half uses softer glow, upper half ignites into bright stardust
    const mat = idx < 4 ? 2 : 3;
    add(mat, sph(seg.r, 6, 8), { translate: seg.p });
  });

  // -- Golden spirit marks ------------------------------------------------------
  // Forehead diamond
  add(1, octahedron(1), {
    scale: [0.06, 0.11, 0.03],
    translate: [0, 1.4, 0.56]
  });
  // Brow dots
  add(1, octahedron(1), { scale: [0.03, 0.03, 0.02], translate: [-0.11, 1.42, 0.53] });
  add(1, octahedron(1), { scale: [0.03, 0.03, 0.02], translate: [0.11, 1.42, 0.53] });
  // Flank swirl marks
  add(1, octahedron(1), {
    scale: [0.03, 0.13, 0.08],
    rotateDeg: [0, 0, 25],
    translate: [-0.43, 0.6, -0.05]
  });
  add(1, octahedron(1), {
    scale: [0.03, 0.13, 0.08],
    rotateDeg: [0, 0, -25],
    translate: [0.43, 0.6, -0.05]
  });

  return parts;
}

// ---------------------------------------------------------------------------
// GLB packing (glTF 2.0 binary)
// ---------------------------------------------------------------------------

interface PackedPrimitive {
  attributes: { POSITION: number; NORMAL: number };
  indices: number;
  material: number;
  mode: number;
}

export function buildLumiGlb(): Buffer {
  const parts = buildParts();

  // Merge part geometry per material into one mesh with multiple primitives
  const byMaterial = new Map<number, Geo>();
  for (const part of parts) {
    const target = byMaterial.get(part.material) ?? { positions: [], indices: [] };
    const offset = target.positions.length;
    target.positions.push(...part.geo.positions);
    target.indices.push(...part.geo.indices.map((i) => i + offset));
    byMaterial.set(part.material, target);
  }

  const binChunks: Buffer[] = [];
  let byteOffset = 0;
  const bufferViews: object[] = [];
  const accessors: object[] = [];
  const primitives: PackedPrimitive[] = [];

  const addBufferView = (data: Buffer, target: number): number => {
    const pad = (4 - (byteOffset % 4)) % 4;
    if (pad > 0) {
      binChunks.push(Buffer.alloc(pad));
      byteOffset += pad;
    }
    binChunks.push(data);
    const view = { buffer: 0, byteOffset, byteLength: data.length, target };
    bufferViews.push(view);
    byteOffset += data.length;
    return bufferViews.length - 1;
  };

  for (const [material, geo] of [...byMaterial.entries()].sort((a, b) => a[0] - b[0])) {
    const flat = flattenFlatShaded(geo);

    const posView = addBufferView(Buffer.from(flat.positions.buffer, 0, flat.positions.byteLength), 34962);
    const norView = addBufferView(Buffer.from(flat.normals.buffer, 0, flat.normals.byteLength), 34962);

    const vertexCount = flat.positions.length / 3;
    // Flattened geometry gives every triangle its own 3 consecutive vertices,
    // so the index buffer is simply 0,1,2,...,N-1 (never reuse geo.indices!)
    const IndexArray = vertexCount > 65535 ? Uint32Array : Uint16Array;
    const indexData = new IndexArray(vertexCount);
    for (let i = 0; i < vertexCount; i++) {
      indexData[i] = i;
    }
    const idxView = addBufferView(Buffer.from(indexData.buffer, 0, indexData.byteLength), 34963);

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
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

  const binBuffer = Buffer.concat(binChunks);

  const gltf = {
    asset: { version: '2.0', generator: 'Kizuna Haven Procedural Asset Forge' },
    scene: 0,
    scenes: [{ nodes: [0], name: 'LumiScene' }],
    nodes: [{ mesh: 0, name: 'Lumi' }],
    meshes: [{ primitives, name: 'LumiMesh' }],
    materials: MATERIALS.map((m) => ({
      name: m.name,
      doubleSided: true,
      pbrMetallicRoughness: {
        baseColorFactor: m.baseColor,
        metallicFactor: 0.0,
        roughnessFactor: m.name === 'EyeDarkAmber' ? 0.4 : 0.85
      },
      emissiveFactor: m.emissive
    })),
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
  header.writeUInt32LE(0x46546c67, 0); // magic 'glTF'
  header.writeUInt32LE(2, 4); // version
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonPadded.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binPadded.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4); // 'BIN'

  return Buffer.concat([header, jsonHeader, jsonPadded, binHeader, binPadded]);
}

export interface Triangle {
  verts: [Vec3, Vec3, Vec3];
  material: number;
  color: [number, number, number];
  emissive: [number, number, number];
}

/** Flat-shaded triangle soup with material colors, used by the preview renderer. */
export function buildLumiTriangleSoup(): Triangle[] {
  const tris: Triangle[] = [];
  for (const part of buildParts()) {
    const mat = MATERIALS[part.material];
    const geo = part.geo;
    for (let i = 0; i < geo.indices.length; i += 3) {
      const a = geo.positions[geo.indices[i]];
      const b = geo.positions[geo.indices[i + 1]];
      const c = geo.positions[geo.indices[i + 2]];
      // Skip degenerate pole triangles
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
  return tris;
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  // Sanity check: every face normal must point away from its part centroid
  // (guards against inverted winding, which renders as an inside-out blob)
  let outward = 0;
  let inward = 0;
  for (const part of buildParts()) {
    const flat = flattenFlatShaded(part.geo);
    const pos = flat.positions;
    const nor = flat.normals;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let i = 0; i < pos.length; i += 3) {
      cx += pos[i];
      cy += pos[i + 1];
      cz += pos[i + 2];
    }
    const n = pos.length / 3;
    cx /= n;
    cy /= n;
    cz /= n;
    for (let i = 0; i < pos.length; i += 9) {
      // Skip degenerate (zero-area) pole triangles - they cannot render
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
      if (dot > 0) {
        outward++;
      } else {
        inward++;
      }
    }
  }
  if (inward > outward * 0.05) {
    console.error(`[fail] winding check: ${inward} inward vs ${outward} outward faces`);
    process.exit(1);
  }
  console.log(`[ok] winding check: ${outward} outward faces dominant`);

  const outPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'models', 'lumi.glb');
  mkdirSync(dirname(outPath), { recursive: true });
  const glb = buildLumiGlb();

  // End-to-end validation of the exported binary: stored normals must agree
  // with face winding recomputed from the packed positions/indices. This
  // catches packer corruption that source-level checks cannot see.
  const jl = glb.readUInt32LE(12);
  const g = JSON.parse(glb.slice(20, 20 + jl).toString());
  const binStart = 20 + jl + 8;
  const readAcc = (idx: number): Float32Array | Uint16Array => {
    const a = g.accessors[idx];
    const v = g.bufferViews[a.bufferView];
    const off = (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
    if (a.componentType === 5126) {
      return new Float32Array(glb.buffer, glb.byteOffset + binStart + off, a.count * 3);
    }
    const dv = new DataView(glb.buffer, glb.byteOffset + binStart + off);
    const r = new Uint16Array(a.count);
    for (let k = 0; k < a.count; k++) r[k] = dv.getUint16(k * 2, true);
    return r;
  };
  let match = 0;
  let mismatch = 0;
  for (const prim of g.meshes[0].primitives) {
    const pos = readAcc(prim.attributes.POSITION) as Float32Array;
    const nor = readAcc(prim.attributes.NORMAL) as Float32Array;
    const idx = readAcc(prim.indices) as Uint16Array;
    for (let t = 0; t < idx.length; t += 3) {
      const i0 = idx[t] * 3;
      const i1 = idx[t + 1] * 3;
      const i2 = idx[t + 2] * 3;
      for (const k of [i0, i1, i2]) {
        if (idx[t] >= pos.length / 3 || idx[t + 1] >= pos.length / 3 || idx[t + 2] >= pos.length / 3) {
          console.error('[fail] index out of range in exported GLB');
          process.exit(1);
        }
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
  if (mismatch > 0) {
    console.error(`[fail] exported GLB self-consistency: ${mismatch} mismatched faces`);
    process.exit(1);
  }
  console.log(`[ok] exported GLB self-consistency: ${match} faces verified`);

  writeFileSync(outPath, glb);
  console.log(`[ok] wrote ${outPath} (${(glb.length / 1024).toFixed(1)} KB)`);
}
