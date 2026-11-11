'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReduced } from '@/lib/gsap'
import './spa.css'
import { drawOnScroll } from '@/lib/draw'
import MediaFill from '../ui/MediaFill'
import TransitionLink from '../ui/TransitionLink'
import { media } from '@/lib/media'
import { useNear } from '@/lib/lazy'

export default function SpaProduct({ copy, hours }: { copy: string; hours: string }) {
  const root = useRef<HTMLElement>(null)
  const near = useNear(root)

  useGSAP(
    () => {
      const el = root.current
      if (!near || !el || prefersReduced()) return
      // reads first: transform parse for every tweened element, then the frame's stroke length
      gsap.utils.toArray<Element>('.spa-band__h i, .spa-band__pw, .spa-band__chip', el).forEach((t) => gsap.getProperty(t, 'y'))
      drawOnScroll('.spa-band__frame rect', { trigger: '.spa-band__pw', start: 'top 85%', end: 'center 45%', scrub: 1 })
      gsap.fromTo('.spa-band__h i', { yPercent: 125 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out', onComplete: () => { gsap.set('.spa-band__h span', { overflow: 'visible' }) }, scrollTrigger: { trigger: '.spa-band__h', start: 'top 85%', once: true } })
      gsap.fromTo(
        '.spa-band__pw',
        { yPercent: 12 },
        { yPercent: -8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 } },
      )
      gsap.fromTo(
        '.spa-band__chip',
        { yPercent: 60, rotation: -14 },
        { yPercent: -60, rotation: 14, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } },
      )
    },
    { scope: root, dependencies: [near] },
  )

  return (
    <section className="spa-band" data-theme="dark" ref={root}>
      <div className="spa-band__grid">
        <div className="spa-band__text">
          <div className="spa-band__title">
            <h2 className="display spa-band__h" aria-label="Impulse Spa">
              <span aria-hidden="true"><i>IMPULSE</i></span>
              <span aria-hidden="true"><i>SPA</i></span>
            </h2>
          </div>
          <p className="body-caps">{copy}</p>
          <p className="spa-band__hours">{hours}</p>
          <div className="spa-band__actions">
            <TransitionLink className="btn" href="/contact?interest=spa">
              Book a treatment
            </TransitionLink>
            <TransitionLink className="btn btn--outline" href="/spa">
              Spa menu
            </TransitionLink>
          </div>
        </div>
        <div className="spa-band__media">
          <div className="spa-band__pw">
            <div className="spa-band__panel">
              <MediaFill k="v-spa" w={1000} sizes="(max-width: 743px) 80vw, 34vw" />
            </div>
            <svg className="spa-band__frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect x="0" y="0" width="100" height="100" pathLength={1} vectorEffect="non-scaling-stroke" />
            </svg>
            <img className="spa-band__chip" src={media('spa-logo', { w: 800 })} alt="Impulse Spa Clinic logo" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  )
}
