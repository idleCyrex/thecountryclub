'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap'
import { setLenis } from '@/lib/scroll'

/** Lenis driven by the GSAP ticker, wired to ScrollTrigger (recipe a). Off under reduced motion. */
export default function SmoothScroll() {
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)

    if (prefersReduced()) return () => window.removeEventListener('load', refresh)

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])
  return null
}
