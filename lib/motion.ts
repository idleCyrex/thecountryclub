import { gsap } from './gsap'

const esc = (c: string) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c)

export function charsHTML(word: string) {
  return [...word].map((c) => `<span class="char">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')
}

export function rollingHTML(word: string) {
  return `<span class="first" aria-hidden="true">${charsHTML(word)}</span><span class="last" aria-hidden="true">${charsHTML(word)}</span>`
}

type RollState = { first: HTMLElement; last: HTMLElement; busy: boolean; tl?: gsap.core.Timeline }
const rolls = new WeakMap<HTMLElement, RollState>()

/** GSAP reads computed style on first touch of an element; do all reads in one pass before any writes. */
function warm(els: Element[]) {
  for (const el of els) if (!(el as unknown as { _gsap?: unknown })._gsap) gsap.getProperty(el, 'scaleY')
}

function prime(r: RollState) {
  const a = Array.from(r.first.children)
  const b = Array.from(r.last.children)
  const all = a.concat(b)
  gsap.killTweensOf(all)
  warm(all)
  gsap.set(a, { scaleY: 1, transformOrigin: '50% 0%' })
  gsap.set(b, { scaleY: 0, transformOrigin: '50% 100%' })
}

/** Prepare a server-rendered `.rolling` element. startWord '' = enter from nothing. */
export function initRolling(el: HTMLElement, startWord?: string) {
  const first = el.querySelector<HTMLElement>(':scope > .first')
  const last = el.querySelector<HTMLElement>(':scope > .last')
  if (!first || !last) return null
  rolls.get(el)?.tl?.kill()
  if (startWord !== undefined) first.innerHTML = charsHTML(startWord)
  const r: RollState = { first, last, busy: false }
  rolls.set(el, r)
  prime(r)
  el.classList.remove('is-rolling')
  el.classList.add('is-ready')
  return r
}

/** initRolling for many elements, skipping ones already primed: every style read happens before any write. */
export function initRollingAll(els: HTMLElement[]) {
  const fresh = els.filter((el) => !rolls.has(el))
  if (!fresh.length) return
  warm(fresh.flatMap((el) => Array.from(el.querySelectorAll(':scope > .first > *, :scope > .last > *'))))
  fresh.forEach((el) => initRolling(el))
}

/**
 * Split-flap roll: each char of the old copy squashes up (scaleY 1 to 0, origin top) while the same
 * char of the new copy grows from the baseline (0 to 1, origin bottom), staggered left to right.
 * Roles swap afterwards. `force` finishes a roll in flight instead of skipping.
 */
export function roll(
  el: HTMLElement,
  {
    word,
    duration = 0.8,
    stagger = 0.04,
    ease = 'power3.inOut',
    force = false,
  }: { word?: string; duration?: number; stagger?: number; ease?: string; force?: boolean } = {},
) {
  let r = rolls.get(el)
  if (!r || !el.contains(r.first) || !el.contains(r.last)) r = initRolling(el) ?? undefined
  if (!r) return gsap.timeline()
  if (r.busy) {
    if (!force || !r.tl) return gsap.timeline()
    r.tl.progress(1)
    r = rolls.get(el)!
  }
  const cur = r
  cur.busy = true
  if (word) {
    cur.last.innerHTML = charsHTML(word)
    el.setAttribute('aria-label', word)
  }
  const out = Array.from(cur.first.children)
  const inn = Array.from(cur.last.children)
  warm(inn)
  warm(out)
  gsap.set(inn, { scaleY: 0, transformOrigin: '50% 100%' })
  gsap.set(out, { transformOrigin: '50% 0%' })
  el.classList.add('is-rolling')
  const done = () => {
    cur.busy = false
    el.classList.remove('is-rolling')
    const next: RollState = { first: cur.last, last: cur.first, busy: false }
    next.first.classList.replace('last', 'first')
    next.last.classList.replace('first', 'last')
    el.insertBefore(next.first, next.last)
    rolls.set(el, next)
    prime(next)
  }
  const tl = gsap.timeline({ onComplete: done })
  if (out.length) tl.to(out, { scaleY: 0, duration, stagger, ease }, 0)
  if (inn.length) tl.to(inn, { scaleY: 1, duration, stagger, ease }, 0)
  if (!out.length && !inn.length) tl.to({}, { duration: 0.01 })
  cur.tl = tl
  return tl
}

/** Stop any roll in flight on `el` (unmount cleanup). */
export function killRolling(el: HTMLElement) {
  const r = rolls.get(el)
  r?.tl?.kill()
  rolls.delete(el)
}

/** Re-roll on an interval (same word, or cycling through `words`). Returns a stop function. */
export function rollEvery(el: HTMLElement, { every = 2.4, words }: { every?: number; words?: string[] } = {}) {
  let i = 0
  const id = window.setInterval(() => {
    if (document.hidden) return
    roll(el, words?.length ? { word: words[++i % words.length] } : {})
  }, every * 1000)
  return () => window.clearInterval(id)
}

/** Brush write-on: reveal `.split-block` children with a left-to-right clip wipe. Generous insets so the
 *  slanted marker glyphs and their overhang are never cropped. */
export function brushWrite(el: Element | null, { duration = 0.7, stagger = 0.18, delay = 0 } = {}) {
  if (!el) return gsap.timeline()
  const blocks = Array.from(el.querySelectorAll<HTMLElement>('.split-block'))
  return gsap.fromTo(
    blocks,
    { clipPath: 'inset(-60% 100% -60% -40%)' },
    {
      clipPath: 'inset(-60% -40% -60% -40%)',
      duration,
      stagger,
      delay,
      ease: 'power2.out',
    },
  )
}

/* ---------- waterline type ---------- */
const TAU = Math.PI * 2
const wy = (t: number) => 200 - 100 * (0.72 * Math.sin(TAU * t) + 0.28 * Math.sin(2 * TAU * t + 1.1))
const wdy = (t: number) => -100 * TAU * (0.72 * Math.cos(TAU * t) + 0.56 * Math.cos(2 * TAU * t + 1.1))

/** Wave edge as cubic segments: 1000 units per tile, 400 tall, rest line at y 200, crest/trough within 100..300. */
export function wavePath(tiles = 1, seg = 8) {
  const r = (n: number) => Math.round(n * 10) / 10
  const k = 1 / seg / 3
  let d = `M0 ${r(wy(0))}`
  for (let i = 0; i < tiles * seg; i++) {
    const t0 = i / seg
    const t1 = (i + 1) / seg
    d += `C${r((t0 + k) * 1000)} ${r(wy(t0) + wdy(t0) * k)} ${r((t1 - k) * 1000)} ${r(wy(t1) - wdy(t1) * k)} ${r(t1 * 1000)} ${r(wy(t1))}`
  }
  return d
}

/** Mask tile: opaque above ('up') or below ('down') the wave edge. */
export function waveMask(side: 'up' | 'down') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" preserveAspectRatio="none"><path d="${wavePath()}V${side === 'up' ? 0 : 400}H0Z"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** Crest tile: the wave edge as a stroke (`w` in tile units), used as a mask over a light fill. */
export function waveCrest(w = 21) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" preserveAspectRatio="none"><path d="${wavePath()}" fill="none" stroke="#000" stroke-width="${w.toFixed(1)}"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

interface WaterlineOpts {
  animate?: boolean
  /** start with the waterline below the text, waiting for rise() */
  low?: boolean
  /** rest height as a fraction of the block */
  rest?: number
}

/**
 * Drives `.wl` waterline type with transforms only: the sea (masks + crest) drifts one wavelength on a loop
 * while both text copies counter-translate so the glyphs stay put. Idle drift runs only while on screen.
 */
export function waterline(root: HTMLElement, { animate = true, low = false, rest = 0.58 }: WaterlineOpts = {}) {
  const sea = root.querySelector<HTMLElement>('.wl__sea')
  const crest = root.querySelector<HTMLElement>('.wl__crest')
  const strip = root.querySelector<HTMLElement>('.wl__strip')
  const copies = Array.from(root.querySelectorAll<HTMLElement>('.wl__copy'))
  const turb = root.querySelector('feTurbulence')
  const disp = root.querySelector('feDisplacementMap')
  const s = { rise: animate && low ? 0 : 1, x: 0, bob: 0 }
  let H = 0
  let L = 0
  let A = 0

  const apply = () => {
    if (!sea || !H) return
    const y = H + 3 * A + (H * rest - H - 3 * A) * s.rise + s.bob
    sea.style.transform = `translate3d(${s.x}px,${y}px,0)`
    const back = `translate3d(${-s.x}px,${-y}px,0)`
    for (const c of copies) c.style.transform = back
    if (crest) crest.style.transform = `translate3d(0,${y}px,0)`
    if (strip) strip.style.transform = `translate3d(${s.x}px,0,0)`
  }

  const measure = () => {
    const fs = parseFloat(getComputedStyle(root).fontSize)
    if (!fs) return
    H = root.offsetHeight
    L = Math.round(fs * 1.1)
    A = Math.max(1.5, Math.round(fs * 0.07) / 2)
    root.style.setProperty('--wl-l', `${L}px`)
    root.style.setProperty('--wl-a', `${A}px`)
    root.style.setProperty('--wl-crest-img', waveCrest((Math.min(3, Math.max(1.25, fs * 0.0075)) * 100) / A))
    turb?.setAttribute('baseFrequency', `${(0.35 / fs).toFixed(5)} ${(3.2 / fs).toFixed(5)}`)
    disp?.setAttribute('scale', (fs * 0.07).toFixed(1))
    if (animate) apply()
  }

  const tick = (time: number) => {
    s.x = -((time / 7) % 1) * L
    s.bob = Math.sin(time * 1.1) * A * 0.4
    apply()
  }
  let on = false
  const io = animate
    ? new IntersectionObserver(([e]) => {
        if (e.isIntersecting === on) return
        on = e.isIntersecting
        if (on) gsap.ticker.add(tick)
        else gsap.ticker.remove(tick)
      })
    : null
  io?.observe(root)
  const ro = new ResizeObserver(measure)
  ro.observe(root)
  measure()

  /** Scrubbed rise from below the text to the rest line. */
  const rise = (tl: gsap.core.Timeline, at = 0, duration = 1) =>
    tl.fromTo(s, { rise: 0 }, { rise: 1, duration, ease: 'power2.out', onUpdate: apply }, at)

  const kill = () => {
    io?.disconnect()
    ro.disconnect()
    gsap.ticker.remove(tick)
  }
  return { measure, rise, kill }
}

/** Seamless marquee: the track must contain two identical halves. */
export function marquee(track: HTMLElement, { duration = 24, reverse = false } = {}) {
  return gsap.fromTo(track, { xPercent: reverse ? -50 : 0 }, { xPercent: reverse ? 0 : -50, duration, ease: 'none', repeat: -1 })
}
