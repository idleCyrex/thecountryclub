'use client'

import { useRef } from 'react'
import { useNear, refreshSoon } from '@/lib/lazy'
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from '@/lib/gsap'
import { brushWrite, initRolling, roll } from '@/lib/motion'
import type { Facility } from '@/content/site'
import Rolling from '../ui/Rolling'
import Brush from '../ui/Brush'
import MediaFill from '../ui/MediaFill'
import TransitionLink from '../ui/TransitionLink'
import './gridstack.css'

const KEYS = [
  'gym-highfive', 'pool-party', 'tennis-court', 'spa-stones', 'gym-deadlift', 'pool-yoga',
  'kids', 'gym-flex', 'tennis-night', 'aerial-side', 'spa-clinic',
  'gym-cardio', 'pool-lounge', 'gym-rack', 'carnival', 'gym-legpress', 'tennis-shade',
  'spa-salon', 'gym-coach', 'pool-walk', 'gym-bike', 'gym-stretch',
  'spa-nails', 'gym-seated', 'pool', 'gym-cable', 'gym-kickback', 'gym-duo',
  'gym-floor', 'gym-stair', 'aerial-club',
]
const POS: Record<string, string> = {
  'gym-highfive': '50% 25%', 'pool-party': '50% 40%', 'gym-deadlift': '50% 35%', kids: '50% 30%', 'gym-flex': '50% 20%',
  'tennis-night': '50% 55%', 'aerial-side': '40% 50%', 'gym-rack': '50% 20%', carnival: '50% 25%', 'gym-coach': '50% 30%',
  'pool-walk': '50% 35%', 'gym-seated': '50% 25%', 'gym-duo': '50% 25%', 'aerial-club': '50% 50%', 'tennis-court': '50% 60%',
}
const FILL: Record<number, string> = { 6: 'crew-1', 12: 'crew-2', 19: 'crew-3', 27: 'crew-4', 33: 'crew-5' }
const CELLS: string[] = []
{
  let n = 0
  for (let c = 0; c < 36; c++) CELLS.push(FILL[c] ?? KEYS[n++])
}
const TOP_KEY: Record<string, string> = {
  'THE CLUB': 'aerial-club', 'THE GYM': 'gym-rack', 'THE COURTS': 'tennis-court', 'THE POOL': 'pool', 'THE SPA': 'spa-stones',
}
const WORDS = ['THE CLUB', 'THE GYM', 'THE COURTS', 'THE POOL', 'THE SPA']
const REVEAL = 0.7
const LIVE = 1.1
const WORD_HREF: Record<string, string> = {
  'THE CLUB': '/club-fitness', 'THE GYM': '/club-fitness', 'THE COURTS': '/tennis', 'THE POOL': '/pool', 'THE SPA': '/spa',
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
      const stage = el.querySelector<HTMLElement>('.pile__stage')!
      const grid = el.querySelector<HTMLElement>('.gs__grid')!
      const word = el.querySelector<HTMLElement>('.pile__word')!
      const tiles = gsap.utils.toArray<HTMLElement>('.pile__photo', el)
      const scrim = el.querySelector<HTMLElement>('.pile__scrim')!
      const byKey = new Map(tiles.map((t) => [t.dataset.k!, t]))
      const baseZ = new Map(tiles.map((t) => [t, Number(t.style.zIndex)]))
      let topTile = byKey.get('aerial-club')!
      const movers = tiles
      const rot = tiles.map(() => gsap.utils.random(-4, 4))
      const off = tiles.map(() => [gsap.utils.random(-30, 30), gsap.utils.random(-30, 30)])
      const pileScale = () =>
        stage.offsetWidth < 744 ? gsap.utils.clamp(1.8, 3.4, (stage.offsetWidth * 0.64) / tiles[0].offsetWidth) : 1.8
      const origin = () => {
        const g = grid.getBoundingClientRect()
        const s = stage.getBoundingClientRect()
        return [g.left - s.left, g.top - s.top]
      }
      const toPile = (t: HTMLElement) => {
        const i = tiles.indexOf(t)
        return {
          x: () => stage.offsetWidth / 2 - (origin()[0] + t.offsetLeft + t.offsetWidth / 2) + off[i][0],
          y: () => stage.offsetHeight * 0.46 - (origin()[1] + t.offsetTop + t.offsetHeight / 2) + off[i][1],
          rotation: rot[i],
          scale: pileScale,
        }
      }

      const pile = () => {
        if (prefersReduced()) {
          movers.forEach((t) => {
            const p = toPile(t)
            gsap.set(t, { x: p.x(), y: p.y(), rotation: p.rotation, scale: p.scale() })
          })
          return
        }

        initRolling(word)
        gsap.set(scrim, { autoAlpha: 0 })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: '.pile__pin',
            start: 'top top',
            end: () => `+=${window.innerHeight * (window.innerWidth < 744 ? 1.6 : 3)}`,
            pin: true,
            anticipatePin: 1,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
        movers.forEach((t, i) => {
          tl.to(t, { ...toPile(t), duration: 0.6 }, i * 0.012)
        })
        tl.to(scrim, { autoAlpha: 1, duration: 0.4, ease: 'none' }, 0.6)
          .fromTo(word, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08, ease: 'none' }, REVEAL)
          .fromTo(word, { scaleY: 0 }, { scaleY: 1, duration: LIVE - REVEAL, ease: 'expo.out' }, REVEAL)
          .add(brushWrite(el.querySelector('.pile__brush'), { duration: 0.4, stagger: 0.15 }), 1.4)
          .fromTo('.pile__actions', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'expo.out' }, 1.6)
          .to({}, { duration: 0.3 })

        const surface = (w: string) => {
          const t = byKey.get(TOP_KEY[w])
          if (!t || t === topTile) return
          topTile.style.zIndex = String(baseZ.get(topTile))
          topTile = t
          t.style.zIndex = '100'
          t.animate([{ scale: '1.14' }, { scale: '1' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' })
        }
        let i = 0
        let timer = 0
        const st = ScrollTrigger.create({
          trigger: '.pile__pin',
          start: 'top 60%',
          end: () => `+=${window.innerHeight * (window.innerWidth < 744 ? 2.2 : 3.6)}`,
          onToggle(self) {
            window.clearInterval(timer)
            if (self.isActive)
              timer = window.setInterval(() => {
                if (document.hidden || tl.time() < LIVE) return
                const w = WORDS[++i % WORDS.length]
                roll(word, { word: w })
                surface(w)
              }, 2400)
          },
        })
        return () => {
          window.clearInterval(timer)
          st.kill()
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

      const mm = gsap.matchMedia()
      mm.add('(min-width: 744px)', () => pile())
      cards()
      refreshSoon()
      return () => mm.revert()
    },
    { scope: root, dependencies: [near] },
  )

  return (
    <section className="pile" data-theme="dark" ref={root}>
      <div className="pile-m">
        <Brush text="Choose your game" className="pile-m__brush" />
        <ul className="pile-m__track">
          {WORDS.map((w) => (
            <li key={w} className="pile-m__item">
              <TransitionLink href={WORD_HREF[w]} className="pile-m__card">
                <MediaFill
                  k={TOP_KEY[w]}
                  w={900}
                  sizes="80vw"
                  className="pile-m__img"
                  style={{ objectPosition: POS[TOP_KEY[w]] ?? '50% 40%' }}
                />
                <span className="pile-m__word">{w}</span>
              </TransitionLink>
            </li>
          ))}
        </ul>
        <div className="pile-m__actions">
          <TransitionLink className="btn" href="/contact">
            Book a visit
          </TransitionLink>
          <TransitionLink className="btn btn--outline" href="/contact">
            Membership
          </TransitionLink>
        </div>
      </div>
      <div className="pile__pin">
        <div className="pile__stage">
          <div className="gs__grid">
            {CELLS.map((k, i) => (
              <figure key={i} className="pile__photo" data-k={k} style={{ zIndex: i + 1 }}>
                <MediaFill k={k} w={800} sizes="(max-width: 743px) 25vw, 20vw" style={{ objectPosition: POS[k] ?? '50% 35%' }} />
              </figure>
            ))}
          </div>
          <div className="pile__scrim" aria-hidden="true" />
          <div className="pile__center">
            <Rolling text={WORDS[0]} className="pile__word" mode="none" />
            <Brush text="Choose your game" mode="none" className="pile__brush" />
            <div className="pile__actions">
              <TransitionLink className="btn" href="/contact">
                Book a visit
              </TransitionLink>
              <TransitionLink className="btn btn--outline" href="/contact">
                Membership
              </TransitionLink>
            </div>
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
