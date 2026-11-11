'use client'

import { useEffect, useRef } from 'react'
import { gsap, prefersReduced } from '@/lib/gsap'
import { releaseBoot } from '@/lib/curtain'
import { startScroll, stopScroll } from '@/lib/scroll'
import './preloader.css'

const MAX_MS = 6000
const QUICK_MS = 600
const BALL = 26
const STEPS = ['Warming up the courts', 'Filling the pool', 'Racking the weights', 'Heating the sauna']

/*
 * Progress curve: v(t) = 90 · (1 − e^(−t/2.4s)). Fast at first, then easing towards 90 so it never stalls.
 * Until React hydrates the main thread is busy, so the curve is baked into CSS keyframes that only move
 * transforms (compositor, keeps running while scripts block). Once hydrated, JS reads the running
 * animation's time, takes over from the exact same value and counts the rest of the way to 100.
 */
const TAU = 2.4
const VMAX = 90
const DUR = 11
const U = 0.82 // em per odometer row
const curve = (t: number) => VMAX * (1 - Math.exp(-t / TAU))
const timeAt = (v: number) => -TAU * Math.log(1 - v / VMAX)
const SAMPLES = [...Array.from({ length: 17 }, (_, i) => i * 0.25), 4.5, 5, 5.5, 6, 7, 8, 9, 10, DUR]
const pct = (t: number) => `${((t / DUR) * 100).toFixed(2)}%`
const smooth = (name: string, fn: (v: number) => string) =>
  `@keyframes ${name}{${SAMPLES.map((t) => `${pct(t)}{transform:${fn(curve(t))}}`).join('')}}`
/**
 * Holds each value, then rolls to the next over `roll` seconds (or continuously when values come faster than that).
 * `wrap`: the strip repeats its first cell at index `wrap`, so after rolling onto it the strip snaps back to 0.
 */
const ticks = (name: string, marks: number[], fn: (i: number) => string, roll: number, wrap = 0) => {
  const at = (i: number) => (wrap ? i % wrap : i)
  const f = [`0%{transform:${fn(0)}}`]
  marks.forEach((v, i) => {
    const t = timeAt(v)
    const prev = i ? timeAt(marks[i - 1]) : 0
    const start = Math.max(prev, t - roll)
    if (start > prev) f.push(`${pct(start)}{transform:${fn(at(i))}}`)
    if (wrap && (i + 1) % wrap === 0) f.push(`${pct(t)}{transform:${fn(wrap)}}`, `${pct(t + 0.002)}{transform:${fn(0)}}`)
    else f.push(`${pct(t)}{transform:${fn(at(i + 1))}}`)
  })
  f.push(`100%{transform:${fn(at(marks.length))}}`)
  return `@keyframes ${name}{${f.join('')}}`
}
const upTo = (n: number, every = 1) => Array.from({ length: Math.floor(n / every) }, (_, i) => (i + 1) * every)

const ones = (v: number) => `translateY(${(-v * U).toFixed(3)}em)`
/** ones strip position (0..10) for a running value */
const onesAt = (v: number) => v - 10 * Math.floor(v / 10)
const tens = (i: number) => `translateY(${(-i * U).toFixed(3)}em)`
const fill = (v: number) => `scaleX(${(v / 100).toFixed(4)})`
const roll = (v: number) => `translateX(${v.toFixed(2)}%)`
const turn = (v: number) => `rotate(${(v * 9).toFixed(1)}deg)`
const say = (i: number) => `translateY(${-i * 1.4}em)`

const KEYFRAMES = [
  ticks('pl-ones', upTo(89), ones, 0.09, 10),
  ticks('pl-tens', upTo(89, 10), tens, 0.16),
  smooth('pl-fill', fill),
  smooth('pl-roll', roll),
  smooth('pl-turn', turn),
  ticks('pl-say', [25, 50, 75], say, 0.3),
].join('')

const ONES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
const TENS = [' ', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

/** First-load screen: odometer counter + ball rolling along the line, then the panel lifts. */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const el = root.current
    if (!el || !html.classList.contains('is-loading')) {
      html.classList.remove('is-loading')
      releaseBoot()
      return
    }
    const q = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!
    const parts = {
      ones: q('.pl-ones'),
      tens: q('.pl-tens'),
      hund: q('.pl-hund'),
      hundCol: q('.pl-col--hund'),
      fill: q('.pl-fill'),
      ball: q('.pl-ball'),
      spin: q('.pl-spin'),
      say: q('.pl-say'),
      count: q('.pl-count'),
    }
    const reduced = prefersReduced()
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    // phones and slow links: lift as soon as the app is interactive instead of waiting on fonts and media
    const fast = window.matchMedia('(max-width: 743px)').matches || !!conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? '')
    let alive = true
    let finished = false
    // true when the page was (nearly) loaded by the time React took over: then the loader just zips out
    let quick = false
    stopScroll()

    const render = (v: number) => {
      parts.ones.style.transform = ones(onesAt(v))
      parts.tens.style.transform = tens(Math.min(10, Math.floor(v / 10)))
      parts.hund.style.transform = tens(v >= 100 ? 1 : 0)
      parts.fill.style.transform = fill(v)
      parts.ball.style.transform = roll(v)
      parts.spin.style.transform = turn(v)
      parts.say.style.transform = say(Math.min(STEPS.length - 1, Math.floor(v / 25)))
    }

    const exit = () => {
      if (!alive) return
      const after = () => {
        html.classList.remove('is-loading')
        gsap.set(el, { clearProps: 'all' })
      }
      if (reduced) {
        startScroll()
        releaseBoot()
        gsap.to(el, { autoAlpha: 0, duration: 0.35, onComplete: after })
        return
      }
      const k = quick ? 0.6 : 1
      gsap
        .timeline({ onComplete: after })
        .to('.pl-inner', { yPercent: -18, autoAlpha: 0, duration: 0.4 * k, ease: 'power3.in' }, 0)
        .to(el, { yPercent: -100, duration: 0.75 * k, ease: 'expo.inOut' }, 0.08 * k)
        .call(
          () => {
            startScroll()
            releaseBoot()
          },
          undefined,
          0.35 * k,
        )
    }

    const countOut = () => {
      if (!alive) return
      // pick up exactly where the CSS odometer is showing right now: the ones strip gives the digit,
      // the animation clock the decade
      const anim = parts.ones.getAnimations?.()[0]
      const now = anim && typeof anim.currentTime === 'number' ? anim.currentTime : performance.now()
      const approx = curve(Math.min(DUR, now / 1000))
      const fs = parseFloat(getComputedStyle(parts.count).fontSize) || 1
      const pos = -new DOMMatrix(getComputedStyle(parts.ones).transform).m42 / (fs * U)
      const shown = Number.isFinite(pos) ? pos + 10 * Math.round((approx - pos) / 10) : approx
      const from = Math.min(99, Math.max(0, shown))
      el.classList.add('is-js')
      render(from)
      const s = { v: from }
      gsap
        .timeline({ onComplete: exit })
        .to(s, { v: 100, duration: quick ? 0.25 : 0.3 + ((100 - from) / 100) * 0.35, ease: quick ? 'power1.in' : 'power2.inOut', onUpdate: () => render(s.v) }, 0)
        .fromTo(parts.hundCol, { width: 0 }, { width: 'auto', duration: 0.2, ease: 'power2.out' }, '<')
    }

    const finish = () => {
      if (finished || !alive) return
      finished = true
      countOut()
    }

    const inView = (n: Element) => {
      const r = n.getBoundingClientRect()
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth
    }
    const begin = () => {
      if (!alive) return
      if (fast) {
        quick = true
        finish()
        return
      }
      const tasks: Promise<unknown>[] = []
      if (document.fonts && document.fonts.status !== 'loaded') tasks.push(document.fonts.ready)
      document.querySelectorAll<HTMLImageElement>('main img').forEach((img) => {
        if (img.complete || !inView(img)) return
        tasks.push(new Promise((r) => (img.addEventListener('load', r, { once: true }), img.addEventListener('error', r, { once: true }))))
      })
      document.querySelectorAll<HTMLVideoElement>('main video').forEach((v) => {
        const src = v.getAttribute('poster')
        if (!src || !inView(v)) return
        tasks.push(
          new Promise((r) => {
            const im = new Image()
            im.onload = im.onerror = () => r(null)
            im.src = src
          }),
        )
      })
      // "already loaded": nothing left, or the last bits land within a blink of hydration
      const t = performance.now()
      Promise.all(tasks).then(() => {
        quick = performance.now() - t < QUICK_MS
        finish()
      })
    }
    // two frames: lets the media observers mark the visible videos to load first
    const raf = requestAnimationFrame(() => requestAnimationFrame(begin))
    const cap = gsap.delayedCall(MAX_MS / 1000, finish)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      cap.kill()
    }
  }, [])

  return (
    <div className="preloader" ref={root} role="status" aria-label="Loading The Country Club">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div className="pl-inner" aria-hidden="true">
        <p className="pl-brand">The Country Club</p>
        <p className="pl-count display">
          <span className="pl-col pl-col--hund">
            <span className="pl-strip pl-hund">
              <span>{' '}</span>
              <span>1</span>
            </span>
          </span>
          <span className="pl-col">
            <span className="pl-strip pl-tens">
              {TENS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </span>
          </span>
          <span className="pl-col">
            <span className="pl-strip pl-ones">
              {ONES.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </span>
          </span>
          <i>%</i>
        </p>
        <div className="pl-foot">
          <div className="pl-track">
            <div className="pl-line" />
            <div className="pl-fill" />
            <div className="pl-rail">
              <div className="pl-ball">
                <div className="pl-bounce">
                  <div className="pl-spin">
                    <svg viewBox="0 0 22 22" width={BALL} height={BALL} focusable="false">
                      <defs>
                        <radialGradient id="pl-felt" cx="34%" cy="30%" r="80%">
                          <stop offset="0" stopColor="#f0ff8a" />
                          <stop offset="0.45" stopColor="#d9f24a" />
                          <stop offset="1" stopColor="#a9c224" />
                        </radialGradient>
                      </defs>
                      <circle cx="11" cy="11" r="11" fill="url(#pl-felt)" />
                      <path d="M3.2 3.4C8 6.2 8 15.8 3.2 18.6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M18.8 3.4C14 6.2 14 15.8 18.8 18.6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span className="pl-saywin">
            <span className="pl-say">
              {STEPS.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
