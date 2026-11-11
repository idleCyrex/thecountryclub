import { getContent } from '@/lib/content'
import { pageMeta } from '@/lib/meta'
import { FAQ } from '@/content/faq'
import Faq from '@/components/Faq'
import PageHero from '@/components/PageHero'
import AxisWord from '@/components/AxisWord'
import Reveal from '@/components/Reveal'
import HoursTable from '@/components/HoursTable'
import CtaBand from '@/components/CtaBand'
import MediaFill from '@/components/ui/MediaFill'
import { ClassIcon } from '@/components/ui/Icons'

export const revalidate = 300
export const metadata = pageMeta(
  'Classes: Spinning, Yoga, Pilates, Abs & Legs',
  'Group classes every day with certified instructors: Spinning, 90-minute Yoga, Pilates, Abs & Legs, personal training, kids activities and tennis.',
  '/classes',
  'pool-yoga',
)

export default async function Classes() {
  const { classes, copy, settings } = await getContent()
  return (
    <>
      <PageHero title="CLASSES" brush="every day" intro={<p>{copy.classes}</p>} media="v-spin" />

      <section className="block" data-theme="dark">
        <Reveal as="ul" className="class-grid">
          {classes.map((c) => (
            <li key={c.slug} id={c.slug} className="class-card" data-r="">
              <div className="class-card__media">
                <MediaFill k={c.media} w={800} sizes="(max-width: 743px) 90vw, 30vw" />
              </div>
              <ClassIcon name={c.icon} className="class-card__icon" />
              <h2 className="display class-card__name">{c.name}</h2>
              <span className="pill">{c.tag}</span>
              <p className="class-card__blurb">{c.blurb}</p>
              {c.details && (
                <div className="class-card__tags">
                  {c.details.length > 3 && <input type="checkbox" id={`more-${c.slug}`} className="tags-toggle sr-only" />}
                  <ul className="tags">
                    {c.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  {c.details.length > 3 && (
                    <label htmlFor={`more-${c.slug}`} className="tags-more">
                      <span className="tags-more__open">+{c.details.length - 3} more</span>
                      <span className="tags-more__close">Show less</span>
                    </label>
                  )}
                </div>
              )}
            </li>
          ))}
        </Reveal>
      </section>

      <AxisWord word="SWEAT" brush="together" caption="Certified instructors · All levels welcome" />

      <section className="block block--hours" data-theme="dark">
        <div className="hours-pair">
          <HoursTable title="GYM & CLASSES" rows={settings.hours.gym} />
          <div className="hours">
            <h3 className="display hours__title">THIS WEEK</h3>
            <p className="body-caps">
              Class times change with the season. Call the front desk on <a href={settings.phoneHref}>{settings.phone}</a> or drop by for this week&apos;s timetable.
            </p>
          </div>
        </div>
      </section>

      <Faq items={FAQ.classes} path="/classes" />
      <CtaBand word="BOOK A CLASS" brush="your spot" primary={{ href: '/contact?interest=membership', label: 'Ask the front desk' }} secondary={{ href: '/team', label: 'Meet the trainers' }} />
    </>
  )
}
