import type { QA } from '@/content/faq'
import { ROUTES, SITE_URL } from '@/lib/site'

const json = (o: unknown) => ({ __html: JSON.stringify(o).replace(/</g, '\\u003c') })

/** Visible question-and-answer list (native <details>, no JS) plus FAQPage and BreadcrumbList JSON-LD for answer engines. */
export default function Faq({ items, path, title = 'Good to know' }: { items: QA[]; path: string; title?: string }) {
  const page = ROUTES.find((r) => r.href === path)
  const url = `${SITE_URL}${path}`
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  }
  const crumbs = page && {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: page.label, item: url },
    ],
  }
  return (
    <section className="block faq" data-theme="dark" aria-labelledby={`faq-${path.slice(1)}`}>
      <h2 className="display faq__title" id={`faq-${path.slice(1)}`}>
        {title}
      </h2>
      <div className="faq__list">
        {items.map((i) => (
          <details key={i.q} className="faq__item">
            <summary className="faq__q">
              <h3>{i.q}</h3>
              <span className="faq__sign" aria-hidden="true" />
            </summary>
            <p className="faq__a">{i.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={json(faq)} />
      {crumbs && <script type="application/ld+json" dangerouslySetInnerHTML={json(crumbs)} />}
    </section>
  )
}
