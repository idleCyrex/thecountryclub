import type { CSSProperties } from 'react'
import Rolling from './ui/Rolling'
import Brush from './ui/Brush'
import TransitionLink from './ui/TransitionLink'

interface Props {
  word: string
  brush: string
  primary: { href: string; label: string }
  secondary?: { href: string; label: string }
  theme?: 'yellow' | 'dark'
}

/** Closing call to action: rolling word, brush over it, solid + outline pills. */
export default function CtaBand({ word, brush, primary, secondary, theme = 'dark' }: Props) {
  return (
    <section className="cta-band" data-theme={theme}>
      <div className="cta-band__title">
        <Rolling text={word} className="cta-band__word" style={{ '--n': word.length } as CSSProperties} />
        <Brush text={brush} className="brush-over cta-band__brush" />
      </div>
      <div className="cta-band__actions">
        <TransitionLink className="btn" href={primary.href}>
          {primary.label}
        </TransitionLink>
        {secondary && (
          <TransitionLink className="btn btn--outline" href={secondary.href}>
            {secondary.label}
          </TransitionLink>
        )}
      </div>
    </section>
  )
}
