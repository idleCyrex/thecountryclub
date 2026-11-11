import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
  ScrollTrigger.config({ ignoreMobileResize: true })
}

export { gsap, ScrollTrigger, useGSAP }

export const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isSmall = () => typeof window !== 'undefined' && window.innerWidth < 743
