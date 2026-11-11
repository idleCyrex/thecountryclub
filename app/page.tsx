import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getContent } from '@/lib/content'
import Hero from '@/components/home/Hero'
import WaterlineIntro from '@/components/home/WaterlineIntro'
import GridStack from '@/components/home/GridStack'
import BoldFitness from '@/components/home/BoldFitness'
import ClassesParallax from '@/components/home/ClassesParallax'
import SpaProduct from '@/components/home/SpaProduct'

export const revalidate = 300

export const metadata: Metadata = {
  title: { absolute: 'The Country Club at Port de Plaisance | Gym, Tennis, Pool & Spa in St. Maarten' },
  alternates: { canonical: '/' },
}

export default async function Home() {
  const { classes, facilities, settings, copy } = await getContent()
  const gym = settings.hours.gym
  const hoursLine = `Gym open ${gym.map((h) => `${h.days.replace('Monday to Friday', 'Mon to Fri').replace('Saturday', 'Sat').replace('Sunday', 'Sun')} ${h.time.replace(/:00/g, '')}`).join(' · ')}`
  const spaHours = `Spa ${settings.hours.spa.map((h) => `${h.days.replace('Monday to Saturday', 'Mon to Sat').replace('Sunday', 'Sun')} ${h.time.replace(/:00/g, '')}`).join(' · ')}`

  return (
    <>
      <Hero hours={hoursLine} />
      {/* separate boundaries let React hydrate below-the-fold sections in their own short tasks */}
      <Suspense>
        <WaterlineIntro copy={copy.intro} />
      </Suspense>
      <Suspense>
        <GridStack facilities={facilities.filter((f) => f.group === 'home')} />
      </Suspense>
      <Suspense>
        <BoldFitness />
      </Suspense>
      <Suspense>
        <ClassesParallax classes={classes} copy={copy.classes} />
      </Suspense>
      <Suspense>
        <SpaProduct copy={copy.spa[0]} hours={spaHours} />
      </Suspense>
    </>
  )
}
