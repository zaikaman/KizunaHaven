/**
 * Kizuna Haven - Asset Preview Renderer
 * Software-rasterizes the procedural Lumi triangle soup into PNGs so the
 * model can be verified without a game client.
 *
 * Run: node tools/preview-lumi.ts
 * Output: models/lumi-preview.png (front / side / back contact sheet)
 *         models/lumi-side.png    (large single side view)
 * Stdout: per-material pixel coverage for the large side view
 */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { buildLumiTriangleSoup, MATERIALS, type Triangle, type Vec3 } from './generate-lumi.ts';

const FOV = 45 * (Math.PI / 180);

interface Camera {
  position: Vec3;
  target: Vec3;
}

interface Viewport {
  x: number;
  y: number;
  w: number;
  h: number;
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function norm(v: Vec3): Vec3 {
  const l = Math.hypot(...v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

/**
 * Rasterizes one camera view into the given viewport of a PNG.
 * Returns pixels drawn per material index (post z-buffer).
 */
function renderView(
  tris: Triangle[],
  cam: Camera,
  png: PNG,
  vp: Viewport,
  coverage?: Map<number, number>
): void {
  const fwd = norm(sub(cam.target, cam.position));
  const right = norm(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  const aspect = vp.w / vp.h;
  const halfH = Math.tan(FOV / 2);
  const halfW = halfH * aspect;

  const zbuf = new Float64Array(vp.w * vp.h).fill(Infinity);

  // Key light from upper-front-left in world space
  const light = norm([-0.4, 0.8, 0.6]);

  for (const tri of tris) {
    const cs = tri.verts.map((v) => {
      const d = sub(v, cam.position);
      return {
        x: d[0] * right[0] + d[1] * right[1] + d[2] * right[2],
        y: d[0] * up[0] + d[1] * up[1] + d[2] * up[2],
        z: d[0] * fwd[0] + d[1] * fwd[1] + d[2] * fwd[2]
      };
    });
    if (cs.some((p) => p.z < 0.1)) continue;

    // Screen space within viewport (flipped vertically: PNG rows grow downward)
    const ss = cs.map((p) => ({
      x: ((p.x / (p.z * halfW)) + 1) / 2 * vp.w,
      y: (1 - (p.y / (p.z * halfH))) / 2 * vp.h,
      z: p.z
    }));

    // Flat shading: ambient + lambert + emissive
    const [a, b, c] = tri.verts;
    const n = norm(cross(sub(b, a), sub(c, a)));
    const diff = Math.max(n[0] * light[0] + n[1] * light[1] + n[2] * light[2], 0);
    const shade = 0.68 + 0.42 * diff;
    const rgb = [0, 1, 2].map((k) =>
      Math.min(255, Math.round((tri.color[k] * shade + tri.emissive[k]) * 255))
    );

    const [x0, y0, x1, y1, x2, y2] = [ss[0].x, ss[0].y, ss[1].x, ss[1].y, ss[2].x, ss[2].y];
    const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
    if (Math.abs(area) < 1e-9) continue;

    const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
    const maxX = Math.min(vp.w - 1, Math.ceil(Math.max(x0, x1, x2)));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
    const maxY = Math.min(vp.h - 1, Math.ceil(Math.max(y0, y1, y2)));

    const iz0 = 1 / ss[0].z;
    const iz1 = 1 / ss[1].z;
    const iz2 = 1 / ss[2].z;

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const cx = px + 0.5;
        const cy = py + 0.5;
        const w0 = ((x1 - cx) * (y2 - cy) - (x2 - cx) * (y1 - cy)) / area;
        const w1 = ((x2 - cx) * (y0 - cy) - (x0 - cx) * (y2 - cy)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;

        const z = 1 / (w0 * iz0 + w1 * iz1 + w2 * iz2);
        const bi = py * vp.w + px;
        if (z < zbuf[bi]) {
          zbuf[bi] = z;
          const pi = ((vp.y + py) * png.width + vp.x + px) * 4;
          png.data[pi] = rgb[0];
          png.data[pi + 1] = rgb[1];
          png.data[pi + 2] = rgb[2];
          png.data[pi + 3] = 255;
          if (coverage) coverage.set(tri.material, (coverage.get(tri.material) ?? 0) + 1);
        }
      }
    }
  }
}

function twilightBackdrop(png: PNG): void {
  for (let y = 0; y < png.height; y++) {
    const t = y / png.height;
    const r = Math.round(60 + t * 90);
    const g = Math.round(50 + t * 40);
    const b = Math.round(110 + t * 60);
    for (let x = 0; x < png.width; x++) {
      const pi = (y * png.width + x) * 4;
      png.data[pi] = r;
      png.data[pi + 1] = g;
      png.data[pi + 2] = b;
      png.data[pi + 3] = 255;
    }
  }
}

function main(): void {
  const tris = buildLumiTriangleSoup();
  const center: Vec3 = [0, 0.95, -0.1];
  const dist = 4.2;
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'models');

  // Contact sheet: front / side / back
  const sheet = new PNG({ width: 480, height: 480 });
  twilightBackdrop(sheet);
  const views: Array<{ cam: Camera; label: string }> = [
    { cam: { position: [0, 1.05, dist], target: center }, label: 'front' },
    { cam: { position: [dist, 1.05, 0], target: center }, label: 'side' },
    { cam: { position: [0, 1.05, -dist], target: center }, label: 'back' }
  ];
  views.forEach((v, idx) =>
    renderView(tris, v.cam, sheet, { x: idx * 160, y: 0, w: 160, h: 480 })
  );
  const sheetPath = resolve(outDir, 'lumi-preview.png');
  writeFileSync(sheetPath, PNG.sync.write(sheet));
  console.log(`[ok] wrote ${sheetPath} (${views.map((v) => v.label).join(' / ')})`);

  // Large side view with material coverage stats
  const big = new PNG({ width: 640, height: 640 });
  twilightBackdrop(big);
  const coverage = new Map<number, number>();
  renderView(
    tris,
    { position: [dist, 1.05, 0], target: center },
    big,
    { x: 0, y: 0, w: 640, h: 640 },
    coverage
  );
  const bigPath = resolve(outDir, 'lumi-side.png');
  writeFileSync(bigPath, PNG.sync.write(big));
  console.log(`[ok] wrote ${bigPath}`);

  const totalVisible = [...coverage.values()].reduce((a, b) => a + b, 0);
  console.log('material pixel coverage (side view):');
  MATERIALS.forEach((m, i) => {
    const px = coverage.get(i) ?? 0;
    console.log(`  ${m.name.padEnd(18)} ${String(px).padStart(7)} px (${((px / (640 * 640)) * 100).toFixed(2)}%)`);
  });
  console.log(`  total visible: ${totalVisible} px`);
}

main();
