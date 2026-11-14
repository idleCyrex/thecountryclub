'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from '@/lib/gsap'
import { useNear, refreshSoon } from '@/lib/lazy'
import { media, srcSet } from '@/lib/media'
import { startScroll, stopScroll } from '@/lib/scroll'
import { DIMS } from '@/content/media-dims'
import './gallery.css'

export type GalPhoto = { k: string; cat: string; ar: number; alt: string }
export type GalTab = { id: string; label: string; n: number }

const TARGETS = [2.6, 4.2, 5.6, 4.2]

function rows(items: GalPhoto[]): GalPhoto[][] {
  const out: { list: GalPhoto[]; sum: number }[] = []
  let cur: GalPhoto[] = []
  let sum = 0
  let t = 0
  for (const p of items) {
    cur.push(p)
    sum += p.ar
    if (sum >= TARGETS[t % TARGETS.length]) {
      out.push({ list: cur, sum })
      cur = []
      sum = 0
      t++
    }
  }
  if (cur.length) {
    const prev = out[out.length - 1]
    if (sum < 2.2 && prev) {
      if (prev.sum + sum <= 6.4 || prev.list.length < 2) {
        prev.list.push(...cur)
        prev.sum += sum
        cur = []
      } else {
        const m = prev.list.pop()!
        prev.sum -= m.ar
        cur.unshift(m)
        sum += m.ar
      }
    }
    if (cur.length) out.push({ list: cur, sum })
  }
  return out.map((r) => r.list)
}

const pad = (n: number) => String(n).padStart(2, '0')
const size = (k: string) => DIMS[k] ?? [1200, 800]

export default function Gallery({ photos, tabs }: { photos: GalPhoto[]; tabs: GalTab[] }) {
  const [filter, setFilter] = useState('all')
  const list = useMemo(() => (filter === 'all' ? photos : photos.filter((p) => p.cat === filter)), [photos, filter])
  const grid = useMemo(() => rows(list), [list])
  const labels = useMemo(() => Object.fromEntries(tabs.map((t) => [t.id, t.label])), [tabs])
  const n = list.length

  const root = useRef<HTMLDivElement>(null)
  const gridEl = useRef<HTMLDivElement>(null)
  const near = useNear(root)

  const pick = (id: string) => {
    if (id === filter) return
    const g = gridEl.current
    if (!g || !near || prefersReduced()) {
      setFilter(id)
      return
    }
    gsap.to(g, { autoAlpha: 0, y: 12, duration: 0.2, overwrite: true, onComplete: () => setFilter(id) })
  }

  useGSAP(
    () => {
      const g = gridEl.current
      if (!g || prefersReduced()) return
      const items = gsap.utils.toArray<HTMLElement>('.gal__item', g)
      if (!near) {
        for (const t of items) {
          t.style.opacity = '0'
          t.style.visibility = 'hidden'
        }
        return
      }
      gsap.set(g, { autoAlpha: 1, y: 0 })
      gsap.set(items, { autoAlpha: 0, y: 40 })
      const enter = (b: Element[]) => gsap.to(b, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, overwrite: true })
      const edge = window.innerHeight * 0.95
      const now: HTMLElement[] = []
      const later: HTMLElement[] = []
      for (const t of items) (t.getBoundingClientRect().top < edge ? now : later).push(t)
      if (now.length) enter(now)
      if (later.length) ScrollTrigger.batch(later, { start: 'top 95%', once: true, onEnter: enter })
      refreshSoon()
    },
    { scope: root, dependencies: [near, filter], revertOnUpdate: true },
  )

  const [armed, setArmed] = useState(false)
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useState(0)
  const lb = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const origin = useRef<DOMRect | null>(null)
  const dir = useRef(0)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const prevOpen = useRef(false)
  const openRef = useRef(false)
  const curKey = useRef('')
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null)
  const swiped = useRef(false)

  const photo = list[cur] ?? list[0]
  openRef.current = open
  if (photo) curKey.current = photo.k

  useEffect(() => () => {
    if (openRef.current) startScroll()
  }, [])

  const show = (i: number, el: HTMLElement) => {
    origin.current = el.getBoundingClientRect()
    dir.current = 0
    setCur(i)
    setArmed(true)
    setOpen(true)
  }
  const go = (d: number) => {
    if (n < 2) return
    dir.current = d
    setCur((c) => (c + d + n) % n)
  }
  const jump = (i: number) => {
    if (i === cur) return
    dir.current = i > cur ? 1 : -1
    setCur(i)
  }
  const close = () => setOpen(false)

  useEffect(() => {
    const ov = lb.current
    const fr = frame.current
    if (!ov || !fr || prevOpen.current === open) return
    prevOpen.current = open
    const fast = prefersReduced()
    tl.current?.kill()
    if (open) {
      stopScroll()
      if (fast) {
        gsap.set(ov, { autoAlpha: 1 })
        closeBtn.current?.focus({ preventScroll: true })
        return
      }
      gsap.set(fr, { x: 0, y: 0, scale: 1 })
      const t = tl.current = gsap.timeline()
      t.fromTo(ov, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, 0)
      const o = origin.current
      if (o && o.width) {
        const f = fr.getBoundingClientRect()
        const s = o.width / f.width
        const x = o.left - f.left
        const y = o.top + o.height / 2 - (f.top + (f.height * s) / 2)
        t.fromTo(fr, { x, y, scale: s, transformOrigin: '0 0' }, { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, 0)
      }
      const chrome = ov.querySelectorAll('.gal-lb__count, .gal-lb__close, .gal-lb__nav, .gal-lb__cap, .gal-lb__strip')
      t.fromTo(chrome, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, 0.2)
      closeBtn.current?.focus({ preventScroll: true })
    } else {
      startScroll()
      if (fast) gsap.set(ov, { autoAlpha: 0 })
      else tl.current = gsap.timeline().to(ov, { autoAlpha: 0, duration: 0.3, ease: 'power2.out' })
      const tile = gridEl.current?.querySelector<HTMLElement>(`.gal__tile[data-k="${curKey.current}"]`)
      tile?.focus({ preventScroll: true })
    }
  }, [open])

  useLayoutEffect(() => {
    const d = dir.current
    dir.current = 0
    if (!open || !d || !img.current || prefersReduced()) return
    gsap.fromTo(img.current, { autoAlpha: 0, x: d * 40 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'expo.out' })
  }, [cur, open])

  useEffect(() => {
    if (!open || n < 2) return
    for (const d of [-1, 1]) {
      const k = list[(cur + d + n) % n].k
      const im = new Image()
      im.sizes = '92vw'
      const set = srcSet(k)
      if (set) im.srcset = set
      im.src = media(k, { w: 2000 })
    }
    const s = strip.current
    const th = s?.querySelector<HTMLElement>('[aria-current="true"]')
    if (s && th && s.offsetParent) {
      s.scrollTo({ left: th.offsetLeft - s.clientWidth / 2 + th.offsetWidth / 2, behavior: prefersReduced() ? 'auto' : 'smooth' })
    }
  }, [open, cur, list, n])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        go(e.key === 'ArrowLeft' ? -1 : 1)
        return
      }
      if (e.key !== 'Tab' || !lb.current) return
      const f = Array.from(lb.current.querySelectorAll<HTMLElement>('button')).filter((b) => b.getClientRects().length > 0)
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (!lb.current.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    refreshSoon()
  }, [filter])

  const onDown = (e: ReactPointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }
  const onUp = (e: ReactPointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) {
      swiped.current = true
      go(dx < 0 ? 1 : -1)
    }
  }
  const onBackdrop = (e: ReactMouseEvent) => {
    if (swiped.current) {
      swiped.current = false
      return
    }
    if (!(e.target as HTMLElement).closest('button, figure, .gal-lb__cap, .gal-lb__count, .gal-lb__strip')) close()
  }

  let idx = 0
  return (
    <div className="gal__wrap" ref={root}>
      <div className="gal__tabs" role="group" aria-label="Filter photos">
        {tabs.map((t) => (
          <button key={t.id} type="button" className="gal__tab" aria-pressed={filter === t.id} onClick={() => pick(t.id)}>
            <span className="gal__tab-word">{t.label}</span>
            <sup className="gal__tab-n">{t.n}</sup>
          </button>
        ))}
      </div>

      <div className="gal__grid" ref={gridEl}>
        {grid.map((row, r) => (
          <ul className="gal__row" key={r}>
            {row.map((p) => {
              const i = idx++
              const [w, h] = size(p.k)
              return (
                <li className="gal__item" key={p.k} style={{ '--ar': p.ar } as CSSProperties}>
                  <button
                    type="button"
                    className="gal__tile"
                    data-k={p.k}
                    aria-label={`View photo ${i + 1} of ${n}: ${p.alt}`}
                    onClick={(e) => show(i, e.currentTarget)}
                  >
                    <img
                      src={media(p.k, { w: 800 })}
                      srcSet={srcSet(p.k)}
                      sizes="(max-width: 743px) 100vw, 50vw"
                      alt=""
                      loading={r < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      width={w}
                      height={h}
                    />
                    <span className="gal__cap" aria-hidden="true">
                      <span className="gal__num">{pad(i + 1)}</span>
                      <span className="gal__name">{labels[p.cat] ?? p.cat}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ))}
      </div>

      {armed && photo &&
        createPortal(
          <div
            className="gal-lb"
            ref={lb}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            data-open={open}
            inert={!open}
            data-lenis-prevent
            onClick={onBackdrop}
          >
            <div className="gal-lb__top">
              <p className="gal-lb__count">
                {pad(cur + 1)}
                <span className="gal-lb__of"> / {pad(n)}</span>
              </p>
              <button type="button" className="gal-lb__close" ref={closeBtn} aria-label="Close photo viewer" onClick={close}>
                <span />
                <span />
              </button>
            </div>

            <div className="gal-lb__stage" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (swipe.current = null)}>
              <figure
                className="gal-lb__frame"
                ref={frame}
                style={{ '--ar': photo.ar, backgroundImage: `url("${media(photo.k, { w: 800 })}")` } as CSSProperties}
              >
                <img key={photo.k} ref={img} src={media(photo.k, { w: 2000 })} srcSet={srcSet(photo.k)} sizes="92vw" alt={photo.alt} draggable={false} />
              </figure>
            </div>

            <div className="gal-lb__foot">
              <div className="gal-lb__bar">
                <button type="button" className="gal-lb__nav gal-lb__nav--prev" aria-label="Previous photo" onClick={() => go(-1)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
                </button>
                <p className="gal-lb__cap">{photo.alt}</p>
                <button type="button" className="gal-lb__nav gal-lb__nav--next" aria-label="Next photo" onClick={() => go(1)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="gal-lb__strip" ref={strip}>
                {list.map((p, i) => (
                  <button
                    key={p.k}
                    type="button"
                    className="gal-lb__thumb"
                    style={{ '--ar': p.ar } as CSSProperties}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === cur ? 'true' : undefined}
                    onClick={() => jump(i)}
                  >
                    <img src={media(p.k, { w: 800 })} alt="" loading="lazy" decoding="async" draggable={false} />
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
