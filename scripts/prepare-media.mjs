// Writes web-optimised copies of every manifest item into public/media (local fallback).
// Images: <key>.webp (max 2200w) + -1400 + -800. Videos: <key>.mp4 (1280w, crf 28) + <key>-sm.mp4 (960w, crf 30), muted, max 20s.
import { stat, mkdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import sharp from 'sharp'
import { loadTs, ROOT } from './load-ts.mjs'

const { MEDIA } = await loadTs('content/media.ts')
const SRC = path.join(ROOT, '_media')
const OUT = path.join(ROOT, 'public', 'media')
await mkdir(OUT, { recursive: true })

const exists = async (p) => { try { return await stat(p) } catch { return null } }
const force = process.argv.includes('--force')
let done = 0, skipped = 0
const missing = []

const encode = (src, dest, width, crf) => {
  const r = spawnSync('ffmpeg', [
    '-y', '-v', 'error', '-i', src, '-t', '20',
    '-vf', `scale='min(${width},iw)':-2`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-an', '-movflags', '+faststart', dest,
  ], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`ffmpeg failed for ${src}`)
}

const fresh = (o, s) => o && o.mtimeMs >= s.mtimeMs

for (const [key, item] of Object.entries(MEDIA)) {
  const src = path.join(SRC, item.file)
  const s = await exists(src)
  if (!s) { missing.push(`${key} -> _media/${item.file}`); continue }

  if (item.kind === 'video') {
    const big = path.join(OUT, `${key}.mp4`)
    const sm = path.join(OUT, `${key}-sm.mp4`)
    if (!force && fresh(await exists(big), s) && fresh(await exists(sm), s)) { skipped++; continue }
    encode(src, big, 1280, 28)
    encode(src, sm, 960, 30)
    done++
    continue
  }

  const big = path.join(OUT, `${key}.webp`)
  const mid = path.join(OUT, `${key}-1400.webp`)
  const small = path.join(OUT, `${key}-800.webp`)
  if (!force && fresh(await exists(big), s) && fresh(await exists(mid), s) && fresh(await exists(small), s)) { skipped++; continue }
  const img = sharp(src, { failOn: 'none' }).rotate()
  await img.clone().resize({ width: 2200, withoutEnlargement: true }).webp({ quality: 80 }).toFile(big)
  await img.clone().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 78 }).toFile(mid)
  await img.clone().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 }).toFile(small)
  done++
}

console.log(`prepare-media: ${done} written, ${skipped} up to date, ${missing.length} missing`)
if (missing.length) console.warn('missing source files (components fall back to posters):\n  ' + missing.join('\n  '))
