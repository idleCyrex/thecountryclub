import type { MetadataRoute } from 'next'
import { SETTINGS } from '@/content/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SETTINGS.name,
    short_name: SETTINGS.shortName,
    description: 'Gym, classes, tennis, pool and the Impulse Spa at Port de Plaisance, St. Maarten.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06141A',
    theme_color: '#06141A',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
