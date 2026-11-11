import type { MetadataRoute } from 'next'
import { ROUTES, SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [...ROUTES.map((r) => r.href), '/privacy'].map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/privacy' ? 0.2 : 0.7,
  }))
}
