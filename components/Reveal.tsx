'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, useGSAP, prefersReduced } from '@/lib/gsap'
import { useNear } from '@/lib/lazy'

/** Children with [data-r] rise in as they enter the viewport. */
export default function Reveal({ as: Tag = 'div', className = '', children }: { as?: ElementType; className?: string; children: ReactNode }) {
  const root = useRef<HTMLElement>(null)
  const near = useNear(root)
  useGSAP(
    () => {
      const el = root.current
      if (!el || prefersReduced()) return
      const items = gsap.utils.toArray<HTMLElement>('[data-r]', el)
      const targets = items.length ? items : [el]
      if (!near) {
        // hidden from hydration as before (write-only, no style reads); the tweens are built once near
        for (const t of targets) {
          t.style.opacity = '0'
          t.style.visibility = 'hidden'
        }
        return
      }
      targets.forEach((t) => gsap.getProperty(t, 'y'))
      targets.forEach((t) => {
        gsap.fromTo(
          t,
          { y: 50, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', immediateRender: false, scrollTrigger: { trigger: t, start: 'top 90%', once: true } },
        )
      })
    },
    { scope: root, dependencies: [near] },
  )
  return (
    <Tag ref={root} className={className}>
      {children}
    </Tag>
  )
}
