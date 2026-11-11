import { gsap } from './gsap'

const cache = new WeakMap<SVGGeometryElement, { w: number; h: number; len: number }>()

/**
 * On-screen length of an SVG shape, allowing for a stretched viewBox (preserveAspectRatio="none").
 * Uniform scale is exact (length × scale); a stretched box is sampled sparsely and padded, since a
 * slightly long dash is invisible while a short one leaves a gap. Cached per element and box size.
 */
export function screenLength(el: SVGGeometryElement) {
  const svg = el.ownerSVGElement
  if (!svg) return 0
  const r = svg.getBoundingClientRect()
  const hit = cache.get(el)
  if (hit && hit.w === r.width && hit.h === r.height) return hit.len
  const vb = svg.viewBox.baseVal
  const sx = vb && vb.width ? r.width / vb.width : 1
  const sy = vb && vb.height ? r.height / vb.height : 1
  const total = el.getTotalLength()
  let len: number
  if (Math.abs(sx - sy) <= 0.01 * Math.max(sx, sy)) {
    len = total * Math.max(sx, sy)
  } else {
    const n = Math.min(40, Math.max(16, Math.ceil(total / 40)))
    let p = el.getPointAtLength(0)
    len = 0
    for (let i = 1; i <= n; i++) {
      const q = el.getPointAtLength((total * i) / n)
      len += Math.hypot((q.x - p.x) * sx, (q.y - p.y) * sy)
      p = q
    }
    len = len * 1.04 + 4
  }
  cache.set(el, { w: r.width, h: r.height, len })
  return len
}

/**
 * Draw strokes along their path as the page scrolls. With vector-effect: non-scaling-stroke the dash
 * pattern is measured in screen pixels, so the pathLength="1" trick does not work: measure instead.
 */
export function drawOnScroll(targets: gsap.DOMTarget, scrollTrigger: ScrollTrigger.Vars, stagger = 0) {
  const els = gsap.utils.toArray<SVGGeometryElement>(targets)
  const prime = () =>
    els.forEach((el) => {
      el.removeAttribute('pathLength')
      el.style.strokeDasharray = `${Math.ceil(screenLength(el)) + 2}`
      el.style.visibility = 'visible'
    })
  prime()
  return gsap.fromTo(
    els,
    { strokeDashoffset: (_i: number, el: SVGGeometryElement) => Math.ceil(screenLength(el)) + 2 },
    { strokeDashoffset: 0, ease: 'none', stagger, scrollTrigger: { ...scrollTrigger, invalidateOnRefresh: true, onRefresh: prime } },
  )
}
