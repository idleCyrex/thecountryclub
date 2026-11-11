import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Answer engines are welcome: search and assistant crawlers are named explicitly so a later blanket rule can't shut them out.
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: AI_BOTS, allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
