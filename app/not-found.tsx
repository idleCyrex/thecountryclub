import PageHero from '@/components/PageHero'
import TransitionLink from '@/components/ui/TransitionLink'

export default function NotFound() {
  return (
    <PageHero title="OUT OF BOUNDS" brush="404" size="md" intro={<p>This page is off the court. Head back to the club.</p>}>
      <div className="page-hero__actions">
        <TransitionLink className="btn" href="/">
          Back home
        </TransitionLink>
      </div>
    </PageHero>
  )
}
