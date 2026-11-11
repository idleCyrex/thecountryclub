'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { media, mediaItem, poster, srcSet } from '@/lib/media'
import { DIMS } from '@/content/media-dims'
import { prefersReduced } from '@/lib/gsap'

interface Props {
  k: string
  className?: string
  style?: CSSProperties
  /** request width for images / posters */
  w?: number
  sizes?: string
  /** when false the video stays paused even if visible (e.g. inactive hero clip) */
  active?: boolean
  priority?: boolean
  alt?: string
}

/**
 * Image or muted looping video for a manifest key. Videos lazy-start via IntersectionObserver,
 * never autoplay under reduced motion, and fall back to the poster photo if the file is missing.
 */
export default function MediaFill({ k, className = '', style, w = 1600, sizes = '100vw', active = true, priority, alt }: Props) {
  const item = mediaItem(k)
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)
  const visible = useRef(false)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
    const v = ref.current
    if (!v) return
    if (visible.current && active && !prefersReduced()) {
      if (v.preload === 'none') v.preload = 'auto'
      v.play().catch(() => {})
    } else if (!v.paused) v.pause()
  }, [active])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting
        if (e.isIntersecting && activeRef.current && !prefersReduced()) {
          if (v.preload === 'none') v.preload = 'auto'
          v.play().catch(() => {})
        } else if (!v.paused) v.pause()
      },
      { rootMargin: '150px 0px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [failed])

  if (!item) return null
  const label = alt ?? item.alt
  const cls = `media-fill ${className}`

  if (item.kind === 'image' || failed) {
    const key = item.kind === 'image' ? k : item.poster
    if (!key) return <span className={`${cls} media-fill--empty`} style={style} />
    const dims = DIMS[key]
    return (
      <img
        className={cls}
        style={style}
        width={dims?.[0]}
        height={dims?.[1]}
        src={media(key, { w })}
        srcSet={srcSet(key)}
        sizes={sizes}
        alt={label}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
      />
    )
  }

  return (
    <video
      ref={ref}
      className={cls}
      style={style}
      poster={poster(k, { w: Math.min(w, 1400) })}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    >
      <source media="(max-width: 743px)" src={media(k, { w: 960 })} type="video/mp4" />
      <source src={media(k)} type="video/mp4" onError={() => setFailed(true)} />
    </video>
  )
}
