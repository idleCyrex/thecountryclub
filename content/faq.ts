import { SETTINGS } from './site'

export interface QA {
  q: string
  a: string
}

const hours = (rows: { days: string; time: string }[]) => rows.map((r) => `${r.days}, ${r.time}`).join('; ')

/** Short, direct answers built only from facts already on the site, one set per page. */
export const FAQ: Record<'contact' | 'fitness' | 'classes' | 'tennis' | 'pool' | 'spa', QA[]> = {
  contact: [
    { q: 'Where is the Country Club?', a: `At ${SETTINGS.address.full}, inside the Port de Plaisance resort in Cole Bay.` },
    { q: 'What are the gym opening hours?', a: `${hours(SETTINGS.hours.gym)}.` },
    { q: 'What are the Impulse Spa opening hours?', a: `${hours(SETTINGS.hours.spa)}.` },
    {
      q: 'What does the club offer?',
      a: 'A Life Fitness gym with a cardio area, leg room and main floor, daily group classes, seven lit tennis courts, a members-only pool, the Impulse Spa & Clinic, sauna and locker rooms, and the Courtside Cafe & juice bar.',
    },
    { q: 'How do I become a member or book a visit?', a: `Send an inquiry with the form on this page or call the club on ${SETTINGS.phone}.` },
  ],
  fitness: [
    { q: 'What equipment does the gym have?', a: 'Life Fitness equipment across a cardio area, a dedicated leg room and a main gym floor with racks, cables and free weights.' },
    { q: 'Are personal trainers available?', a: 'Yes. Personal trainers offer one-to-one and group training, alongside the daily class schedule.' },
    { q: 'Are towels and wifi included?', a: 'Yes. Towel service and wifi are free across the club, and the locker rooms have showers, a sauna and a changing area.' },
  ],
  classes: [
    { q: 'Which classes are offered?', a: 'Spinning, Yoga, Pilates and Abs & Legs, run every day by certified instructors.' },
    { q: 'Are classes suitable for beginners?', a: 'Yes. Every class welcomes all levels, from first-timers to regulars.' },
  ],
  tennis: [
    { q: 'How many tennis courts are there?', a: 'Seven new courts spread around the club, each with shade and benches.' },
    { q: 'Can I play tennis at night?', a: 'Yes. Special lighting keeps the courts open day and night.' },
    { q: 'Can I rent rackets and balls?', a: 'Yes. Rackets and balls are available to rent, and the Courtside Cafe is right next to the courts.' },
  ],
  pool: [
    { q: 'Who can use the pool?', a: 'The pool is for members, and members are welcome to bring friends and family.' },
    { q: 'What is provided at the pool?', a: 'Towels, chairs, umbrellas and swimming floats, with food served poolside from the Courtside Cafe.' },
  ],
  spa: [
    { q: 'How many treatment rooms does Impulse Spa have?', a: 'Six treatment rooms, with menus and wellness packages to choose from.' },
    { q: 'When is Impulse Spa open?', a: `${hours(SETTINGS.hours.spa)}.` },
  ],
}
