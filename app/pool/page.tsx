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
import CtaBand from '@/components/CtaBand'

export const revalidate = 300
export const metadata = pageMeta(
  "The Pool: Members' Pool at Port de Plaisance",
  'A members-only pool with towels, chairs, umbrellas, swimming floats and food brought poolside from the Courtside Cafe.',
  '/pool',
  'pool',
)

export default async function Pool() {
  const { copy } = await getContent()
  return (
    <>
      <PageHero title="THE POOL" brush="members only" intro={<p>{copy.pool[0]}</p>} media="v-pool" />

      <section className="block" data-theme="dark">
        <Reveal>
          <Tiles
            cols={4}
            items={[
              { title: 'Luxury towels', line: 'Always provided', icon: <ClassIcon name="towel" /> },
              { title: 'Chairs & umbrellas', line: 'Shade whenever you want it', icon: <ClassIcon name="umbrella" /> },
              { title: 'Swimming floats', line: 'Bring the party', icon: <ClassIcon name="float" /> },
              { title: 'Poolside food', line: 'Straight from the Courtside Cafe', icon: <ClassIcon name="plate" /> },
            ]}
          />
        </Reveal>
      </section>

      <AxisWord word="COOL OFF" brush="poolside" theme="yellow" caption="Swim laps · lounge · bring the family" />

      <section className="block" data-theme="dark">
        <PhotoRow keys={['pool-party', 'pool-yoga', 'pool-lounge', 'pool-walk']} tall />
        <Reveal className="block__text">
          <p className="body-caps" data-r="">
            {copy.pool[1]}
          </p>
        </Reveal>
      </section>

      <Faq items={FAQ.pool} path="/pool" />
      <CtaBand word="DIVE IN" brush="the more the better" primary={{ href: '/contact?interest=membership', label: 'Become a member' }} secondary={{ href: '/spa', label: 'Impulse Spa' }} />
    </>
  )
}
