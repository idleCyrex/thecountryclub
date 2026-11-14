import { getContent } from '@/lib/content'
import { pageMeta } from '@/lib/meta'
import PageHero from '@/components/PageHero'
import CtaBand from '@/components/CtaBand'
import YouTubeLite from '@/components/YouTubeLite'
import Gallery, { type GalPhoto, type GalTab } from '@/components/Gallery'
import { altOf } from '@/lib/media'
import { DIMS } from '@/content/media-dims'

export const revalidate = 300
export const metadata = pageMeta(
  'Gallery & Club Life Episodes',
  'Photos of the gym, courts, pool and Impulse Spa, plus the Club Life video episodes from the Country Club at Port de Plaisance.',
  '/gallery',
  'pool-party',
)

const ORDER = [
  'aerial-club:club', 'gym-highfive:gym', 'pool-party:pool', 'tennis-night:courts', 'gym-deadlift:gym', 'spa-stones:spa',
  'pool-yoga:pool', 'gym-flex:gym', 'tennis-court:courts', 'gym-duo:gym', 'kids:club', 'gym-cable:gym', 'pool:pool',
  'spa-clinic:spa', 'gym-rack:gym', 'pool-lounge:pool', 'gym-coach:gym', 'gym-stretch:gym', 'tennis-shade:courts',
  'gym-seated:gym', 'carnival:club', 'gym-cardio:gym', 'spa-salon:spa', 'gym-floor:gym', 'pool-walk:pool', 'gym-stair:gym',
  'spa-nails:spa', 'gym-legpress:gym', 'gym-bike:gym', 'gym-kickback:gym', 'aerial-side:club',
]

const PHOTOS: GalPhoto[] = ORDER.map((s) => {
  const [k, cat] = s.split(':')
  const d = DIMS[k]
  return { k, cat, ar: d ? Math.round((d[0] / d[1]) * 1000) / 1000 : 1.5, alt: altOf(k) }
})

const TABS: GalTab[] = [
  ['all', 'All'], ['gym', 'Gym'], ['courts', 'Courts'], ['pool', 'Pool'], ['spa', 'Spa'], ['club', 'Club'],
].map(([id, label]) => ({ id, label, n: id === 'all' ? PHOTOS.length : PHOTOS.filter((p) => p.cat === id).length }))

export default async function GalleryPage() {
  const { settings, copy } = await getContent()
  return (
    <>
      <PageHero title="GALLERY" brush="club life" intro={<p>{copy.gallery}</p>} />

      <section className="gal" data-theme="dark">
        <Gallery photos={PHOTOS} tabs={TABS} />
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
