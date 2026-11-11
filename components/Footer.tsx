'use client'

import { drawOnScroll } from '@/lib/draw'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, useGSAP, prefersReduced } from '@/lib/gsap'
import { SETTINGS, type HoursRow } from '@/content/site'
import { clubWeekday, rowForDay } from './HoursTable'
import Waterline from './ui/Waterline'
import Brush from './ui/Brush'
import TransitionLink from './ui/TransitionLink'
import './footer.css'

const SOCIALS = [
  { name: 'Instagram', sub: 'Club life, daily', href: SETTINGS.socials.instagram, ext: true },
  { name: 'Facebook', sub: 'News & events', href: SETTINGS.socials.facebook, ext: true },
  { name: 'YouTube', sub: 'Club Life videos', href: `https://www.youtube.com/watch?v=${SETTINGS.youtube[0].id}`, ext: true },
  { name: 'Call us', sub: SETTINGS.phone, href: SETTINGS.phoneHref, ext: false },
]

const DIRECTIONS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Country Club Port de Plaisance, Cole Bay, Sint Maarten')

function SocialFace({ s }: { s: (typeof SOCIALS)[number] }) {
  return (
    <>
      <span className="display fs__name">
        {s.name}
        {s.ext && <span className="fs__arrow">↗</span>}
      </span>
      <span className="fs__sub">{s.sub}</span>
    </>
  )
}

function HoursRows({ rows, today }: { rows: HoursRow[]; today: number }) {
  return (
    <div className="fi__hours">
      {rows.map((h, i) => (
        <p key={h.days} className={i === today ? 'fi__row is-today' : 'fi__row'}>
          <span className="fi__day">{h.days}</span>
          <span className="display fi__time">{h.time}</span>
        </p>
      ))}
    </div>
  )
}

export default function Footer() {
  const root = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const [today, setToday] = useState({ gym: -1, spa: -1 })

  useEffect(() => {
    const d = clubWeekday()
    setToday({ gym: rowForDay(SETTINGS.hours.gym, d), spa: rowForDay(SETTINGS.hours.spa, d) })
  }, [])

  useLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLElement>('.footer__wl')
    const text = el?.querySelector<HTMLElement>('.wl__sizer')
    if (!el || !text) return
    const fit = () => {
      const fs = parseFloat(getComputedStyle(text).fontSize)
      const widest = Math.max(...Array.from(text.querySelectorAll<HTMLElement>('.wl__ln'), (n) => n.offsetWidth))
      if (!fs || !widest) return
      const target = window.innerWidth * (window.innerWidth < 744 ? 0.86 : 0.46)
      const next = (target / widest) * fs
      if (Math.abs(next - fs) < 0.5) return
      el.style.setProperty('--fs', `${next}px`)
      window.dispatchEvent(new Event('resize'))
    }
    fit()
    document.fonts?.ready.then(fit)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useLayoutEffect(() => {
    const el = root.current
    const keep = el?.querySelector<HTMLElement>('.footer__social')
    if (!el || !keep) return
    const zone = () => el.style.setProperty('--lines-h', `${Math.round(keep.getBoundingClientRect().top - el.getBoundingClientRect().top)}px`)
    zone()
    const ro = new ResizeObserver(zone)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      if (prefersReduced()) return
      drawOnScroll('.footer__lines path', { trigger: root.current, start: 'top 85%', end: 'bottom bottom', scrub: 0.6 }, 0.1)
    },
    { scope: root },
  )

  const year = new Date().getFullYear()

  return (
    <footer className="footer" data-theme="yellow" ref={root}>
      <svg className="footer__lines" viewBox="0 0 1440 1400" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M-40 120 C 300 -40, 520 380, 260 560 S 40 980, 420 1180 S 900 1500, 1500 1120" />
        <path pathLength={1} d="M1480 60 C 1160 220, 1300 520, 1040 640 S 640 760, 820 1020 S 1220 1230, 1500 1330" />
      </svg>

      <div className="footer__inner">
        <Waterline lines={['JOIN THE', 'COUNTRY', 'CLUB']} rise={false} className="footer__wl">
          <Brush text="Follow us" className="footer__brush" rotate={-8} />
        </Waterline>
        {pathname !== '/contact' && (
          <TransitionLink className="btn btn--outline footer__cta" href="/contact">
            Contact us
          </TransitionLink>
        )}

        <ul className="footer__social" aria-label="Social media">
          {SOCIALS.map((s) => (
            <li key={s.name}>
              <a className="fs" href={s.href} {...(s.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <span className="fs__face">
                  <SocialFace s={s} />
                </span>
                <span className="fs__face fs__face--fill" aria-hidden="true">
                  <SocialFace s={s} />
                </span>
              </a>
            </li>
          ))}
        </ul>

        {pathname !== '/contact' && (
          <div className="footer__info">
            <div className="fi">
              <h3 className="display fi__h">Visit</h3>
              <p className="fi__p">
                {SETTINGS.address.street}
                <br />
                {SETTINGS.address.locality}, {SETTINGS.address.region}
              </p>
              <p className="fi__p">
                <a className="fi__link" href={SETTINGS.phoneHref}>
                  {SETTINGS.phone}
                </a>
              </p>
              <p className="fi__p">
                <a className="fi__link" href={DIRECTIONS} target="_blank" rel="noopener noreferrer">
                  Get directions ↗
                </a>
              </p>
            </div>
            <div className="fi">
              <h3 className="display fi__h">Gym</h3>
              <HoursRows rows={SETTINGS.hours.gym} today={today.gym} />
            </div>
            <div className="fi">
              <h3 className="display fi__h">Impulse Spa</h3>
              <HoursRows rows={SETTINGS.hours.spa} today={today.spa} />
            </div>
          </div>
        )}

        <div className="footer__bottom">
          <nav aria-label="Legal" className="footer__legal">
            <TransitionLink className="fl" href="/privacy">
              Privacy policy
            </TransitionLink>
            <TransitionLink className="fl" href="/contact">
              Contact
            </TransitionLink>
            <a className="fl" href={SETTINGS.yachtClub} target="_blank" rel="noopener noreferrer">
              Yacht Club ↗
            </a>
          </nav>
          <p className="footer__copy">© {year} The Country Club at Port de Plaisance</p>
          <p className="footer__credit">
            A Marine Management Group company ·{' '}
            <a className="fl" href="https://software.cheriefamily.com/" target="_blank" rel="noopener noreferrer">
              Made by Chérie Software ↗
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
