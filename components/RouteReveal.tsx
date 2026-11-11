'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ScrollTrigger } from '@/lib/gsap'
import { isCovered, reveal } from '@/lib/curtain'
import { scrollTop } from '@/lib/scroll'
import { releaseNav } from './ui/TransitionLink'

/** Mounted inside app/template.tsx: runs on every route. Scrolls to the top, refreshes triggers, lifts the curtain. */
export default function RouteReveal() {
  const pathname = usePathname()
  useEffect(() => {
    // every page change and refresh starts at the top (unless the URL points at an anchor)
    if (!window.location.hash) scrollTop()
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    if (isCovered()) reveal().then(releaseNav)
    else releaseNav()
    return () => cancelAnimationFrame(id)
  }, [pathname])
  return null
}
