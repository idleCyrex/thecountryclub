'use client'

import { useRef, type CSSProperties } from 'react'
import { gsap, useGSAP, prefersReduced } from '@/lib/gsap'
import { brushWrite } from '@/lib/motion'
import { useNear } from '@/lib/lazy'
import Brush from './ui/Brush'
import Marquee from './ui/Marquee'

interface Props {
  word: string
  brush?: string
  theme?: 'yellow' | 'dark'
  caption?: string
}

/** Type section: the word as two bold tickers running in opposite directions, a brush line over them, a caption below. */
export default function AxisWord({ word, brush, theme = 'yellow', caption }: Props) {
  const root = useRef<HTMLElement>(null)
  const near = useNear(root)

  useGSAP(
    () => {
      const el = root.current
      if (!near || !el || prefersReduced()) return
      gsap.utils.toArray<Element>('.axis__ticker, .axis__caption', el).forEach((t) => gsap.getProperty(t, 'y'))
      // two bold tickers run past and the brush writes on as the section comes into view
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 70%', once: true } })
      tl.fromTo('.axis__ticker', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0)
      if (brush) tl.add(brushWrite(el.querySelector('.axis__brush'), { duration: 0.45, stagger: 0.15 }), 0.35)
      if (caption) tl.fromTo('.axis__caption', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 0.6)
    },
    { scope: root, dependencies: [near] },
  )

  return (
    <section className="axis" data-theme={theme} ref={root}>
      <div className="axis__pin">
        <div className="axis__stack">
          <h2 className="display axis__word" style={{ '--n': word.length } as CSSProperties}>
            {word}
          </h2>
          <div className="axis__ticker" aria-hidden="true">
            <Marquee text={word} repeat={3} duration={12} className="axis__row" />
            <Marquee text={word} repeat={3} duration={15} reverse className="axis__row axis__row--b" />
          </div>
          {brush && <Brush text={brush} mode="none" className="brush-over axis__brush" />}
        </div>
        {caption && <p className="body-caps axis__caption">{caption}</p>}
      </div>
    </section>
  )
}
