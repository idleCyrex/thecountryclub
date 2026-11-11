import { getContent } from '@/lib/content'
import { pageMeta } from '@/lib/meta'
import { FAQ } from '@/content/faq'
import Faq from '@/components/Faq'
import PageHero from '@/components/PageHero'
import AxisWord from '@/components/AxisWord'
import PhotoRow from '@/components/PhotoRow'
import Reveal from '@/components/Reveal'
import HoursTable from '@/components/HoursTable'
import CtaBand from '@/components/CtaBand'
import MediaFill from '@/components/ui/MediaFill'

export const revalidate = 300
export const metadata = pageMeta(
  'Impulse Spa & Clinic: Massage, Body Wraps & THALGO Treatments',
  'Six treatment rooms in Sint Maarten. Relaxing massage, body wraps, Body Shine, waxing, mani-pedis, THALGO treatments and the Six Day Package.',
  '/spa',
  'spa-stones',
)

export default async function Spa() {
  const { copy, spa, settings } = await getContent()
  return (
    <>
      <PageHero title="IMPULSE SPA" brush="& clinic" intro={<p>{copy.spa[0]}</p>} media="v-spa" size="lg" />

      <section className="block" data-theme="dark">
        <Reveal className="block__text">
          <p className="body-caps" data-r="">
            {copy.spa[1]}
          </p>
        </Reveal>
      </section>

      <section className="block" data-theme="yellow">
        <h2 className="display block__title">THE MENU</h2>
        <Reveal as="ul" className="menu-list">
          {spa.map((t) => (
            <li key={t.slug} className="menu-list__row" data-r="">
              <span className="menu-list__cat">{t.category}</span>
              <h3 className="display menu-list__name">{t.name}</h3>
              <p className="menu-list__desc">{t.description}</p>
              {t.options && (
                <ul className="tags tags--dark">
                  {t.options.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </Reveal>
        <p className="body-caps menu-list__note">Full menus and prices at the spa desk · THALGO La Beauté Marine product lines</p>
      </section>

      <section className="block" data-theme="dark" aria-label="Impulse Spa film">
        <div className="spa-film">
          <MediaFill k="v-spa-cover" w={1200} className="spa-film__video" />
        </div>
      </section>

      <AxisWord word="RESTORE" brush="six rooms of healing" theme="dark" caption="Aromas · music · expert hands" />

      <section className="block" data-theme="dark">
        <PhotoRow keys={['spa-stones', 'spa-clinic', 'spa-salon', 'spa-nails']} />
        <Reveal className="block__text">
          <p className="body-caps" data-r="">
            {copy.spaAbout}
          </p>
        </Reveal>
      </section>

      <section className="block block--hours" data-theme="yellow">
        <HoursTable title="SPA HOURS" rows={settings.hours.spa} />
      </section>

      <Faq items={FAQ.spa} path="/spa" />
      <CtaBand word="TREAT YOURSELF" brush="you deserve it" primary={{ href: '/contact?interest=spa', label: 'Book a treatment' }} secondary={{ href: '/club-fitness', label: 'Club fitness' }} />
    </>
  )
}
