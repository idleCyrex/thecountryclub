import type { ReactNode } from 'react'

export interface Tile {
  title: ReactNode
  line?: ReactNode
  big?: ReactNode
  icon?: ReactNode
}

/** Grid of equal rounded cards, every cell centred: a line icon, a big figure, or (failing both) the tile's index. */
export default function Tiles({ items, cols = 4, className = '' }: { items: Tile[]; cols?: 2 | 3 | 4 | 5; className?: string }) {
  return (
    <ul className={`tiles tiles--${cols}${items.every((t) => t.icon) ? ' tiles--icons' : ''} ${className}`}>
      {items.map((t, i) => {
        const n = String(i + 1).padStart(2, '0')
        return (
          <li key={i} className="tile" data-r="">
            {t.big && <span className="tile__num">{n}</span>}
            {t.icon ? (
              <span className="tile__icon" aria-hidden="true">
                {t.icon}
              </span>
            ) : (
              <span className={`display tile__big${t.big ? '' : ' tile__big--num'}`} aria-hidden={t.big ? undefined : true}>
                {t.big ?? n}
              </span>
            )}
            <span className="tile__text">
              <span className="display tile__title">{t.title}</span>
              {t.line && <span className="tile__line">{t.line}</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
