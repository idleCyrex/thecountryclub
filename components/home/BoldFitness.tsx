'use client'

import { useEffect, useId, useRef } from 'react'
import { gsap, useGSAP, prefersReduced, isSmall } from '@/lib/gsap'
import { brushWrite } from '@/lib/motion'
import { useNear, refreshSoon } from '@/lib/lazy'
import Brush from '../ui/Brush'
import MediaFill from '../ui/MediaFill'
import Balls3D from '../Balls3D'
import './boldfitness.css'

const WORD = 'STRONG'
const ZOOM_CHAR = 1 // the T: its stem becomes the window
const ZOOM_SCALE = 30

export default function BoldFitness() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const maskId = `bf-mask-${useId().replace(/:/g, '')}`
  const near = useNear(root)

  // keep the stage unpainted until it is near: its giant masked type otherwise becomes the page's LCP
  useEffect(() => {
    if (near) root.current?.classList.add('is-near')
  }, [near])

  useGSAP(
    () => {
      const el = root.current
      if (!near || !el || prefersReduced()) return
      const small = isSmall()
      const zoom = el.querySelector<HTMLElement>('.bf-zoom')!
      const twin = el.querySelector<SVGTextElement>('.bf-twin')!
      // cached so the tween's function values never read layout between writes; re-read at each refresh start
      let fs = 300
      let zh = 0
      const measure = () => {
        fs = parseFloat(getComputedStyle(twin).fontSize) || 300
        zh = zoom.clientHeight
      }
      // mobile: stretched cap height fills ~64% of the stage
      const syEnd = () => (small ? gsap.utils.clamp(2.38, 7, (zh * 0.64) / (0.711 * fs)) : 2.38)
      const syStart = () => (small ? syEnd() * 0.62 : 1.66)

      // zoom origin = a point inside the T stem of the final (stretched) word, in stage px
      const setOrigin = () => {
        try {
          const r = twin.getExtentOfChar(ZOOM_CHAR)
          const base = twin.y.baseVal[0]?.value ?? zh * 0.94
          zoom.style.setProperty('--bf-ox', `${r.x + r.width / 2}px`)
          zoom.style.setProperty('--bf-oy', `${base - 0.3 * 0.7 * fs * syEnd()}px`)
        } catch {
          /* text not laid out yet; next refresh retries */
        }
      }

      measure()
      gsap.utils.toArray<Element>('.bf-fitness, .bf-brush, .bf-col--l, .bf-col--r, .bf-cut', el).concat(zoom).forEach((t) => gsap.getProperty(t, 'x'))
      setOrigin()
      // queued ahead of the pin so this sorted refresh runs before (and supersedes) ScrollTrigger's own pin refresh
      refreshSoon()

      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.bf-stage',
            start: 'top top',
            end: small ? '+=260%' : '+=500%',
            pin: true,
            anticipatePin: small ? 1 : 0,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onRefresh: setOrigin,
            onLeave: () => {
              el.style.visibility = 'hidden'
            },
            onEnterBack: () => {
              el.style.visibility = ''
            },
            onUpdate: (self) => {
              progress.current = self.progress
            },
          },
        })
        // FITNESS: hairline, stretched, collapses onto its baseline
        .fromTo('.bf-fitness', { scaleY: 1.3 }, { scaleY: 0, duration: 2.1, ease: 'power2.in' }, 0.5)
        .add(brushWrite(el.querySelector('.bf-brush--get'), { duration: 0.5, stagger: 0.15 }), 0.35)
        .to('.bf-brush--get', { autoAlpha: 0, yPercent: -30, duration: 0.5 }, 2.2)
        // STRONG rises from below and stretches very tall
        .fromTo('.bf-strong', { '--bf-rise': 100, '--bf-sy': syStart, '--bf-wd': 60 }, { '--bf-rise': 0, '--bf-sy': syEnd, '--bf-wd': 90, duration: 2.3, ease: 'power2.out' }, 0.5)
        // letters turn into windows onto the video
        .fromTo('.bf-video', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.8 }, 2.4)
        .add(brushWrite(el.querySelector('.bf-brush--go'), { duration: 0.5, stagger: 0.15 }), 3.5)
        .to('.bf-brush--go', { autoAlpha: 0, scale: 1.4, duration: 0.4 }, 5.1)
        // zoom-through the T stem
        .fromTo(zoom, { scale: 1 }, { scale: ZOOM_SCALE, duration: 2.1, ease: 'power3.in' }, 5.1)
        .to(zoom, { autoAlpha: 0, duration: 0.3 }, 6.9)
        // three-column finale: centre clear, sides tinted gold
        .fromTo('.bf-col--l', { yPercent: 101, y: 0 }, { yPercent: 0, y: 0, duration: 0.8, ease: 'power2.out' }, 7.3)
        .fromTo('.bf-col--r', { yPercent: -101, y: 0 }, { yPercent: 0, y: 0, duration: 0.8, ease: 'power2.out' }, 7.3)
        // dark curtain rises with a curved lip and flattens as it closes
        .fromTo('.bf-cut', { yPercent: 104, y: 0, '--bf-lip': 16 }, { yPercent: 0, y: 0, '--bf-lip': 0, duration: 1.3, ease: 'power2.inOut' }, 8.6)
        .to('.bf-balls', { autoAlpha: 0, duration: 0.5 }, 9.2)
        .to({}, { duration: 0.1 }, 9.9)
    },
    { scope: root, dependencies: [near] },
  )

  return (
    <section className="bold bf" data-theme="yellow" ref={root} aria-label="Get fitness, go strong">
      <div className="bf-stage">
        <div className="bf-video">
          <MediaFill k="v-tennis" w={1600} />
        </div>

        <div className="bf-zoom" aria-hidden="true">
          <svg className="bf-svg" width="100%" height="100%">
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="-2%" y="-2%" width="104%" height="104%">
                <rect x="-2%" y="-2%" width="104%" height="104%" fill="#fff" />
                <text className="bf-word bf-strong" x="50%" y="94%" textAnchor="middle" fill="#000">
                  {WORD}
                </text>
              </mask>
            </defs>
            <rect className="bf-fill" x="-2%" y="-2%" width="104%" height="104%" mask={`url(#${maskId})`} />
            <text className="bf-word bf-twin" x="50%" y="94%" textAnchor="middle" fill="none">
              {WORD}
            </text>
          </svg>
        </div>

        <div className="bf-words" aria-hidden="true">
          <p className="display bf-fitness">FITNESS</p>
          <Brush text="Get" mode="none" className="bf-brush bf-brush--get" />
          <Brush text="Go" mode="none" className="bf-brush bf-brush--go" />
        </div>

        <div className="bf-cols" aria-hidden="true">
          <div className="bf-col bf-col--l">
            <MediaFill k="v-lift" w={900} sizes="30vw" />
          </div>
          <div className="bf-col bf-col--c" />
          <div className="bf-col bf-col--r">
            <MediaFill k="v-pool" w={900} sizes="30vw" />
          </div>
        </div>

        <Balls3D progress={progress} className="bf-balls" />
        <div className="bf-cut" />
      </div>
    </section>
  )
}
