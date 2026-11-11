'use client'

import { useRef } from 'react'
import { useGSAP, prefersReduced } from '@/lib/gsap'
import { marquee } from '@/lib/motion'
import { useNear } from '@/lib/lazy'

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
  const box = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const near = useNear(box)
  useGSAP(
    () => {
      const host = box.current
      if (!near || !host || !track.current || prefersReduced()) return
      const tw = marquee(track.current, { duration, reverse })
      // the loop only ticks while the ribbon is on screen
      const io = new IntersectionObserver((es) => {
        if (es[es.length - 1].isIntersecting) tw.play()
        else tw.pause()
      })
      io.observe(host)
      return () => io.disconnect()
    },
    { dependencies: [near] },
  )
  const half = Array.from({ length: repeat }, (_, i) => (
    <span key={i} className="marquee__item">
      {text}
      <i className="marquee__sep">{sep}</i>
    </span>
  ))
  return (
    <div className={`marquee ${className}`} aria-hidden="true" ref={box}>
      <div className="marquee__track" ref={track}>
        {half}
        {half}
      </div>
    </div>
  )
}
