import { MEDIA, type MediaItem } from '@/content/media'

export type { MediaKey } from '@/content/media'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
const FOLDER = 'countryclub'

export interface MediaOpts {
  w?: number
  h?: number
  crop?: 'fill' | 'limit'
}

export function mediaItem(key: string): MediaItem | undefined {
  return (MEDIA as Record<string, MediaItem>)[key]
}

export const isCloudinary = () => CLOUD !== ''

/** Delivery URL for a manifest key: Cloudinary when configured, else the local copy in public/media. */
export function media(key: string, opts: MediaOpts = {}): string {
  const item = mediaItem(key)
  if (!item) return ''
  if (CLOUD) {
    if (item.kind === 'video') {
      const t = ['f_auto', 'q_auto', 'vc_auto']
      if (opts.w) t.push(`w_${opts.w}`, 'c_limit')
      return `https://res.cloudinary.com/${CLOUD}/video/upload/${t.join(',')}/${FOLDER}/${key}`
    }
    const t = ['f_auto', 'q_auto']
    if (opts.w) t.push(`w_${opts.w}`)
    if (opts.h) t.push(`h_${opts.h}`)
    t.push(`c_${opts.crop ?? (opts.h ? 'fill' : 'limit')}`)
    return `https://res.cloudinary.com/${CLOUD}/image/upload/${t.join(',')}/${FOLDER}/${key}`
  }
  if (item.kind === 'video') return opts.w && opts.w <= 960 ? `/media/${key}-sm.mp4` : `/media/${key}.mp4`
  if (opts.w && opts.w <= 900) return `/media/${key}-800.webp`
  if (opts.w && opts.w <= 1500) return `/media/${key}-1400.webp`
  return `/media/${key}.webp`
}

/** Poster image URL for a key (videos use their poster, images themselves). */
export function poster(key: string, opts: MediaOpts = {}): string {
  const item = mediaItem(key)
  if (!item) return ''
  return item.kind === 'video' ? (item.poster ? media(item.poster, opts) : '') : media(key, opts)
}

export function srcSet(key: string, widths = [640, 1200, 2000]): string | undefined {
  const item = mediaItem(key)
  if (!item || item.kind === 'video') return undefined
  if (!CLOUD) return `${media(key, { w: 800 })} 800w, ${media(key, { w: 1400 })} 1400w, ${media(key)} 2200w`
  return widths.map((w) => `${media(key, { w })} ${w}w`).join(', ')
}

export const altOf = (key: string) => mediaItem(key)?.alt ?? ''

/** next/image custom loader for Cloudinary public ids (or local paths). */
export function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!CLOUD || src.startsWith('/')) return src
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_${quality ?? 'auto'},w_${width},c_limit/${src}`
}
