'use client'

import { useRef, type CSSProperties } from 'react'
import { useNear, refreshSoon } from '@/lib/lazy'
import { gsap, useGSAP, prefersReduced } from '@/lib/gsap'
import { brushWrite } from '@/lib/motion'
import type { Facility } from '@/content/site'
import Brush from '../ui/Brush'
import MediaFill from '../ui/MediaFill'
import TransitionLink from '../ui/TransitionLink'
import './gridstack.css'

const AREAS = [
  { href: '/club-fitness', keys: ['kids', 'aerial-club', 'carnival'] },
  { href: '/club-fitness', keys: ['gym-highfive', 'gym-rack', 'gym-flex'] },
  { href: '/tennis', keys: ['tennis-night', 'tennis-court', 'tennis-shade'] },
  { href: '/pool', keys: ['pool-party', 'pool', 'pool-yoga'] },
  { href: '/spa', keys: ['spa-clinic', 'spa-stones', 'spa-salon'] },
]
const CARDS = AREAS.flatMap((a) => a.keys.map((k) => ({ k, href: a.href })))
const STEP = 24
const SECTOR = 72
const POS: Record<string, string> = {
  'gym-highfive': '50% 25%', 'pool-party': '50% 40%', kids: '50% 30%', 'gym-flex': '50% 20%', 'tennis-night': '50% 55%',
  'gym-rack': '50% 20%', carnival: '50% 25%', 'aerial-club': '50% 50%', 'tennis-court': '50% 60%', 'tennis-shade': '50% 45%',
  pool: '50% 50%', 'pool-yoga': '50% 40%', 'spa-clinic': '64% 50%', 'spa-stones': '50% 50%', 'spa-salon': '50% 40%',
}
const CARD_KEY: Record<string, string> = {
  'gym-floor': 'gym-floor', 'tennis-courts': 'tennis-night', 'members-pool': 'pool', 'impulse-spa': 'spa-stones', 'locker-rooms': 'spa-clinic',
}
const CARD_POS: Record<string, string> = { 'tennis-night': '50% 55%', 'spa-clinic': '64% 50%', 'aerial-club': '50% 50%' }

export default function GridStack({ facilities }: { facilities: Facility[] }) {
  const root = useRef<HTMLElement>(null)
  const near = useNear(root)

  useGSAP(
    () => {
      const el = root.current
      if (!el || !near) return

      const orbit = () => {
        const ring = el.querySelector<HTMLElement>('.orbit__ring')!
        const photos = gsap.utils.toArray<HTMLElement>('.orbit__card', el)
        const state = { rot: 0, spin: 0, k: 1 }
        const dims: string[] = []
        const far: boolean[] = []
        let live = false

        const apply = () => {
          const turn = state.rot + state.spin
          ring.style.setProperty('--rot', `${turn}deg`)
          ring.style.setProperty('--k', String(state.k))
          photos.forEach((p, i) => {
            const c = Math.cos((((i - 1) * STEP + turn) * Math.PI) / 180)
            const d = ((c + 1) / 2).toFixed(3)
            if (dims[i] !== d) {
              dims[i] = d
              p.style.setProperty('--d', d)
            }
            const f = c < 0
            if (far[i] !== f) {
              far[i] = f
              p.classList.toggle('is-far', f)
            }
          })
        }

        if (prefersReduced()) {
          apply()
          return
        }

        state.k = 0.3
        state.spin = 80
        gsap.set(photos, { autoAlpha: 0 })
        apply()

        gsap
          .timeline({ onUpdate: apply, scrollTrigger: { trigger: '.pile__pin', start: 'top 65%', once: true } })
          .to(state, { k: 1, spin: 0, duration: 1.6, ease: 'expo.out' }, 0)
          .fromTo(photos, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.03, ease: 'none' }, 0)
          .call(() => void (live = true), [], 1)
          .add(brushWrite(el.querySelector('.orbit__brush'), { duration: 0.4, stagger: 0.15 }), 0.5)
          .fromTo('.orbit__actions', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 1.2)

        const stage = el.querySelector<HTMLElement>('.orbit')!
        let tw: gsap.core.Tween | undefined
        let hold = 0
        let inView = false
        let down = false
        let dragging = false
        let moved = false
        let x0 = 0
        let r0 = 0
        let lastX = 0
        let lastT = 0
        let vel = 0
        // card width is 12 units; 1 / unit turns the ring at finger speed, a touch more feels lighter
        const perPx = () => (1.3 * 12) / (photos[0].offsetWidth || 240)
        const snap = (r: number) => Math.round(r / SECTOR) * SECTOR
        const turnTo = (rot: number, duration: number, ease: string) => {
          tw?.kill()
          tw = gsap.to(state, { rot, duration, ease, onUpdate: apply })
        }
        const onDown = (e: PointerEvent) => {
          if (!live || (e.pointerType === 'mouse' && e.button !== 0) || (e.target as Element).closest('.orbit__actions')) return
          down = true
          dragging = moved = false
          x0 = lastX = e.clientX
          lastT = e.timeStamp
          vel = 0
        }
        const onMove = (e: PointerEvent) => {
          hold = performance.now() + 2600
          if (!down) return
          if (!dragging) {
            if (Math.abs(e.clientX - x0) < 6) return
            dragging = moved = true
            tw?.kill()
            x0 = lastX = e.clientX
            r0 = state.rot
            try {
              stage.setPointerCapture(e.pointerId)
            } catch {}
            stage.classList.add('is-dragging')
          }
          const k = perPx()
          const dt = e.timeStamp - lastT
          if (dt > 0) vel = 0.7 * (((e.clientX - lastX) * k) / dt) + 0.3 * vel
          lastX = e.clientX
          lastT = e.timeStamp
          state.rot = r0 + (e.clientX - x0) * k
          apply()
        }
        const onUp = (e: PointerEvent) => {
          if (!down) return
          down = false
          if (!dragging) return
          dragging = false
          stage.classList.remove('is-dragging')
          if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId)
          const throwBy = e.timeStamp - lastT > 120 ? 0 : gsap.utils.clamp(-SECTOR, SECTOR, vel * 320)
          const by = state.rot - r0 + throwBy
          let to = snap(r0 + by)
          if (to === snap(r0) && Math.abs(by) > 9) to += Math.sign(by) * SECTOR
          turnTo(to, 0.9, 'power3.out')
          hold = performance.now() + 4000
        }
        // a drag that ends over a card must not follow its link
        const onClick = (e: MouseEvent) => {
          if (!moved) return
          moved = false
          e.preventDefault()
          e.stopPropagation()
        }
        const noDrag = (e: Event) => e.preventDefault()
        stage.addEventListener('pointerdown', onDown)
        stage.addEventListener('pointermove', onMove)
        stage.addEventListener('pointerup', onUp)
        stage.addEventListener('pointercancel', onUp)
        stage.addEventListener('click', onClick, true)
        stage.addEventListener('dragstart', noDrag)

        const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.35 })
        io.observe(stage)
        const auto = window.setInterval(() => {
          if (!live || !inView || down || document.hidden || performance.now() < hold) return
          turnTo(snap(state.rot) - SECTOR, 1.4, 'power2.inOut')
        }, 3400)

        return () => {
          window.clearInterval(auto)
          io.disconnect()
          tw?.kill()
          stage.removeEventListener('pointerdown', onDown)
          stage.removeEventListener('pointermove', onMove)
          stage.removeEventListener('pointerup', onUp)
          stage.removeEventListener('pointercancel', onUp)
          stage.removeEventListener('click', onClick, true)
          stage.removeEventListener('dragstart', noDrag)
          stage.classList.remove('is-dragging')
        }
      }

      const cards = () => {
        if (prefersReduced()) return
        const items = gsap.utils.toArray<HTMLElement>('.gs-finds__item', el)
        if (!items.length) return
        gsap.fromTo(
          items,
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.08,
            scrollTrigger: { trigger: '.gs-finds__row', start: 'top 85%', once: true },
          },
        )
      }

      const stop = orbit()
      cards()
      refreshSoon()
      return stop
    },
    { scope: root, dependencies: [near] },
  )

  return (
    <section className="pile" data-theme="dark" ref={root}>
      <div className="pile__pin">
        <div className="orbit">
          <div className="orbit__scene">
            <div className="orbit__tilt">
              <div className="orbit__ring" aria-hidden="true">
                {CARDS.map((c, i) => (
                  <TransitionLink
                    key={c.k}
                    href={c.href}
                    className="orbit__card"
                    tabIndex={-1}
                    style={{ '--a': `${(i - 1) * STEP}deg` } as CSSProperties}
                  >
                    <MediaFill
                      k={c.k}
                      w={800}
                      sizes="(max-width: 743px) 48vw, 24vw"
                      alt=""
                      style={{ objectPosition: POS[c.k] ?? '50% 35%' }}
                    />
                  </TransitionLink>
                ))}
              </div>
            </div>
          </div>
          <Brush text="Choose your game" mode="none" className="orbit__brush" />
          <div className="orbit__actions">
            <TransitionLink className="btn" href="/contact">
              Book a visit
            </TransitionLink>
            <TransitionLink className="btn btn--outline" href="/contact">
              Membership
            </TransitionLink>
          </div>
        </div>
      </div>

      <div className="gs-finds">
        <h3 className="gs-finds__title">What you&apos;ll find at the club</h3>
        <ul className="gs-finds__row">
          {facilities.map((f, i) => {
            const k = CARD_KEY[f.slug] ?? 'aerial-club'
            return (
              <li key={f.slug} className="gs-finds__item">
                <TransitionLink href={f.href ?? '/club-fitness'} className="gs-card">
                  <MediaFill
                    k={k}
                    w={900}
                    sizes="(max-width: 743px) 75vw, 20vw"
                    className="gs-card__img"
                    alt=""
                    style={{ objectPosition: CARD_POS[k] ?? '50% 40%' }}
                  />
                  <span className="gs-card__body">
                    <span className="gs-card__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="gs-card__title">{f.title}</span>
                    <span className="gs-card__line">{f.line}</span>
                  </span>
                </TransitionLink>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
