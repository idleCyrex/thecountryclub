'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { cover } from '@/lib/curtain'
import { prefersReduced } from '@/lib/gsap'

const prefetched = new Set<string>()

let busy = false
export const releaseNav = () => {
  busy = false
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }

/** Internal link that drops the curtain, swaps the route underneath, then RouteReveal lifts it. */
export default function TransitionLink({ href, children, onClick, onPointerEnter, onTouchStart, onFocus, ...rest }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const warm = () => {
    if (!href.startsWith('/') || href.startsWith('//') || href === pathname || prefetched.has(href)) return
    prefetched.add(href)
    router.prefetch(href)
  }

  const go = async (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    const target = new URL(href, window.location.href)
    if (target.pathname === pathname && target.search === window.location.search) return
    if (busy) return
    if (prefersReduced()) {
      router.push(href)
      return
    }
    busy = true
    router.prefetch(href)
    await cover()
    router.push(href)
  }

  return (
    <a
      href={href}
      onClick={go}
      onPointerEnter={(e) => {
        onPointerEnter?.(e)
        warm()
      }}
      onTouchStart={(e) => {
        onTouchStart?.(e)
        warm()
      }}
      onFocus={(e) => {
        onFocus?.(e)
        warm()
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
