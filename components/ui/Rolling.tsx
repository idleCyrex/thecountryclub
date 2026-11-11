'use client'

import { useRef, type CSSProperties, type ElementType } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from '@/lib/gsap'
import { initRolling, killRolling, roll, rollEvery, rollingHTML } from '@/lib/motion'
import { whenRevealed } from '@/lib/curtain'

type Mode = 'enter' | 'view' | 'none'

interface Props {
  text: string
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** enter: rolls in once the page is revealed; view: rolls in when scrolled into view; none: parent drives it */
  mode?: Mode
  delay?: number
  /** optional: keep re-rolling every N seconds while on screen (enter/view modes) */
  every?: number
  /** optional: words to cycle through when `every` is set (defaults to re-rolling `text`) */
  words?: string[]
}

/**
 * Split-flap title. Two stacked copies of the word; each char of the outgoing copy squashes up while the
 * same char of the incoming copy grows from the baseline, staggered. The word lives in aria-label on the
 * wrapper, both animated copies are aria-hidden. Static under reduced motion.
 */
export default function Rolling({ text, as: Tag = 'h2', className = '', style, mode = 'view', delay = 0, every, words }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || mode === 'none' || prefersReduced()) return
      let alive = true
      let st: ScrollTrigger | undefined
      let loop: ScrollTrigger | undefined
      let stop: (() => void) | undefined
      let call: gsap.core.Tween | undefined

      initRolling(el, '')
      const start = () => {
        if (!alive) return
        roll(el)
        if (every && every > 0) {
          loop = ScrollTrigger.create({
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            onToggle(self) {
              stop?.()
              stop = self.isActive ? rollEvery(el, { every, words }) : undefined
            },
          })
        }
      }

      // fonts first, so the first roll never runs on fallback metrics
      const fontsReady = document.fonts?.ready ?? Promise.resolve()
      fontsReady.then(() => {
        if (!alive) return
        if (mode === 'enter') {
          whenRevealed().then(() => {
            if (alive) call = gsap.delayedCall(delay, start)
          })
        } else {
          st = ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => {
              call = gsap.delayedCall(delay, start)
            },
          })
        }
      })

      return () => {
        alive = false
        st?.kill()
        loop?.kill()
        stop?.()
        call?.kill()
        killRolling(el)
      }
    },
    { dependencies: [text, mode, every, words?.join('|')], revertOnUpdate: true },
  )

  return (
    <Tag
      ref={ref}
      className={`display rolling ${className}`}
      style={style}
      aria-label={text}
      data-enter={mode === 'none' ? undefined : ''}
      dangerouslySetInnerHTML={{ __html: rollingHTML(text) }}
    />
  )
}
