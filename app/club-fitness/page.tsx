import { getContent } from '@/lib/content'
import { pageMeta } from '@/lib/meta'
import { FAQ } from '@/content/faq'
import Faq from '@/components/Faq'
import PageHero from '@/components/PageHero'
import AxisWord from '@/components/AxisWord'
import Tiles from '@/components/Tiles'
import { ClassIcon } from '@/components/ui/Icons'
import PhotoRow from '@/components/PhotoRow'
import Reveal from '@/components/Reveal'
import HoursTable from '@/components/HoursTable'
import CtaBand from '@/components/CtaBand'

const AMENITY_ICON: Record<string, string> = {
  cardio: 'cardio',
  'leg-room': 'kettlebell',
  'main-floor': 'barbell',
  trainers: 'whistle',
  classes: 'group',
  'kids-rooms': 'kids',
  lockers: 'locker',
  'towels-wifi': 'wifi',
  cafe: 'cup',
  supplements: 'shaker',
}

export const revalidate = 300
export const metadata = pageMeta(
  'Club Fitness: Life Fitness Gym in St. Maarten',
  'A Life Fitness gym with a cardio area, a leg room and a main floor. Personal trainers, group classes, kids activities, a sauna and locker rooms at Port de Plaisance, Cole Bay.',
  '/club-fitness',
  'gym-cardio',
)

export default async function ClubFitness() {
  const { copy, facilities, settings } = await getContent()
  return (
    <>
      <PageHero title="CLUB FITNESS" brush="train hard" intro={<p>{copy.fitness[0]}</p>} media="v-dumbbell" />

      <section className="block" data-theme="dark">
        <Reveal className="block__text">
          <p className="body-caps" data-r="">
            {copy.fitness[1]}
          </p>
        </Reveal>
      </section>

      <AxisWord word="LIFE FITNESS" brush="top of the line" caption="Cardio area · Leg room · Main gym floor" />

      <section className="block" data-theme="dark">
        <h2 className="display block__title">THE FLOOR</h2>
        <Reveal>
          <Tiles cols={5} items={facilities.filter((f) => f.group === 'amenity').map((f) => ({ title: f.title, line: f.line, icon: <ClassIcon name={AMENITY_ICON[f.slug] ?? 'flame'} /> }))} />
        </Reveal>
        <PhotoRow keys={['gym-floor', 'gym-coach', 'gym-legpress', 'gym-stair']} tall />
        <Reveal className="block__text block__text--two">
          <p className="body-caps" data-r="">
            {copy.fitness[2]}
          </p>
          <p className="body-caps" data-r="">
            {copy.fitness[3]}
          </p>
        </Reveal>
      </section>

      <section className="block block--hours" data-theme="yellow">
        <HoursTable title="GYM HOURS" rows={settings.hours.gym} />
      </section>

      <Faq items={FAQ.fitness} path="/club-fitness" />
      <CtaBand word="JOIN NOW" brush="first visit" primary={{ href: '/contact?interest=membership', label: 'Membership inquiry' }} secondary={{ href: '/classes', label: 'See classes' }} />
    </>
  )
}
