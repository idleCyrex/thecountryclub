import { pageMeta } from '@/lib/meta'
import PageHero from '@/components/PageHero'
import { SETTINGS } from '@/content/site'

export const metadata = pageMeta('Privacy Policy', 'How the Country Club at Port de Plaisance handles the information you send us.', '/privacy')

export default function Privacy() {
  return (
    <>
      <PageHero title="PRIVACY" brush="plain and simple" size="md" />
      <section className="block" data-theme="dark">
        <div className="prose">
          <p>
            When you send an inquiry through this website we store your name, email, optional phone number, your area of interest and your message so the front desk can reply. We do not
            sell or share this information, and we only use it to answer you.
          </p>
          <p>
            This site does not use advertising or tracking cookies. Videos from YouTube only load after you press play.
          </p>
          <p>
            To access or delete the information you sent us, call the front desk at <a href={SETTINGS.phoneHref}>{SETTINGS.phone}</a> or visit us at {SETTINGS.address.full}.
          </p>
        </div>
      </section>
    </>
  )
}
