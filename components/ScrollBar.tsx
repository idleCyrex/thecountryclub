'use client'

import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger, prefersReduced } from '@/lib/gsap'
import { getLenis } from '@/lib/scroll'
import './scrollbar.css'

const INSET = 14
const RADIUS = 7

export default function ScrollBar() {
  const [on, setOn] = useState<boolean | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const ball = useRef<HTMLDivElement>(null)
  const spin = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const sync = () => setOn(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const cl = document.documentElement.classList
    if (on === null || cl.contains('has-sb') === on) return
    cl.toggle('has-sb', on)
    ScrollTrigger.refresh()
  }, [on])

  useEffect(() => {
    if (!on) return
    const el = root.current!
    const fillEl = fill.current!
    const ballEl = ball.current!
    const spinEl = spin.current!
    const reduced = prefersReduced()

    let trackH = 0
    let maxScroll = 1
    let lastY = 0
    let rot = 0
    let raf = 0
    let idle = 0
    let dragging = false
    let hovering = false

    const measure = () => {
      trackH = Math.max(1, window.innerHeight - INSET * 2)
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      el.dataset.fit = document.documentElement.scrollHeight <= window.innerHeight + 1 ? 'false' : 'true'
    }

    const render = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll))
      const y = p * trackH
      ballEl.style.transform = `translate3d(0,${y}px,0)`
      fillEl.style.transform = `scaleY(${p})`
      if (!reduced) {
        rot += ((y - lastY) / RADIUS) * (180 / Math.PI)
        spinEl.style.transform = `rotate(${rot}deg)`
      }
      lastY = y
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(render)
    }

    const wake = () => {
      el.dataset.idle = 'false'
      clearTimeout(idle)
      idle = window.setTimeout(() => {
        if (!dragging && !hovering) el.dataset.idle = 'true'
      }, 1200)
    }

    const onScroll = () => {
      queue()
      wake()
    }
    const remeasure = () => {
      measure()
      queue()
    }

    measure()
    lastY = Math.min(1, window.scrollY / maxScroll) * trackH
    render()
    wake()

    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', remeasure)
    ScrollTrigger.addEventListener('refresh', remeasure)

    const goTo = (y: number, smooth: boolean) => {
      const lenis = getLenis()
      const target = Math.min(maxScroll, Math.max(0, y))
      if (lenis) lenis.scrollTo(target, smooth ? { duration: 1.1 } : { immediate: true, force: true })
      else window.scrollTo({ top: target, behavior: smooth && !reduced ? 'smooth' : 'auto' })
    }
    const yToScroll = (clientY: number) => {
      const top = el.getBoundingClientRect().top + INSET
      return ((clientY - top) / trackH) * maxScroll
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      const onBall = ballEl.contains(e.target as Node)
      e.preventDefault()
      if (!onBall) {
        goTo(yToScroll(e.clientY), true)
        return
      }
      dragging = true
      el.dataset.drag = 'true'
      el.setPointerCapture(e.pointerId)
      wake()
    }
    const onMove = (e: PointerEvent) => {
      if (dragging) goTo(yToScroll(e.clientY), false)
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      el.dataset.drag = 'false'
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      wake()
    }
    const onEnter = () => {
      hovering = true
      wake()
    }
    const onLeave = () => {
      hovering = false
      wake()
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(idle)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', remeasure)
      ScrollTrigger.removeEventListener('refresh', remeasure)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [on])

  if (!on) return null

  return (
    <div className="sb" ref={root} aria-hidden="true" data-idle="false" data-drag="false" data-fit="true">
      <div className="sb-track" />
      <div className="sb-fill" ref={fill} />
      <div className="sb-ball" ref={ball}>
        <div className="sb-ball-in">
          <div className="sb-spin" ref={spin}>
            <svg viewBox="0 0 22 22" width="22" height="22" focusable="false">
              <defs>
                <radialGradient id="sb-felt" cx="34%" cy="30%" r="80%">
                  <stop offset="0" stopColor="#f0ff8a" />
                  <stop offset="0.45" stopColor="#d9f24a" />
                  <stop offset="1" stopColor="#a9c224" />
                </radialGradient>
              </defs>
              <circle cx="11" cy="11" r="11" fill="url(#sb-felt)" />
              <path d="M3.2 3.4C8 6.2 8 15.8 3.2 18.6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M18.8 3.4C14 6.2 14 15.8 18.8 18.6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
