import type { ReactElement, SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function ArrowDown(p: P) {
  return (
    <svg viewBox="0 0 40 64" width="28" height="44" aria-hidden="true" {...base} strokeWidth={2} {...p}>
      <path d="M20 2v58M4 44l16 16 16-16" />
    </svg>
  )
}

const CLASS_ICONS: Record<string, ReactElement> = {
  bike: (
    <>
      <circle cx="9" cy="30" r="7" />
      <circle cx="35" cy="30" r="7" />
      <path d="M9 30l8-14h12l6 14M17 16l-3-5h-4M29 16l-6 14H9M26 11h5" />
    </>
  ),
  lotus: (
    <>
      <path d="M22 36c-6-5-8-12-0-24 8 12 6 19 0 24z" />
      <path d="M22 36c-9 0-15-5-17-13 7-1 13 2 17 8M22 36c9 0 15-5 17-13-7-1-13 2-17 8" />
      <path d="M8 38h28" />
    </>
  ),
  core: (
    <>
      <circle cx="22" cy="9" r="4" />
      <path d="M22 13v12M12 19h20M22 25l-7 12M22 25l7 12" />
    </>
  ),
  flame: <path d="M22 39c-7 0-12-5-12-11 0-8 8-11 7-20 6 3 9 8 8 13 2-1 4-3 4-6 3 3 5 8 5 13 0 6-5 11-12 11z" />,
  whistle: (
    <>
      <circle cx="16" cy="27" r="9" />
      <path d="M22 20l16-6v8l-13 4M10 8l3 5M18 6v6M26 9l-3 5" />
    </>
  ),
  kids: (
    <>
      <circle cx="14" cy="10" r="4" />
      <circle cx="31" cy="13" r="3" />
      <path d="M14 14v12M8 20h12M14 26l-5 10M14 26l5 10M31 16v9M27 21h8M31 25l-3 8M31 25l3 8" />
    </>
  ),
  racket: (
    <>
      <ellipse cx="17" cy="16" rx="10" ry="12" transform="rotate(-35 17 16)" />
      <path d="M24 25l12 12M11 10l12 12M9 17l9-9M14 23l11-11" />
      <circle cx="36" cy="10" r="3" />
    </>
  ),
  // amenities
  cardio: (
    <>
      <path d="M22 37C10 29 5 22 5 15.5 5 10.5 9 7 13.5 7c3.6 0 6.4 2 8.5 5 2.1-3 4.9-5 8.5-5C35 7 39 10.5 39 15.5 39 22 34 29 22 37z" />
      <path d="M8 21h8l3-5 4 10 3-5h10" />
    </>
  ),
  kettlebell: (
    <>
      <circle cx="22" cy="27" r="11" />
      <path d="M14.5 19c-.8-5.6 2.6-10 7.5-10s8.3 4.4 7.5 10" />
      <path d="M18 27h8" />
    </>
  ),
  barbell: <path d="M4 22h36M9 15v14M13.5 11v22M30.5 11v22M35 15v14" />,
  group: (
    <>
      <circle cx="22" cy="12" r="4" />
      <circle cx="10" cy="16" r="3.4" />
      <circle cx="34" cy="16" r="3.4" />
      <path d="M15 36c0-6 3-10.5 7-10.5s7 4.5 7 10.5M4 34c0-5 2.6-8.5 6-8.5 2 0 3.6 1 4.7 2.6M40 34c0-5-2.6-8.5-6-8.5-2 0-3.6 1-4.7 2.6" />
    </>
  ),
  locker: (
    <>
      <rect x="9" y="5" width="26" height="34" rx="2" />
      <path d="M22 5v34M14 11h4M26 11h4M14 15h4M26 15h4M18 23v4M26 23v4" />
    </>
  ),
  wifi: (
    <>
      <path d="M6 18a23 23 0 0 1 32 0M11 24a16 16 0 0 1 22 0M16 30a9 9 0 0 1 12 0" />
      <circle cx="22" cy="35" r="1.6" />
    </>
  ),
  cup: (
    <>
      <path d="M8 18h22v7a11 11 0 0 1-22 0z" />
      <path d="M30 20h2.5a4 4 0 0 1 0 8H30M6 39h26M14 6c-2 2 2 4 0 7M20 6c-2 2 2 4 0 7M26 6c-2 2 2 4 0 7" />
    </>
  ),
  shaker: (
    <>
      <path d="M15 13h14l-2 24a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2z" />
      <path d="M14 8h16v5H14zM19 4h6v4M16 23h12" />
    </>
  ),
  towel: (
    <>
      <path d="M8 9h22a5 5 0 0 1 5 5v22H13a5 5 0 0 1-5-5z" />
      <path d="M8 14a5 5 0 0 0 5 5h22M17 27h10" />
    </>
  ),
  umbrella: (
    <>
      <path d="M4 22a18 18 0 0 1 36 0z" />
      <path d="M22 4v2M22 22v12a4 4 0 0 1-8 0M16 22c0-7 2.5-12.5 6-16 3.5 3.5 6 9 6 16" />
    </>
  ),
  float: (
    <>
      <circle cx="22" cy="22" r="15" />
      <circle cx="22" cy="22" r="7" />
      <path d="M11.4 11.4l5.6 5.6M32.6 11.4L27 17M11.4 32.6L17 27M32.6 32.6L27 27" />
    </>
  ),
  plate: (
    <>
      <circle cx="23" cy="24" r="11" />
      <circle cx="23" cy="24" r="6" />
      <path d="M5 8v8a3 3 0 0 0 3 3v17M8 8v7M11 8v8a3 3 0 0 1-3 3M40 8c-3 2-4 6-4 10h4v18" />
    </>
  ),
}

export function ClassIcon({ name, ...p }: P & { name: string }) {
  return (
    <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" {...base} {...p}>
      {CLASS_ICONS[name] ?? CLASS_ICONS.flame}
    </svg>
  )
}

export function Wordmark(p: P) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...p}>
      <rect width="64" height="64" rx="14" fill="#10AFC1" />
      <path d="M29 19a13 13 0 1 0 0 26" fill="none" stroke="#06141A" strokeWidth="6" strokeLinecap="round" />
      <path d="M47 19a13 13 0 1 0 0 26" fill="none" stroke="#06141A" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
