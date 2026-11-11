'use client'

import { useId, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap, useGSAP, prefersReduced } from '@/lib/gsap'
import { waterline, waveCrest, waveMask } from '@/lib/motion'

const MASKS = { '--wl-up': waveMask('up'), '--wl-down': waveMask('down'), '--wl-crest-img': waveCrest() } as CSSProperties

interface Props {
  lines: string[]
  /** accessible text, defaults to the lines joined */
  label?: string
  as?: 'h2' | 'h1' | 'p'
  className?: string
  children?: ReactNode
  /** waterline rises from below the text to rest, scrubbed as it scrolls in */
  rise?: boolean
  /** false: the parent calls waterline() itself (to share its scroll timeline) */
  drive?: boolean
  start?: string
  end?: string
}

/** Stacked display lines cut by a drifting waterline: solid above, a refracted translucent copy below. Children (brush) sit on top. */
export default function Waterline({
  lines,
  label,
  as: Tag = 'h2',
  className = '',
  children,
  rise = true,
  drive = true,
  start = 'clamp(top 85%)',
  end = 'clamp(top 35%)',
}: Props) {
  const root = useRef<HTMLDivElement>(null)
  const fid = `wl-${useId().replace(/[^\w-]/g, '')}`

  useGSAP(
    () => {
      const el = root.current
      if (!el || !drive) return
      const animate = !prefersReduced()
      const w = waterline(el, { animate, low: rise && animate })
      if (animate && rise) w.rise(gsap.timeline({ scrollTrigger: { trigger: el, start, end, scrub: 0.6 } }))
      return () => w.kill()
    },
    { scope: root, dependencies: [lines.join('|'), rise, drive, start, end] },
  )

  const spans = lines.map((l, i) => (
    <span key={`${i}-${l}`} className="wl__ln" aria-hidden="true">
      {l}
    </span>
  ))

  return (
    <div ref={root} className={`wl${rise ? ' wl--rise' : ''} ${className}`} style={MASKS}>
      <svg className="wl__defs" aria-hidden="true" focusable="false">
        <filter id={fid} x="-2%" y="-5%" width="104%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.002 0.03" numOctaves={1} seed={7} result="n" />
          <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  0 0 0 0 .5  0 0 0 0 0  0 0 0 0 1" result="m" />
          <feDisplacementMap in="SourceGraphic" in2="m" scale="24" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="display wl__text wl__sizer" aria-hidden="true">
        {spans}
      </div>
      <div className="wl__sea">
        <div className="wl__layer wl__layer--up">
          <Tag className="display wl__text wl__copy" aria-label={label ?? lines.join(' ')}>
            {spans}
          </Tag>
        </div>
        <div className="wl__layer wl__layer--down" style={{ filter: `url(#${fid})` }} aria-hidden="true">
          <div className="wl__copy">
            <div className="display wl__text">{spans}</div>
          </div>
        </div>
      </div>
      <div className="wl__crest" aria-hidden="true">
        <div className="wl__strip" />
      </div>
      {children}
    </div>
  )
}
