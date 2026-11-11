'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, useGSAP, prefersReduced } from '@/lib/gsap'

/** Children with [data-r] rise in as they enter the viewport. */
export default function Reveal({ as: Tag = 'div', className = '', children }: { as?: ElementType; className?: string; children: ReactNode }) {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (prefersReduced()) return
      const items = gsap.utils.toArray<HTMLElement>('[data-r]', root.current)
      const targets = items.length ? items : [root.current!]
      targets.forEach((t) => {
        gsap.fromTo(t, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 90%', once: true } })
      })
    },
    { scope: root },
  )
  return (
    <Tag ref={root} className={className}>
      {children}
    </Tag>
  )
}
