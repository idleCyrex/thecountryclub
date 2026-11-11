'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { media, mediaItem, poster, srcSet } from '@/lib/media'
import { DIMS } from '@/content/media-dims'
import { prefersReduced } from '@/lib/gsap'
import { preload } from 'react-dom'
import { whenRevealed } from '@/lib/curtain'

function setPoster(v: HTMLVideoElement) {
  if (!v.getAttribute('poster') && v.dataset.poster) v.poster = v.dataset.poster
}

function start(v: HTMLVideoElement) {
  if (prefersReduced()) return
  if (v.preload === 'none') v.preload = 'auto'
  v.play().catch(() => {})
}

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
    let alive = true
    if (visible.current && active && !prefersReduced()) {
      whenRevealed().then(() => {
        if (alive && visible.current && activeRef.current) start(v)
      })
    } else if (!v.paused) v.pause()
    return () => {
      alive = false
    }
  }, [active])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    let alive = true
    const posterIo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) whenRevealed().then(() => alive && setPoster(v))
      },
      { rootMargin: '600px 0px' },
    )
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting
        if (e.isIntersecting && activeRef.current && !prefersReduced()) {
          whenRevealed().then(() => {
            if (alive && visible.current && activeRef.current) start(v)
          })
        } else if (!v.paused) v.pause()
      },
      { rootMargin: '150px 0px' },
    )
    posterIo.observe(v)
    io.observe(v)
    return () => {
      alive = false
      posterIo.disconnect()
      io.disconnect()
    }
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

  const posterUrl = poster(k, { w: Math.min(w, 1400) })
  if (priority && posterUrl) preload(posterUrl, { as: 'image', fetchPriority: 'high' })

  return (
    <video
      ref={ref}
      className={cls}
      style={style}
      poster={priority ? posterUrl : undefined}
      data-poster={priority ? undefined : posterUrl || undefined}
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
