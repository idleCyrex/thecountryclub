import type { Metadata } from 'next'

// branded 1200x630 share cards in public/og (logo + page title over the page photo)
const SHARE = new Set(['/club-fitness', '/classes', '/tennis', '/pool', '/spa', '/team', '/gallery', '/contact'])

export function pageMeta(title: string, description: string, path: string, _image = 'aerial-club'): Metadata {
  const url = SHARE.has(path) ? `/og${path}.jpg` : '/og.jpg'
  const images = [{ url, width: 1200, height: 630, alt: `${title} | The Country Club at Port de Plaisance` }]
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images },
    twitter: { card: 'summary_large_image', title, description, images },
  }
}
