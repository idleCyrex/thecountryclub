import mongoose from 'mongoose'

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
const g = globalThis as unknown as { __mongoose?: Cache }
const cache: Cache = g.__mongoose ?? (g.__mongoose = { conn: null, promise: null })

export const hasDb = () => !!process.env.MONGODB_URI

export async function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not configured')
  if (cache.conn) return cache.conn
  cache.promise ??= mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 5000 })
  try {
    cache.conn = await cache.promise
  } catch (e) {
    cache.promise = null
    throw e
  }
  return cache.conn
}
