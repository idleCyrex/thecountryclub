import { getContent } from '@/lib/content'
import { pageMeta } from '@/lib/meta'
import { FAQ } from '@/content/faq'
import Faq from '@/components/Faq'
import { altOf, media, srcSet } from '@/lib/media'
import PageHero from '@/components/PageHero'
import Reveal from '@/components/Reveal'
import HoursTable, { clubWeekday, rowForDay, timeRange } from '@/components/HoursTable'
import InquiryForm from '@/components/InquiryForm'

export const metadata = pageMeta(
  'Contact & Membership Inquiry',
  'Membership, tennis, spa and personal training inquiries. Port de Plaisance, 155 Union Road, Cole Bay, St. Maarten. +1 721-544-4321.',
  '/contact',
  'aerial-side',
)

const PHOTO = 'tennis-court'

function QuickAction({ href, title, value, hint, external }: { href: string; title: string; value: string; hint: string; external?: boolean }) {
  const face = (
    <>
      <span className="display qa__title">{title}</span>
      <span className="qa__value">{value}</span>
      <span className="qa__hint">{hint}</span>
    </>
  )
  return (
    <a className="qa" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      <span className="qa__face">{face}</span>
      <span className="qa__face qa__face--fill" aria-hidden="true">
        {face}
      </span>
    </a>
  )
}

export default async function Contact({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const interest = typeof sp.interest === 'string' ? sp.interest : 'membership'
  const { settings } = await getContent()
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Country Club Port de Plaisance, Cole Bay, Sint Maarten')}`

  const today = clubWeekday()
  const gym = settings.hours.gym[rowForDay(settings.hours.gym, today)]
  const spa = settings.hours.spa[rowForDay(settings.hours.spa, today)]

  return (
    <>
      <PageHero
        title="CONTACT"
        brush="get in touch"
        intro={<p className="contact__lede">Membership, courts, treatments or a simple question. The front desk is happy to help.</p>}
      />

      <section className="contact-page" data-theme="dark">
        <Reveal as="ul" className="contact-quick">
          <li data-r="">
            <QuickAction href={settings.phoneHref} title="CALL" value={settings.phone} hint="Front desk" />
          </li>
          <li data-r="">
            <QuickAction
              href={maps}
              external
              title="VISIT"
              value={`${settings.address.street.replace(/^Port de Plaisance,\s*/, '')}, ${settings.address.locality}`}
              hint="Open in Google Maps"
            />
          </li>
          <li data-r="">
            <QuickAction
              href="#hours"
              title="TODAY"
              value={gym ? `Gym ${timeRange(gym.time)}` : 'Gym closed today'}
              hint={spa ? `${today} · Spa ${timeRange(spa.time)}` : `${today} · See all hours`}
            />
          </li>
        </Reveal>

        <div className="contact-split">
          <div className="contact-photo__cell">
            <figure className="contact-photo">
              <img
                className="media-fill"
                src={media(PHOTO, { w: 1400 })}
                srcSet={srcSet(PHOTO)}
                sizes="(max-width: 1023px) 100vw, 46vw"
                alt={altOf(PHOTO)}
                loading="lazy"
                decoding="async"
              />
              <figcaption className="contact-photo__cap">
                <span className="display contact-photo__title">FIND US</span>
                <span className="contact-photo__addr">
                  {settings.address.street}
                  <br />
                  {settings.address.locality}, {settings.address.region}
                </span>
                <a className="btn" href={maps} target="_blank" rel="noopener noreferrer">
                  Open in maps
                </a>
              </figcaption>
            </figure>
          </div>

          <div className="contact-form">
            <h2 className="display contact-form__title">SEND US A MESSAGE</h2>
            <InquiryForm initialInterest={interest} phone={settings.phone} phoneHref={settings.phoneHref} />
          </div>
        </div>
      </section>

      <section className="contact-hours" id="hours" data-theme="dark" aria-labelledby="hours-title">
        <h2 className="display contact-hours__title" id="hours-title">
          HOURS
        </h2>
        <Reveal className="contact-hours__grid">
          <div data-r="">
            <HoursTable title="GYM" rows={settings.hours.gym} today={today} className="hours--card" />
          </div>
          <div data-r="">
            <HoursTable title="IMPULSE SPA" rows={settings.hours.spa} today={today} className="hours--card" />
          </div>
        </Reveal>
      </section>
      <Faq items={FAQ.contact} path="/contact" title="Questions before you visit" />
    </>
  )
}
