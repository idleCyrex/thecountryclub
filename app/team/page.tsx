import { getContent } from '@/lib/content'
import { pageMeta } from '@/lib/meta'
import PageHero from '@/components/PageHero'
import Reveal from '@/components/Reveal'
import CtaBand from '@/components/CtaBand'
import MediaFill from '@/components/ui/MediaFill'

export const revalidate = 300
export const metadata = pageMeta(
  'Our Team: Management & Personal Trainers',
  'Meet the Country Club team: operations, management, front desk, gym supervisor and personal trainers, including a former Mr. St. Maarten and SXM’s first IFBB Pro.',
  '/team',
  'gym-highfive',
)

const CREW = ['crew-1', 'crew-2', 'crew-3', 'crew-4', 'crew-5', 'crew-6']

export default async function Team() {
  const { team, copy } = await getContent()
  return (
    <>
      <PageHero title="THE TEAM" brush="meet the crew" intro={<p>{copy.team}</p>} />

      <section className="block block--crew" data-theme="dark" aria-label="The crew">
        <Reveal as="ul" className="crew">
          {CREW.map((k) => (
            <li key={k} className="crew__face" data-r="">
              <span className="crew__pic">
                <MediaFill k={k} w={800} sizes="16vw" alt="" />
              </span>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="block" data-theme="dark">
        <Reveal as="ul" className="team-grid">
          {team.map((m) => (
            <li key={m.slug} className="team-card" data-r="">
              <h2 className="display team-card__name">{m.name}</h2>
              <span className="pill">{m.role}</span>
              <p className="team-card__summary">{m.summary}</p>
              <details className="team-card__bio">
                <summary>Read bio</summary>
                {m.bio.map((b, i) => (
                  <p key={i}>{b}</p>
                ))}
                {m.phone && (
                  <p>
                    <a href={`tel:${m.phone.replace(/[^+\d]/g, '')}`}>{m.phone}</a>
                  </p>
                )}
              </details>
            </li>
          ))}
        </Reveal>
      </section>

      <CtaBand word="TRAIN 1:1" brush="with the pros" theme="yellow" primary={{ href: '/contact?interest=personal-training', label: 'Personal training' }} secondary={{ href: '/classes', label: 'Classes' }} />
    </>
  )
}
