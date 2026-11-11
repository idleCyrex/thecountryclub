'use client'

import { useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap, useGSAP, prefersReduced } from '@/lib/gsap'
import Rolling from './ui/Rolling'
import Brush from './ui/Brush'
import MediaFill from './ui/MediaFill'

interface Props {
  title: string
  brush: string
  intro?: ReactNode
  media?: string
  /** long titles get a smaller size so they stay on one line */
  size?: 'xl' | 'lg' | 'md'
  children?: ReactNode
}

/** Inner-page opener: rolling title (after the curtain lifts), brush subtitle write-on, intro, media panel rising. */
export default function PageHero({ title, brush, intro, media, size = 'xl', children }: Props) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReduced() || !media) return
      gsap.fromTo(
        '.page-hero__media',
        { clipPath: 'inset(18% 10% 0% 10% round 14px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: '.page-hero__media', start: 'top 95%', end: 'top 15%', scrub: 0.6 },
        },
      )
      gsap.fromTo('.page-hero__media .media-fill', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.page-hero__media', start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
    },
    { scope: root },
  )

  return (
    <section className={`page-hero page-hero--${size}`} data-theme="dark" ref={root}>
      <div className="page-hero__head">
        <Rolling as="h1" text={title} mode="enter" className="page-hero__title" style={{ '--n': title.length } as CSSProperties} />
        <Brush text={brush} mode="enter" className="brush-over page-hero__brush" />
      </div>
      {intro && <div className="body-caps page-hero__intro">{intro}</div>}
      {children}
      {media && (
        <div className="page-hero__media">
          <MediaFill k={media} priority w={2000} />
        </div>
      )}
    </section>
  )
}
