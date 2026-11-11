'use client'

import { useRef, type CSSProperties } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from '@/lib/gsap'
import { brushWrite } from '@/lib/motion'
import { whenRevealed } from '@/lib/curtain'

interface Props {
  text: string
  className?: string
  style?: CSSProperties
  dark?: boolean
  /** view: writes on when scrolled into view; enter: after the curtain reveal; none: parent drives it */
  mode?: 'view' | 'enter' | 'none'
  delay?: number
  /** optional rotation in degrees (default -6 from the .brush class) */
  rotate?: number
}

/** Brush script overlay, rotated, written on block by block. Never wraps, never clipped once written. Decorative: aria-hidden. */
export default function Brush({ text, className = '', style, dark, mode = 'view', delay = 0, rotate }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const words = text.split(/\s+/).filter(Boolean)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || mode === 'none' || prefersReduced()) return
      let alive = true
      let st: ScrollTrigger | undefined
      let tw: gsap.core.Tween | gsap.core.Timeline | undefined
      if (mode === 'enter') {
        whenRevealed().then(() => {
          if (alive) tw = brushWrite(el, { delay: 0.45 + delay })
        })
      } else {
        st = ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => (tw = brushWrite(el, { delay })) })
      }
      return () => {
        alive = false
        st?.kill()
        tw?.kill()
        gsap.set(el.querySelectorAll('.split-block'), { clearProps: 'clipPath' })
      }
    },
    { dependencies: [text, mode] },
  )

  const s = rotate === undefined ? style : { ...style, transform: `rotate(${rotate}deg)` }

  return (
    <span ref={ref} className={`brush ${dark ? 'brush--dark' : ''} ${className}`} style={s} aria-hidden="true">
      {words.map((w, i) => (
        <span key={i} className="split-block">
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}
