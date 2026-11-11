'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap, prefersReduced } from '@/lib/gsap'
import { startScroll, stopScroll } from '@/lib/scroll'
import { MENU, ROUTES } from '@/lib/site'
import { SETTINGS } from '@/content/site'
import TransitionLink from './ui/TransitionLink'
import './nav.css'

const JOIN = MENU[0]
let warmed = false

/** Weight-plate trigger (bottom-right) that opens a full-screen gold overlay with a circular wipe. */
export default function Nav() {
  const pathname = usePathname()
  const root = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLButtonElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const scrollRing = useRef<SVGGElement>(null)
  const spinRing = useRef<SVGGElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const prevOpen = useRef(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    let raf = 0
    const detect = () => {
      raf = 0
      if (el.dataset.open === 'true' || !plate.current) return
      const r = plate.current.getBoundingClientRect()
      const stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      for (const node of stack) {
        if (node.closest('.plate-nav, .pm-overlay, .curtain')) continue
        const sec = node.closest<HTMLElement>('[data-theme]')
        if (sec) {
          el.dataset.on = sec.dataset.theme
          return
        }
      }
      el.dataset.on = 'photo'
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(detect)
    }
    detect()
    const t = window.setTimeout(detect, 400)
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      window.clearTimeout(t)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  const router = useRouter()
  useEffect(() => {
    if (warmed) return
    let id = 0
    let cancelled = false
    const run = () => {
      if (cancelled || warmed) return
      warmed = true
      for (const href of new Set([...ROUTES.map((r) => r.href), JOIN.href])) {
        if (href.startsWith('/') && !href.startsWith('//')) router.prefetch(href)
      }
    }
    const idle = () => {
      if ('requestIdleCallback' in window) id = window.requestIdleCallback(run, { timeout: 4000 })
      else id = setTimeout(run, 1500) as unknown as number
    }
    const onLoad = () => idle()
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', onLoad, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('load', onLoad)
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(id)
      else clearTimeout(id)
    }
  }, [router])

  useEffect(() => {
    const g = scrollRing.current
    if (!g || prefersReduced()) return
    gsap.set(g, { svgOrigin: '50 50' })
    const set = gsap.quickSetter(g, 'rotation', 'deg') as (v: number) => void
    const onScroll = () => set(window.scrollY * 0.12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (spinRing.current) gsap.set(spinRing.current, { svgOrigin: '50 50' })
  }, [])

  const spin = () => {
    if (prefersReduced() || !spinRing.current) return
    gsap.to(spinRing.current, { rotation: '+=360', duration: 2.2, ease: 'power3.out', overwrite: 'auto' })
  }

  useEffect(() => {
    const ov = overlay.current
    const btn = plate.current
    if (!ov || !btn || prevOpen.current === open) return
    prevOpen.current = open
    const fast = prefersReduced()
    tl.current?.kill()

    if (open) {
      stopScroll()
      ov.style.visibility = 'visible'
      const first = ov.querySelector<HTMLElement>('.pm-link')
      if (fast) {
        gsap.set(ov, { clipPath: 'none' })
        first?.focus()
        return
      }
      const b = btn.getBoundingClientRect()
      const at = `${b.left + b.width / 2}px ${b.top + b.height / 2}px`
      const chars = ov.querySelectorAll('.pm-ch')
      const aux = ov.querySelectorAll('.pm-top, .pm-join, .pm-strip')
      tl.current = gsap
        .timeline()
        .fromTo(ov, { clipPath: `circle(0px at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: 0.8, ease: 'expo.inOut' }, 0)
        .fromTo(chars, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.7, ease: 'expo.out', stagger: 0.02 }, 0.45)
        .fromTo(aux, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 }, 0.6)
      window.setTimeout(() => first?.focus({ preventScroll: true }), 80)
    } else {
      startScroll()
      if (fast) {
        ov.style.visibility = 'hidden'
        return
      }
      const t = tl.current
      const done = () => {
        ov.style.visibility = 'hidden'
      }
      const fresh = gsap.timeline({ onComplete: done })
      const b = btn.getBoundingClientRect()
      const at = `${b.left + b.width / 2}px ${b.top + b.height / 2}px`
      fresh.to(ov, { clipPath: `circle(0px at ${at})`, duration: 0.7, ease: 'expo.inOut' }, 0)
      tl.current = fresh
      t?.kill()
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        plate.current?.focus()
        return
      }
      if (e.key !== 'Tab' || !root.current) return
      const f = Array.from(root.current.querySelectorAll<HTMLElement>('a[href], button')).filter((n) => n.offsetParent !== null || n === plate.current)
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const isCurrent = (href: string) => href === pathname
  const closeIfSame = (href: string) => {
    if (isCurrent(href)) {
      setOpen(false)
      plate.current?.focus()
    }
  }

  const ringText = open ? 'CLOSE · MENU · ' : 'MENU · COUNTRY CLUB · '

  return (
    <div className="plate-nav" ref={root} data-open={open} data-on="photo">
      <div
        className="pm-overlay"
        id="site-menu"
        ref={overlay}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        inert={!open}
        data-lenis-prevent
      >
        <div className="pm-top">
          <TransitionLink className="pm-brand" href="/" aria-label="Country Club home" onClick={() => closeIfSame('/')}>
            Country Club
          </TransitionLink>
        </div>

        <div className="pm-main">
          <nav aria-label="Main">
            <ul className="pm-list" style={{ ['--pm-n' as string]: ROUTES.length }}>
              {ROUTES.map((r) => (
                <li key={r.href}>
                  <TransitionLink
                    className="pm-link"
                    href={r.href}
                    aria-label={r.label}
                    aria-current={isCurrent(r.href) ? 'page' : undefined}
                    onClick={() => closeIfSame(r.href)}
                  >
                    <span aria-hidden="true">
                      {r.label.split(' ').map((word, wi, arr) => (
                        <Fragment key={wi}>
                          <span className="pm-w">
                            {word.split('').map((c, ci) => (
                              <span className="pm-ch" key={ci}>
                                {c}
                              </span>
                            ))}
                          </span>
                          {wi < arr.length - 1 ? ' ' : null}
                        </Fragment>
                      ))}
                    </span>
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
          <TransitionLink className="pm-join" href={JOIN.href} onClick={() => closeIfSame(JOIN.href)}>
            Become a member
          </TransitionLink>
        </div>

        <div className="pm-strip">
          <address>{SETTINGS.address.full}</address>
          <a href={SETTINGS.phoneHref}>{SETTINGS.phone}</a>
          <span className="pm-social">
            <a href={SETTINGS.socials.facebook} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            <a href={SETTINGS.socials.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </span>
        </div>
      </div>

      <button
        type="button"
        ref={plate}
        className="pm-plate"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? 'Close menu' : 'Menu, Country Club'}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={spin}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            <path id="pm-circle" d="M50 9 a41 41 0 1 1 0 82 a41 41 0 1 1 0 -82" />
          </defs>
          <circle className="pm-disc" cx="50" cy="50" r="49" />
          <g ref={scrollRing}>
            <g ref={spinRing}>
              <text className="pm-ring-text">
                <textPath href="#pm-circle" textLength="257" lengthAdjust="spacing">
                  {ringText}
                </textPath>
              </text>
            </g>
          </g>
          <circle className="pm-inner" cx="50" cy="50" r="30" />
          <circle className="pm-hub" cx="50" cy="50" r="4" />
          <path className="pm-x" d="M43 43 L57 57 M57 43 L43 57" />
        </svg>
      </button>
    </div>
  )
}
