export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.countryclubpdp.com').replace(/\/$/, '')

export const ROUTES = [
  { href: '/', label: 'Home' },
  { href: '/club-fitness', label: 'Club Fitness' },
  { href: '/classes', label: 'Classes' },
  { href: '/tennis', label: 'Tennis' },
  { href: '/pool', label: 'Pool' },
  { href: '/spa', label: 'Impulse Spa' },
  { href: '/team', label: 'Team' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
] as const

export const MENU = [{ href: '/contact?interest=membership', label: 'Join the Club' }, ...ROUTES]
