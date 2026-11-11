'use client'

import { useEffect, useState, type RefObject } from 'react'
import { ScrollTrigger } from './gsap'
import { whenRevealed } from './curtain'

let queued = 0

/** Re-measure every trigger once after lazily created ones (a new pin pushes everything below it down). */
export function refreshSoon() {
  if (queued || typeof window === 'undefined') return
  queued = requestAnimationFrame(() => {
    queued = 0
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
  })
}

type Idle = (cb: () => void, opts?: { timeout: number }) => number

/**
 * True once `ref` comes within `margin` of the viewport and the first-load preloader has lifted.
 * Gate a below-the-fold section's GSAP setup on it so that work stays out of the initial load.
 * After building ScrollTriggers behind this gate, call refreshSoon().
 */
export function useNear(ref: RefObject<Element | null>, margin = '150% 0px') {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    let alive = true
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        whenRevealed().then(() => {
          if (!alive) return
          const idle: Idle = (window as unknown as { requestIdleCallback?: Idle }).requestIdleCallback ?? ((cb) => window.setTimeout(cb, 1))
          idle(() => alive && setNear(true), { timeout: 500 })
        })
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => {
      alive = false
      io.disconnect()
    }
  }, [ref, margin, near])
  return near
}
