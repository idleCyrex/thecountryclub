import type { Metadata, Viewport } from 'next'
import { Roboto_Flex, Roboto_Slab, Hanken_Grotesk, Permanent_Marker } from 'next/font/google'
import './tokens.css'
import './site.css'
import SmoothScroll from '@/components/SmoothScroll'
import Nav from '@/components/Nav'
import Curtain from '@/components/Curtain'
import ScrollBar from '@/components/ScrollBar'
import Preloader from '@/components/Preloader'
import { SETTINGS } from '@/content/site'
import { SITE_URL } from '@/lib/site'
import { media } from '@/lib/media'

const flex = Roboto_Flex({ subsets: ['latin'], axes: ['wdth'], variable: '--font-flex', display: 'swap' })
const slab = Roboto_Slab({ subsets: ['latin'], weight: ['800'], variable: '--font-roboto-slab', display: 'swap', preload: false })
const hanken = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-hanken', display: 'swap' })
const marker = Permanent_Marker({ subsets: ['latin'], weight: '400', variable: '--font-marker', display: 'swap', preload: false })

const ogImage = media('aerial-club', { w: 1200 })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'The Country Club at Port de Plaisance | Gym, Tennis, Pool & Spa in St. Maarten',
    template: '%s | The Country Club at Port de Plaisance',
  },
  description:
    'A Life Fitness gym, group classes, seven lit tennis courts, a members-only pool and the Impulse Spa & Clinic in Cole Bay, St. Maarten.',
  applicationName: 'The Country Club at Port de Plaisance',
  openGraph: {
    type: 'website',
    siteName: 'The Country Club at Port de Plaisance',
    locale: 'en_US',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'The Country Club at Port de Plaisance: gym, classes, tennis, pool and spa in St. Maarten' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: '#06141A',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['HealthClub', 'LocalBusiness'],
  '@id': `${SITE_URL}/#club`,
  name: SETTINGS.name,
  url: SITE_URL,
  image: ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`,
  telephone: SETTINGS.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '155 Union Road, Port de Plaisance',
    addressLocality: SETTINGS.address.locality,
    addressRegion: SETTINGS.address.region,
    addressCountry: SETTINGS.address.country,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '06:00', closes: '22:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '07:00', closes: '21:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '09:00', closes: '13:00' },
  ],
  amenityFeature: ['Life Fitness gym', 'Group classes', 'Seven lit tennis courts', "Members' pool", 'Sauna', 'Locker rooms', 'Café', 'Juice bar'].map((name) => ({
    '@type': 'LocationFeatureSpecification',
    name,
    value: true,
  })),
  sameAs: [SETTINGS.socials.facebook, SETTINGS.socials.instagram],
  parentOrganization: { '@type': 'Organization', name: SETTINGS.group.name },
  department: {
    '@type': 'DaySpa',
    name: 'Impulse Spa & Clinic',
    telephone: SETTINGS.phone,
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '09:00', closes: '13:00' },
    ],
  },
}

const siteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SETTINGS.name,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#club` },
}

// has-sb is set before first paint: toggling the native scrollbar after GSAP pins are measured leaves them 15px narrow.
// is-loading shows the preloader from the very first paint (not on phones: the hero shows straight away); components/Preloader lifts it.
// manual scroll restoration: a refresh always starts at the top instead of jumping back mid-page.
const motionFlag = `try{if('scrollRestoration' in history)history.scrollRestoration='manual';var c=document.documentElement.classList;if(!matchMedia('(max-width: 743px)').matches)c.add('is-loading');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)c.add('motion');if(matchMedia('(pointer: fine)').matches)c.add('has-sb')}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${flex.variable} ${slab.variable} ${hanken.variable} ${marker.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      </head>
      <body>
        <Preloader />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <Nav />
        <Curtain />
        <ScrollBar />
        {children}
      </body>
    </html>
  )
}
