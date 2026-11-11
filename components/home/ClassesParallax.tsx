'use client'

import { useRef, type CSSProperties } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from '@/lib/gsap'
import { initRolling, roll } from '@/lib/motion'
import { useNear, refreshSoon } from '@/lib/lazy'
import type { ClassItem } from '@/content/site'
import Rolling from '../ui/Rolling'
import MediaFill from '../ui/MediaFill'
import TransitionLink from '../ui/TransitionLink'
import { ClassIcon } from '../ui/Icons'
import './classes.css'

const SPEED = [1, 1.35, 0.8, 1.2, 0.9, 1.3, 0.85]
const LANES = ['2vw', '75vw', '3vw', '74vw', '2vw', '75vw', '3vw']
const LIFT = [0, 6, 2, 9, 4, 8, 1]

/** Parse every target's transform in one read pass so later tweens only write. */
const warm = (els: Element[]) => els.forEach((t) => gsap.getProperty(t, 'y'))

export default function ClassesParallax({ classes, copy }: { classes: ClassItem[]; copy: string }) {
  const root = useRef<HTMLElement>(null)
  const near = useNear(root)

  useGSAP(
    () => {
      const el = root.current
      if (!near || !el || prefersReduced()) return
      if (window.innerWidth <= 743) {
        const mword = el.querySelector<HTMLElement>('.classes__word')!
        const list = el.querySelector<HTMLElement>('.classes__cards')!
        const count = el.querySelector<HTMLElement>('.classes__cur')
        const fill = el.querySelector<HTMLElement>('.classes__fill')
        const mcards = gsap.utils.toArray<HTMLElement>('.ccard', el)
        warm([...mword.querySelectorAll('.char'), ...el.querySelectorAll('.classes__title > *'), ...mcards])

        const onScroll = () => {
          const first = mcards[0]
          if (!first) return
          const gap = mcards[1] ? mcards[1].offsetLeft - first.offsetLeft : first.offsetWidth
          const idx = Math.min(mcards.length - 1, Math.max(0, Math.round(list.scrollLeft / gap)))
          const max = list.scrollWidth - list.clientWidth
          const n = String(idx + 1).padStart(2, '0')
          if (count && count.textContent !== n) count.textContent = n
          if (fill) fill.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, list.scrollLeft / max)) : 0})`
        }
        onScroll()
        initRolling(mword)
        list.addEventListener('scroll', onScroll, { passive: true })

        let mtimer = 0
        const mst = ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          end: 'bottom top',
          onToggle(self) {
            window.clearInterval(mtimer)
            if (self.isActive) mtimer = window.setInterval(() => roll(mword, { word: 'CLASSES' }), 2000)
          },
        })

        const tween = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
        tween.from('.classes__title > *', { y: 36, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0)
        tween.from(mcards, { x: 60, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.2)

        return () => {
          window.clearInterval(mtimer)
          list.removeEventListener('scroll', onScroll)
          mst.kill()
          tween.scrollTrigger?.kill()
          tween.kill()
        }
      }
      const word = el.querySelector<HTMLElement>('.classes__word')!
      const title = el.querySelector<HTMLElement>('.classes__title')!
      const cards = gsap.utils.toArray<HTMLElement>('.ccard', el)
      warm([...word.querySelectorAll('.char'), title, ...cards])
      // card heights cached so each card's tween init doesn't force a layout after the previous card's write
      let hs = cards.map((c) => c.offsetHeight)
      initRolling(word)
      // queued ahead of the pin so this sorted refresh runs before (and supersedes) ScrollTrigger's own pin refresh
      refreshSoon()

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.classes__pin',
          start: 'top top',
          end: '+=420%',
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            hs = cards.map((c) => c.offsetHeight)
          },
        },
      })
      tl.fromTo(title, { scale: 0.86, autoAlpha: 0, y: 60 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0)
      cards.forEach((c, i) => {
        const s = SPEED[i % SPEED.length]
        const d = 2.4 / s
        const at = 0.15 + i * 0.7
        tl.fromTo(c, { y: 0 }, { y: () => -(window.innerHeight + hs[i] * 1.2), duration: d }, at)
      })

      let timer = 0
      const st = ScrollTrigger.create({
        trigger: '.classes__pin',
        start: 'top 60%',
        end: () => `+=${window.innerHeight * 4.6}`,
        onToggle(self) {
          window.clearInterval(timer)
          if (self.isActive) timer = window.setInterval(() => roll(word, { word: 'CLASSES' }), 2000)
        },
      })
      return () => {
        window.clearInterval(timer)
        st.kill()
      }
    },
    { scope: root, dependencies: [near] },
  )

  return (
    <section className="classes" data-theme="dark" ref={root}>
      <div className="classes__pin">
        <div className="classes__title">
          <Rolling text="CLASSES" className="classes__word" mode="none" />
          <p className="body-caps classes__copy">{copy}</p>
          <TransitionLink className="btn btn--outline" href="/classes">
            All classes
          </TransitionLink>
        </div>
        <ul className="classes__cards">
          {classes.map((c, i) => (
            <li key={c.slug} className="ccard ccard--over" style={{ '--lane': LANES[i % LANES.length], marginTop: `${LIFT[i % LIFT.length]}vw` } as CSSProperties}>
              <TransitionLink href={`/classes#${c.slug}`} className="ccard__link" aria-label={`${c.name}, ${c.tag}`}>
                <MediaFill k={c.media} w={800} sizes="(max-width: 743px) 74vw, 23vw" />
                <span className="ccard__body">
                  <ClassIcon name={c.icon} className="ccard__icon" />
                  <span className="display ccard__name">{c.name}</span>
                  <span className="pill">{c.tag}</span>
                </span>
              </TransitionLink>
            </li>
          ))}
        </ul>
        <div className="classes__prog" aria-hidden="true">
          <span className="classes__count">
            <span className="classes__cur">01</span> / {String(classes.length).padStart(2, '0')}
          </span>
          <span className="classes__track">
            <span className="classes__fill" />
          </span>
        </div>
      </div>
    </section>
  )
}
