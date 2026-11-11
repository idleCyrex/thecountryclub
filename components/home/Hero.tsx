'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from '@/lib/gsap'
import { startScroll, stopScroll } from '@/lib/scroll'
import { whenRevealed } from '@/lib/curtain'
import { initRolling, killRolling, roll, rollingHTML } from '@/lib/motion'
import MediaFill from '../ui/MediaFill'
import TransitionLink from '../ui/TransitionLink'
import './hero.css'

const CLIPS = ['v-pool', 'v-tennis', 'v-aerial', 'v-spin', 'v-lift']
const EVERY = 9000
const LINE = 'TRAIN IN PARADISE · COUNTRY CLUB ·'
const SPEED = 0.086 // viewport widths per second

const HOURS: Record<number, [number, number]> = {
  0: [9, 13],
  1: [6, 22],
  2: [6, 22],
  3: [6, 22],
  4: [6, 22],
  5: [6, 22],
  6: [7, 21],
}
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hr = (h: number) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`

function clubStatus(): { open: boolean; text: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lower_Princes',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const day = Math.max(0, DAYS.indexOf(get('weekday')))
  const mins = (Number(get('hour')) % 24) * 60 + Number(get('minute'))
  const [o, c] = HOURS[day]
  if (mins >= o * 60 && mins < c * 60) return { open: true, text: `Open now · until ${hr(c)}` }
  if (mins < o * 60) return { open: false, text: `Closed · opens ${hr(o)}` }
  const nd = (day + 1) % 7
  return { open: false, text: `Closed · opens tomorrow ${hr(HOURS[nd][0])}` }
}

function Track({ text, n = 4 }: { text: string; n?: number }) {
  const half = Array.from({ length: n }, (_, i) => (
    <span key={i} className="hx-item rolling" dangerouslySetInnerHTML={{ __html: rollingHTML(text) }} />
  ))
  return (
    <div className="hx-track" aria-hidden="true">
      {half}
      {half}
    </div>
  )
}

export default function Hero({ hours }: { hours: string }) {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [cycling, setCycling] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null)

  useEffect(() => {
    const tick = () => setStatus(clubStatus())
    tick()
    const id = window.setInterval(tick, 60000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const r = prefersReduced()
    setReduced(r)
    if (r || !root.current) return
    const io = new IntersectionObserver(([e]) => setCycling(e.isIntersecting))
    io.observe(root.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!cycling) return
    const id = window.setTimeout(() => setActive((a) => (a + 1) % CLIPS.length), EVERY)
    return () => window.clearTimeout(id)
  }, [cycling, active])

  useGSAP(
    (_ctx, contextSafe) => {
      const hero = root.current
      if (!hero) return
      const ribbons = hero.querySelectorAll<HTMLElement>('.hx-ribbon')
      const content = hero.querySelector<HTMLElement>('.hx-content')
      const cover = hero.querySelector<HTMLElement>('.hx-cover')

      if (prefersReduced()) {
        gsap.set([...ribbons, content], { autoAlpha: 1 })
        gsap.set(cover, { autoAlpha: 0 })
        return
      }

      let alive = true
      const loops: gsap.core.Tween[] = []
      hero.querySelectorAll<HTMLElement>('.hx-track').forEach((track) => {
        const w = track.scrollWidth / 2
        const dur = w / (window.innerWidth * SPEED)
        loops.push(gsap.fromTo(track, { x: 0 }, { x: -w, duration: dur, ease: 'none', repeat: -1 }))
      })

      const side = () => (window.innerWidth <= 760 ? 4 : 5.3)
      const rb = () => ribbons[0]?.offsetHeight ?? 0
      const seam = () => Math.round(window.innerHeight / 2)
      const midTop = () => (hero.offsetHeight ? seam() - rb() : 0)
      const midBot = () => (hero.offsetHeight ? seam() - (window.innerHeight - rb()) : 0)

      const pinEnd = window.innerWidth <= 743 ? '+=90%' : '+=150%'
      ScrollTrigger.create({ trigger: '.hero__pin', start: 'top top', end: pinEnd, pin: true, anticipatePin: 1 })

      const buildScroll = contextSafe!(() => {
        if (!alive) return
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: pinEnd,
              scrub: 0.5,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const t = self.progress > 0.8 ? 'dark' : 'yellow'
                if (hero.dataset.theme !== t) hero.dataset.theme = t
              },
            },
          })
          // one band in the middle splits into the top and bottom ribbons
          .fromTo('.hx-ribbon--top', { y: midTop }, { y: 0, duration: 0.42, ease: 'power2.inOut' }, 0)
          .fromTo('.hx-ribbon--bottom', { y: midBot }, { y: 0, duration: 0.42, ease: 'power2.inOut' }, 0)
          .fromTo('.hx-window', { '--hx-in': 0 }, { '--hx-in': side, duration: 0.42, ease: 'power2.inOut' }, 0)
          .fromTo(content, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.26)
          // then the ribbons leave and the window opens to full bleed
          .to(content, { autoAlpha: 0, duration: 0.12 }, 0.64)
          .to('.hx-ribbon--top', { y: () => -rb() * 1.05, duration: 0.3, ease: 'power2.in' }, 0.68)
          .to('.hx-ribbon--bottom', { y: () => rb() * 1.05, duration: 0.3, ease: 'power2.in' }, 0.68)
          .to('.hx-window', { '--hx-in': 0, duration: 0.3, ease: 'power2.in' }, 0.68)
      })

      stopScroll()
      gsap.set('.hx-window', { '--hx-in': 0 })
      gsap.set('.hx-ribbon--top', { y: midTop, scaleY: 0, transformOrigin: '50% 100%' })
      gsap.set('.hx-ribbon--bottom', { y: midBot, scaleY: 0, transformOrigin: '50% 0%' })
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          startScroll()
          buildScroll()
        },
      })
      tl.to(cover, { autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, 0)
        .to(ribbons, { autoAlpha: 1, duration: 0.01 }, 0.15)
        .to(ribbons, { scaleY: 1, duration: 1.1 }, 0.15)

      const items = Array.from(hero.querySelectorAll<HTMLElement>('.hx-item'))
      items.forEach((it) => initRolling(it))
      const rollAll = () => {
        if (document.hidden || hero.getBoundingClientRect().bottom < 0) return
        items.forEach((it) => roll(it, { duration: 0.9, stagger: 0.045 }))
      }
      tl.call(rollAll, undefined, 0.5)
      const rollTimer = window.setInterval(rollAll, 3600)

      let seen = false
      try {
        seen = sessionStorage.getItem('cc-intro') === '1'
        sessionStorage.setItem('cc-intro', '1')
      } catch {}
      tl.timeScale(seen ? 2.2 : 1.5)
      whenRevealed().then(() => {
        if (!alive) return
        stopScroll()
        tl.play()
      })

      return () => {
        alive = false
        loops.forEach((l) => l.kill())
        window.clearInterval(rollTimer)
        items.forEach((it) => killRolling(it))
        startScroll()
      }
    },
    { scope: root },
  )

  const t1 = 'TRAIN IN PARADISE'
  return (
    <section className="hero" data-theme="yellow" ref={root}>
      <h1 className="sr-only">The Country Club at Port de Plaisance: gym, tennis, pool and Impulse Spa in Cole Bay, St. Maarten</h1>
      <div className="hero__pin hx" style={{ ['--hx-every' as string]: `${EVERY}ms` }}>
        <div className="hx-window">
          {CLIPS.map((k, i) => (
            <div key={k} className={`hx-clip ${i === active ? 'is-active' : ''}`}>
              <MediaFill k={k} active={i === active} priority={i === 0} w={2000} />
            </div>
          ))}
          <div className="hx-shade" />
        </div>

        <div className="hx-content">
          <p className="hx-callout">
            {status && <i className={`hx-dot ${status.open ? 'is-open' : 'is-closed'}`} aria-hidden="true" />}
            {status ? status.text : 'Open daily'}
          </p>
          <p className="hx-title" aria-hidden="true">{t1}</p>
          <p className="hx-sub">At The Country Club</p>
          <TransitionLink className="btn-ellipse hx-cta" href="/contact">
            Membership inquiry
          </TransitionLink>
          <span className={`hx-progress${reduced || !cycling ? ' is-static' : ''}`} aria-hidden="true">
            <i key={active} />
          </span>
          <span className="sr-only">{hours}</span>
        </div>

        <div className="hx-ribbon hx-ribbon--top">
          <Track text={LINE} n={3} />
        </div>
        <div className="hx-ribbon hx-ribbon--bottom">
          <Track text={LINE} n={3} />
        </div>

        <div className="hx-cover" aria-hidden="true" />
      </div>
    </section>
  )
}
