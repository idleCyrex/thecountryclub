'use client'

import { useRef } from 'react'
import { useGSAP, prefersReduced } from '@/lib/gsap'
import { marquee } from '@/lib/motion'

interface Props {
  text: string
  className?: string
  repeat?: number
  duration?: number
  reverse?: boolean
  sep?: string
}

/** Seamless ribbon of display text. Two identical halves loop 0 to -50%. Static under reduced motion. */
export default function Marquee({ text, className = '', repeat = 4, duration = 26, reverse, sep = '✶' }: Props) {
  const track = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    if (!track.current || prefersReduced()) return
    marquee(track.current, { duration, reverse })
  })
  const half = Array.from({ length: repeat }, (_, i) => (
    <span key={i} className="marquee__item">
      {text}
      <i className="marquee__sep">{sep}</i>
    </span>
  ))
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee__track" ref={track}>
        {half}
        {half}
      </div>
    </div>
  )
}
