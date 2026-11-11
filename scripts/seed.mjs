// npm run seed
// 1. CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET) set -> upload every manifest
//    item to Cloudinary as countryclub/<key> (overwrite, resource_type auto).
// 2. MONGODB_URI set -> upsert Media docs + classes, facilities, team, spa menu, settings.
// Idempotent: everything is keyed by key/slug.
import path from 'node:path'
import { stat } from 'node:fs/promises'
import { loadTs, loadEnv, ROOT } from './load-ts.mjs'

loadEnv()
const { MEDIA } = await loadTs('content/media.ts')
const site = await loadTs('content/site.ts')

const hasCloud = !!(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET))
const uploaded = {}

if (hasCloud) {
  const { v2: cloudinary } = await import('cloudinary')
  if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }
  cloudinary.config({ secure: true })
  for (const [key, item] of Object.entries(MEDIA)) {
    const file = path.join(ROOT, '_media', item.file)
    try { await stat(file) } catch { console.warn(`skip ${key}: missing _media/${item.file}`); continue }
    const opts = {
      public_id: `countryclub/${key}`,
      asset_folder: 'countryclub',
      overwrite: true,
      resource_type: item.kind === 'video' ? 'video' : 'image',
    }
    try {
      const res = item.kind === 'video'
        ? await new Promise((ok, ko) => cloudinary.uploader.upload_large(file, { ...opts, chunk_size: 20_000_000 }, (e, r) => (e ? ko(e) : ok(r))))
        : await cloudinary.uploader.upload(file, opts)
      uploaded[key] = { publicId: res.public_id, width: res.width, height: res.height }
      console.log(`cloudinary ✓ ${key} (${res.width}x${res.height})`)
    } catch (e) {
      console.error(`cloudinary ✗ ${key}: ${e?.message ?? e}`)
    }
  }
} else {
  console.log('Cloudinary not configured: skipping uploads (site uses public/media).')
}

if (!process.env.MONGODB_URI) {
  console.log('MONGODB_URI not set: skipping database seed (site uses content/*.ts).')
  process.exit(0)
}

const mongoose = (await import('mongoose')).default
await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false })
const db = mongoose.connection.db

async function upsertAll(collection, docs, key = 'slug') {
  if (!docs.length) return
  const ops = docs.map((d) => ({ updateOne: { filter: { [key]: d[key] }, update: { $set: { ...d, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, upsert: true } }))
  const r = await db.collection(collection).bulkWrite(ops)
  console.log(`mongo ${collection}: ${r.upsertedCount} inserted, ${r.modifiedCount} updated`)
}

await upsertAll('media', Object.entries(MEDIA).map(([key, m]) => ({
  key,
  kind: m.kind,
  alt: m.alt,
  file: m.file,
  poster: m.poster ?? null,
  publicId: uploaded[key]?.publicId ?? `countryclub/${key}`,
  ...(uploaded[key] ? { width: uploaded[key].width, height: uploaded[key].height } : {}),
})), 'key')
await upsertAll('classitems', site.CLASSES)
await upsertAll('facilities', site.FACILITIES)
await upsertAll('teammembers', site.TEAM)
await upsertAll('spatreatments', site.SPA)
await upsertAll('settings', [{ key: 'site', data: site.SETTINGS, copy: site.COPY }], 'key')

await mongoose.disconnect()
console.log('seed complete')
