import { getContent } from '@/lib/content'
import { pageMeta } from '@/lib/meta'
import { FAQ } from '@/content/faq'
import Faq from '@/components/Faq'
import PageHero from '@/components/PageHero'
import AxisWord from '@/components/AxisWord'
import Tiles from '@/components/Tiles'
import PhotoRow from '@/components/PhotoRow'
import Reveal from '@/components/Reveal'
import CtaBand from '@/components/CtaBand'

export const revalidate = 300
export const metadata = pageMeta(
  'Tennis: Seven Lit Courts in Cole Bay',
  'Seven new tennis courts with shade, benches, night lighting and racket and ball rental, right next to the Courtside Cafe at Port de Plaisance, St. Maarten.',
  '/tennis',
  'tennis-court',
)

export default async function Tennis() {
  const { copy } = await getContent()
  return (
    <>
      <PageHero title="TENNIS" brush="ready to hit?" intro={<p>{copy.tennis[0]}</p>} media="v-tennis" />

      <section className="block" data-theme="dark">
        <Reveal>
          <Tiles
            cols={4}
            items={[
              { big: '7', title: 'New courts', line: 'Spread around the club' },
              { big: 'NIGHT', title: 'Lit for night play', line: 'Special lighting for a late game' },
              { big: 'RENT', title: 'Rackets & balls', line: 'No gear? No problem' },
              { big: 'SHADE', title: 'Benches courtside', line: 'For adults and kids alike' },
            ]}
          />
        </Reveal>
      </section>

      <AxisWord word="GAME SET" brush="under the lights" caption="Day and night, seven courts" />

      <section className="block" data-theme="dark">
        <PhotoRow keys={['tennis-court', 'tennis-night', 'tennis-shade', 'aerial-side']} />
        <Reveal className="block__text">
          <p className="body-caps" data-r="">
            {copy.tennis[1]}
          </p>
        </Reveal>
      </section>

      <Faq items={FAQ.tennis} path="/tennis" />
      <CtaBand word="BOOK A COURT" brush="game on" theme="yellow" primary={{ href: '/contact?interest=tennis', label: 'Court inquiry' }} secondary={{ href: '/pool', label: 'Then the pool' }} />
    </>
  )
}
