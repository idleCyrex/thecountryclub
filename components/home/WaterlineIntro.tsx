'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReduced } from '@/lib/gsap'
import { brushWrite, waterline } from '@/lib/motion'
import Brush from '../ui/Brush'
import Waterline from '../ui/Waterline'
import './intro.css'
import { drawOnScroll } from '@/lib/draw'

const LINES = ['LIVE', 'THE CLUB', 'LIFE']

export default function WaterlineIntro({ copy }: { copy: string }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      const wl = el?.querySelector<HTMLElement>('.wl')
      if (!el || !wl) return
      const reduced = prefersReduced()
      const brush = el.querySelector<HTMLElement>('.intro__brush')
      const blocks = Array.from(el.querySelectorAll<HTMLElement>('.intro__brush .split-block'))
      const fit = () => {
        if (!brush) return
        brush.style.fontSize = ''
        const max = wl.offsetWidth * 0.5
        const w = brush.offsetWidth
        if (w > max) brush.style.fontSize = `${(parseFloat(getComputedStyle(brush).fontSize) * max) / w}px`
      }
      const w = waterline(wl, { animate: !reduced, low: !reduced })
      window.addEventListener('resize', fit)
      fit()
      document.fonts?.ready.then(fit)
      const off = () => {
        window.removeEventListener('resize', fit)
        w.kill()
      }
      if (reduced) {
        gsap.set(blocks, { clearProps: 'clipPath', visibility: 'visible' })
        return off
      }

      // the water rises through the lines as they scroll up the screen, then the brush writes across the waterline
      const tl = gsap.timeline({
        scrollTrigger: { trigger: wl, start: 'top 72%', end: 'clamp(bottom 62%)', scrub: 0.6 },
      })
      w.rise(tl, 0, 2)
      tl.add(brushWrite(brush, { duration: 0.6, stagger: 0.25 }), 1.5)
      blocks.forEach((b, i) => tl.set(b, { visibility: 'visible' }, 1.5 + i * 0.25))
      tl.fromTo('.intro__copy', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.9)

      drawOnScroll('.wander path', { trigger: el, start: 'top 70%', end: 'bottom 40%', scrub: 0.6 })
      return off
    },
    { scope: root },
  )

  return (
    <section className="intro" data-theme="dark" ref={root}>
      <svg className="wander" viewBox="0 0 1440 3200" preserveAspectRatio="none" aria-hidden="true">
        <path
          pathLength={1}
          d="M-20 180 C 420 -20, 980 420, 720 860 S 140 1380, 620 1720 S 1560 2140, 1080 2560 S 260 3000, 760 3240"
        />
      </svg>
      <div className="intro__inner">
        <Waterline lines={LINES} label="Live the club life" drive={false} className="intro__wl">
          <Brush text="Caribbean's finest" mode="none" className="brush-over intro__brush" />
        </Waterline>
        <p className="body-caps intro__copy">{copy}</p>
      </div>
    </section>
  )
}
