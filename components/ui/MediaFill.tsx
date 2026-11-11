'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { media, mediaItem, poster, srcSet } from '@/lib/media'
import { DIMS } from '@/content/media-dims'
import { prefersReduced } from '@/lib/gsap'
import { preload } from 'react-dom'
import { whenRevealed } from '@/lib/curtain'

const SMALL = '(max-width: 743px)'

function setPoster(v: HTMLVideoElement) {
  if (!v.getAttribute('poster') && v.dataset.poster) v.poster = v.dataset.poster
}

/** One file per device, chosen at load time: two <source media> elements can fetch both. */
function setSource(v: HTMLVideoElement) {
  const { src, srcSm } = v.dataset
  if (!src || v.getAttribute('src')) return false
  v.src = srcSm && window.matchMedia(SMALL).matches ? srcSm : src
  return true
}

const FADE_MS = 1700

function start(v: HTMLVideoElement) {
  if (prefersReduced()) return
  if (v.preload === 'none') v.preload = 'auto'
  setSource(v)
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
  /** buffer the video ahead of time (paused) so switching to it is instant */
  warm?: boolean
  priority?: boolean
  /** video: paint the poster as a responsive <img> under the video (parent must be positioned) */
  posterImg?: boolean
  alt?: string
}

/**
 * Image or muted looping video for a manifest key. Videos lazy-start via IntersectionObserver,
 * never autoplay under reduced motion, and fall back to the poster photo if the file is missing.
 */
export default function MediaFill({ k, className = '', style, w = 1600, sizes = '100vw', active = true, warm, priority, posterImg, alt }: Props) {
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
    let fade = 0
    if (visible.current && active && !prefersReduced()) {
      whenRevealed().then(() => {
        if (alive && visible.current && activeRef.current) start(v)
      })
    } else if (!v.paused) {
      // keep the outgoing clip moving while it cross-fades out
      if (visible.current && !active) fade = window.setTimeout(() => !activeRef.current && v.pause(), FADE_MS)
      else v.pause()
    }
    return () => {
      alive = false
      window.clearTimeout(fade)
    }
  }, [active])

  useEffect(() => {
    const v = ref.current
    if (!v || !warm || prefersReduced()) return
    let alive = true
    whenRevealed().then(() => {
      if (!alive) return
      setPoster(v)
      if (v.preload === 'none') v.preload = 'auto'
      if (!setSource(v) && v.readyState === 0 && v.networkState !== HTMLMediaElement.NETWORK_LOADING) v.load()
    })
    return () => {
      alive = false
    }
  }, [warm])

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
  const stillKey = item.kind === 'image' ? k : item.poster
  const still = (extra?: CSSProperties, decorative = false) => {
    if (!stillKey) return <span className={`${cls} media-fill--empty`} style={style} />
    const dims = DIMS[stillKey]
    return (
      <img
        className={cls}
        style={extra ? { ...style, ...extra } : style}
        width={dims?.[0]}
        height={dims?.[1]}
        src={media(stillKey, { w })}
        srcSet={srcSet(stillKey)}
        sizes={sizes}
        alt={decorative ? '' : label}
        aria-hidden={decorative || undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
      />
    )
  }

  if (item.kind === 'image' || failed) return still()

  const usePosterImg = posterImg && !!stillKey
  const posterUrl = poster(k, { w: Math.min(w, 1400) })
  if (priority && usePosterImg) {
    const set = srcSet(stillKey!)
    preload(media(stillKey!, { w: Math.min(w, 1400) }), { as: 'image', fetchPriority: 'high', imageSrcSet: set, imageSizes: sizes })
  } else if (priority && posterUrl) preload(posterUrl, { as: 'image', fetchPriority: 'high' })

  const video = (
    <video
      ref={ref}
      className={cls}
      style={usePosterImg ? { ...style, position: 'relative' } : style}
      poster={priority && !usePosterImg ? posterUrl : undefined}
      data-poster={priority || usePosterImg ? undefined : posterUrl || undefined}
      data-src={media(k)}
      data-src-sm={media(k, { w: 960 })}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      onError={() => setFailed(true)}
    />
  )
  if (!usePosterImg) return video
  return (
    <>
      {still({ position: 'absolute', inset: 0 }, true)}
      {video}
    </>
  )
}
