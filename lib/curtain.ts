import { gsap, prefersReduced } from './gsap'
import { startScroll, stopScroll } from './scroll'

let covered = false
let booted = false
let waiters: Array<() => void> = []
const el = () => document.querySelector<HTMLElement>('.curtain')
const flush = () => {
  const w = waiters
  waiters = []
  w.forEach((f) => f())
}
/** True while the first-load preloader (html.is-loading, set by the head script) still covers the page. */
const booting = () => !booted && typeof document !== 'undefined' && document.documentElement.classList.contains('is-loading')

/** Called by the preloader as it lifts: lets intros waiting on whenRevealed() start. */
export function releaseBoot() {
  booted = true
  if (!covered) flush()
}

export const isCovered = () => covered

export function cover(): Promise<void> {
  const c = el()
  if (!c || prefersReduced()) return Promise.resolve()
  covered = true
  stopScroll()
  return new Promise((res) => {
    gsap.fromTo(c, { y: 0, yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power3.inOut', onComplete: () => res() })
  })
}

export function reveal(): Promise<void> {
  const c = el()
  if (!c || !covered) return Promise.resolve()
  return new Promise((res) => {
    gsap.fromTo(
      c,
      { y: 0, yPercent: 0 },
      {
        yPercent: -100,
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(c, { yPercent: 100 })
          covered = false
          startScroll()
          if (!booting()) flush()
          res()
        },
      },
    )
  })
}

/** Resolves once the curtain is out of the way (immediately if it isn't covering). */
export function whenRevealed(): Promise<void> {
  if (!covered && !booting()) return Promise.resolve()
  return new Promise((res) => waiters.push(res))
}
