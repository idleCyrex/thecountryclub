import type { HoursRow } from '@/content/site'

const WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const CLUB_TZ = 'America/Lower_Princes'

export const clubWeekday = (date = new Date()) => new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: CLUB_TZ }).format(date)

/** Index of the row whose "days" label ("Saturday", "Monday to Friday") covers the given weekday, or -1. */
export function rowForDay(rows: HoursRow[], day: string): number {
  const d = WEEK.indexOf(day)
  if (d < 0) return -1
  return rows.findIndex((r) => {
    const [a, b] = r.days.split(/\s+to\s+/i).map((s) => WEEK.indexOf(s.trim()))
    if (b === undefined) return a === d
    if (a < 0 || b < 0) return false
    return a <= b ? d >= a && d <= b : d >= a || d <= b
  })
}

export const timeRange = (t: string) => t.replace(/\s+to\s+/i, ' – ')

export default function HoursTable({ title, rows, today, className = '' }: { title: string; rows: HoursRow[]; today?: string; className?: string }) {
  const current = today ? rowForDay(rows, today) : -1
  return (
    <div className={`hours ${className}`}>
      <h3 className="display hours__title">{title}</h3>
      <dl className="hours__rows">
        {rows.map((r, i) => (
          <div key={r.days} className={`hours__row${i === current ? ' is-today' : ''}`} aria-current={i === current ? 'date' : undefined}>
            <dt>
              {r.days}
              {i === current && <span className="sr-only"> (today)</span>}
            </dt>
            <dd>{today ? timeRange(r.time) : r.time}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
