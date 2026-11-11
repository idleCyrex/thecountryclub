import { CLASSES, COPY, SETTINGS } from '@/content/site'
import { FAQ } from '@/content/faq'
import { ROUTES, SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

const hours = (rows: { days: string; time: string }[]) => rows.map((r) => `- ${r.days}: ${r.time}`).join('\n')

/** Plain-text brief for AI assistants (llmstxt.org): who the club is, key facts, and where each topic lives. */
export function GET() {
  const pages = ROUTES.map((r) => `- [${r.label}](${SITE_URL}${r.href === '/' ? '' : r.href})`).join('\n')
  const faq = Object.values(FAQ)
    .flat()
    .map((i) => `- ${i.q} ${i.a}`)
    .join('\n')
  const body = `# ${SETTINGS.name}

> ${COPY.intro}

- Address: ${SETTINGS.address.full}
- Phone: ${SETTINGS.phone}
- Open since: ${SETTINGS.since}
- Part of: ${SETTINGS.group.name}

## Gym hours
${hours(SETTINGS.hours.gym)}

## Impulse Spa hours
${hours(SETTINGS.hours.spa)}

## Classes
${CLASSES.map((c) => `- ${c.name}: ${c.blurb}`).join('\n')}

## Pages
${pages}

## Frequently asked
${faq}
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
