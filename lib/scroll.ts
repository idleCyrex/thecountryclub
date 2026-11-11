import type Lenis from 'lenis'

let lenis: Lenis | null = null
let wantStopped = false

export const setLenis = (l: Lenis | null) => {
  lenis = l
  if (l && wantStopped) l.stop()
}
export const getLenis = () => lenis

export function stopScroll() {
  wantStopped = true
  lenis?.stop()
}
export function startScroll() {
  wantStopped = false
  lenis?.start()
}
export function scrollTop() {
  lenis?.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
}
