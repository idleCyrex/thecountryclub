import { getContent } from '@/lib/content'
import { pageMeta } from '@/lib/meta'
import PageHero from '@/components/PageHero'
import Reveal from '@/components/Reveal'
import CtaBand from '@/components/CtaBand'
import YouTubeLite from '@/components/YouTubeLite'
import MediaFill from '@/components/ui/MediaFill'

export const revalidate = 300
export const metadata = pageMeta(
  'Gallery & Club Life Episodes',
  'Photos of the gym, courts, pool and Impulse Spa, plus the Club Life video episodes from the Country Club at Port de Plaisance.',
  '/gallery',
  'pool-party',
)

const PHOTOS = [
  'aerial-club', 'gym-highfive', 'pool-party', 'tennis-night', 'gym-deadlift', 'spa-stones', 'pool-yoga', 'gym-flex',
  'tennis-court', 'gym-duo', 'kids', 'gym-cable', 'pool', 'spa-clinic', 'gym-rack', 'pool-lounge', 'gym-stretch',
  'tennis-shade', 'gym-seated', 'carnival', 'gym-cardio', 'spa-salon', 'aerial-side', 'gym-bike',
]

export default async function Gallery() {
  const { settings, copy } = await getContent()
  return (
    <>
      <PageHero title="GALLERY" brush="club life" intro={<p>{copy.gallery}</p>} />

      <section className="block" data-theme="dark">
        <Reveal as="ul" className="masonry">
          {PHOTOS.map((k) => (
            <li key={k} data-r="">
              <MediaFill k={k} w={800} sizes="(max-width: 743px) 50vw, 25vw" />
            </li>
          ))}
        </Reveal>
      </section>

      <section className="block" data-theme="yellow">
        <h2 className="display block__title">CLUB LIFE</h2>
        <ul className="episodes">
          {settings.youtube.map((v) => (
            <li key={v.id}>
              <YouTubeLite id={v.id} title={v.title} />
            </li>
          ))}
        </ul>
      </section>

      <CtaBand word="SEE YOU SOON" brush="come visit" primary={{ href: '/contact?interest=membership', label: 'Book a visit' }} />
    </>
  )
}
