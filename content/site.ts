// Static site content. Source of truth for `npm run seed` and the fallback when no
// MongoDB is configured. Self-contained (no imports) so scripts can load it.

export interface ClassItem {
  slug: string
  name: string
  tag: string
  icon: 'bike' | 'lotus' | 'core' | 'flame' | 'whistle' | 'kids' | 'racket'
  media: string
  blurb: string
  details?: string[]
  order: number
}

export interface Facility {
  slug: string
  group: 'home' | 'amenity'
  title: string
  line: string
  href?: string
  order: number
}

export interface TeamMember {
  slug: string
  name: string
  role: string
  summary: string
  bio: string[]
  phone?: string
  order: number
}

export interface SpaTreatment {
  slug: string
  name: string
  category: string
  description: string
  options?: string[]
  order: number
}

export interface HoursRow {
  days: string
  time: string
}

export interface Settings {
  name: string
  shortName: string
  tagline: string
  address: { street: string; locality: string; region: string; country: string; full: string }
  phone: string
  phoneHref: string
  hours: { gym: HoursRow[]; spa: HoursRow[] }
  socials: { facebook: string; instagram: string; youtube: string }
  youtube: { id: string; title: string }[]
  group: { name: string; url: string }
  yachtClub: string
  since: string
}

export const SETTINGS: Settings = {
  name: 'The Country Club at Port de Plaisance',
  shortName: 'Country Club',
  tagline: 'Your club on the island',
  address: {
    street: 'Port de Plaisance, 155 Union Road',
    locality: 'Cole Bay',
    region: 'St. Maarten',
    country: 'SX',
    full: 'Port de Plaisance, 155 Union Road, Cole Bay, St. Maarten',
  },
  phone: '+1 721-544-4321',
  phoneHref: 'tel:+17215444321',
  hours: {
    gym: [
      { days: 'Monday to Friday', time: '6:00 AM to 10:00 PM' },
      { days: 'Saturday', time: '7:00 AM to 9:00 PM' },
      { days: 'Sunday', time: '9:00 AM to 1:00 PM' },
    ],
    spa: [
      { days: 'Monday to Saturday', time: '9:00 AM to 7:00 PM' },
      { days: 'Sunday', time: '9:00 AM to 1:00 PM' },
    ],
  },
  socials: {
    facebook: 'https://www.facebook.com/CountryClubAtPortDePlaisance',
    instagram: 'https://www.instagram.com/explore/locations/1021789346/',
    youtube: 'https://www.youtube.com/watch?v=-jJZFBoc6gc',
  },
  youtube: [
    { id: 'uKSnIN_SBJ8', title: 'Club Life, Episode 1' },
    { id: '1QDv8JR4h4I', title: 'Club Life, Episode 2' },
    { id: '-jJZFBoc6gc', title: 'Club Life, Episode 3' },
  ],
  group: { name: 'Marine Management Group of Companies', url: '' },
  yachtClub: 'https://portdeplaisancemarina.com/',
  since: '2011',
}

export const CLASSES: ClassItem[] = [
  {
    slug: 'spinning',
    name: 'Spinning',
    tag: 'Ride',
    icon: 'bike',
    media: 'v-spin',
    blurb: 'Indoor cycling on weighted-flywheel bikes. Build endurance and strength, get your heart pumping and burn serious calories. All levels welcome.',
    details: ['Cardiovascular strength and endurance', 'Every level welcome', 'Leave feeling you earned it'],
    order: 1,
  },
  {
    slug: 'yoga',
    name: 'Yoga',
    tag: 'Mind',
    icon: 'lotus',
    media: 'v-yoga',
    blurb: 'A classical 90-minute practice that works the whole body. Stretch, build strength, detox and work your heart. Beginners and regulars are both welcome.',
    details: ['Lose weight', 'Reduce stress', 'Detoxify', 'Improve flexibility', 'Greater lung capacity', 'Increase strength', 'Better sports performance', 'Keener concentration', 'Better balance', 'Deeper sleep', 'Improve posture', 'Feel good from the inside out'],
    order: 2,
  },
  {
    slug: 'pilates',
    name: 'Pilates',
    tag: 'Core',
    icon: 'core',
    media: 'gym-stretch',
    blurb: 'Slow, controlled movement for core strength, posture and mobility. Led by our certified instructors in the club classrooms.',
    order: 3,
  },
  {
    slug: 'abs-legs',
    name: 'Abs & Legs',
    tag: 'Burn',
    icon: 'flame',
    media: 'gym-kickback',
    blurb: 'A lower-body session for strong legs, with work on your abs too. Both help every other sport you play.',
    order: 4,
  },
  {
    slug: 'personal-training',
    name: 'Personal Training',
    tag: '1:1',
    icon: 'whistle',
    media: 'gym-coach',
    blurb: 'Work one-to-one with our personal trainers. They write your program, spot you and keep you on track, right on the main gym floor.',
    order: 5,
  },
  {
    slug: 'kids-club',
    name: 'Kids Club',
    tag: 'Kids',
    icon: 'kids',
    media: 'kids',
    blurb: 'Kids activities in the Mimosa and Polaris rooms, so the whole family can use the club.',
    order: 6,
  },
  {
    slug: 'tennis',
    name: 'Tennis',
    tag: 'Court',
    icon: 'racket',
    media: 'v-tennis',
    blurb: 'Seven new lit courts with shade and benches, racket and ball rental, and night play under the lights.',
    order: 7,
  },
]

export const FACILITIES: Facility[] = [
  { slug: 'gym-floor', group: 'home', title: 'Life Fitness Gym Floor', line: 'Cardio area, leg room and main floor', href: '/club-fitness', order: 1 },
  { slug: 'tennis-courts', group: 'home', title: '7 Lit Tennis Courts', line: 'Day and night play, shade and benches', href: '/tennis', order: 2 },
  { slug: 'members-pool', group: 'home', title: "Members' Pool", line: 'Towels, chairs, floats, poolside food', href: '/pool', order: 3 },
  { slug: 'impulse-spa', group: 'home', title: 'Impulse Spa & Clinic', line: 'Six treatment rooms, THALGO products', href: '/spa', order: 4 },
  { slug: 'locker-rooms', group: 'home', title: 'Sauna & Locker Rooms', line: 'Showers, sauna and changing area', href: '/club-fitness', order: 5 },

  { slug: 'cardio', group: 'amenity', title: 'Cardio Area', line: 'Life Fitness machines', order: 1 },
  { slug: 'leg-room', group: 'amenity', title: 'Leg Room', line: 'A whole room for lower body', order: 2 },
  { slug: 'main-floor', group: 'amenity', title: 'Main Gym Floor', line: 'Racks, cables and free weights', order: 3 },
  { slug: 'trainers', group: 'amenity', title: 'Personal Trainers', line: 'Stay on track, hit your goals', order: 4 },
  { slug: 'classes', group: 'amenity', title: 'Group Classes', line: 'Spinning, Yoga, Pilates, Abs & Legs', order: 5 },
  { slug: 'kids-rooms', group: 'amenity', title: 'Kids Activities', line: 'In the Mimosa and Polaris rooms', order: 6 },
  { slug: 'lockers', group: 'amenity', title: 'Locker Rooms', line: 'Showers, sauna and changing area', order: 7 },
  { slug: 'towels-wifi', group: 'amenity', title: 'Free Towels & Wifi', line: 'Towel service, wifi club-wide', order: 8 },
  { slug: 'cafe', group: 'amenity', title: 'Café & Juice Bar', line: 'Courtside Cafe, food to fit your goals', order: 9 },
  { slug: 'supplements', group: 'amenity', title: 'Supplements', line: 'Sold at the front desk', order: 10 },
]

export const TEAM: TeamMember[] = [
  {
    slug: 'jesse-peterson',
    name: 'Jesse Peterson',
    role: 'Director of Operations',
    summary: 'Born on Sint Maarten, with the marina since 2007.',
    bio: [
      'Jesse Peterson began working at the marina in January 2007 as a Guest Service Coordinator and worked his way up to management. He was General Manager of the YCPDP Marina for six years before his promotion to Operations.',
      "Born on Sint Maarten and raised during the island's tourism boom, Jesse started in hotels and tourism young and learned how much customer service matters. A keen boater himself, he still brings that to the yachting industry every day.",
    ],
    order: 1,
  },
  {
    slug: 'ireta-reymond',
    name: 'Ireta Reymond',
    role: 'Manager',
    summary: 'Runs the club desk, the team rotations and member safety.',
    bio: [
      'Ireta operates the Country Club desk: promotions, staff rotations, day-to-day operations with members and staff, the technical side of fitness provision, and the health and safety of everyone on site.',
      'She grew up on French Saint-Martin, studied secretarial accounting, then continued her studies in France. She started at the Country Club front desk and rose to supervisor, assistant manager and manager. She loves trying new sports, travelling and training in the club gym.',
    ],
    order: 2,
  },
  {
    slug: 'esmeralda-carty',
    name: 'Esmeralda Carty',
    role: 'Lead Receptionist',
    summary: 'The first smile at the door, and the answer to every question.',
    bio: [
      'With excellent customer service skills and a real team-player attitude, Esmeralda handles inquiries, looks after every member and makes sure people walk into a building full of positive energy.',
      'She first studied for the medical field before moving into hospitality at Telem, which led her to the club. A proud mother of two from Saint-Martin, she loves travelling and family time.',
    ],
    order: 3,
  },
  {
    slug: 'simeon-jeremie',
    name: 'Simeon Jeremie',
    role: 'Gym Supervisor',
    summary: 'Former Mr. St. Maarten, keeping the floor at five-star standard.',
    bio: [
      "Simeon runs the daily life of the gym: keeping members happy, answering questions, making sure equipment is used safely, training and spotting when needed, and holding the Country Club Gym's five-star standard.",
      'Originally from Dominica, he started lifting as a teenager and turned it into his profession. He began competing in bodybuilding in 2000 and won Mr. St. Maarten. Personal training was the natural next step: what he loves, used to help others become the best version of themselves.',
    ],
    order: 4,
  },
  {
    slug: 'allison-williams',
    name: 'Allison Williams',
    role: 'Trainer',
    summary: "One of St. Maarten's fitness pioneers, SXM's first IFBB Pro.",
    bio: [
      "With more than 20 years in health and fitness, Allison Williams is one of St. Maarten's fitness pioneers. She is SXM's first IFBB Professional Athlete, an IFBB certified judge, fitness trainer, event coordinator, marketer, health-food chef and mother. She tailors a plan to you.",
    ],
    phone: '+1 721-587-2542',
    order: 5,
  },
  {
    slug: 'saul-coffie',
    name: 'Saul Coffie',
    role: 'Trainer',
    summary: 'Boxing, basketball and plant-powered nutrition.',
    bio: [
      "Saul has played sport since childhood, from boxing to basketball, competing across the Caribbean, Latin America and the USA. He has worked alongside professional fighters, including one of France's weight-class champions, and with top Canadian trainers at L.A. Fitness. His nutrition knowledge comes from first-hand experience of vegetarian and vegan diets.",
    ],
    phone: '+1 721-554-7638',
    order: 6,
  },
  {
    slug: 'peterson-charles',
    name: 'Peterson Charles',
    role: 'Trainer',
    summary: '25 years of bodybuilding, coach to champions.',
    bio: [
      'Peterson started bodybuilding as a teenager with cement weights and magazines as his coaches, and competed after a single year of training. Twenty-five years on he is still going strong, having trained the first IFBB Pro Alvin Andre, Cleo Carti and Simeon Jeremie.',
      'For more than 20 years he was a personal trainer at Royal Palm Gym, preparing clients for competition, toning up or losing weight. For Peterson, helping members reach their goals is a passion and a point of pride. Every client should feel comfortable, whatever their size.',
    ],
    phone: '+1 727-523-1582',
    order: 7,
  },
]

export const SPA: SpaTreatment[] = [
  {
    slug: 'relaxing-massage',
    name: 'Relaxing Massage',
    category: 'Massage',
    description: 'A guest favorite. Long strokes, kneading, rolling and varied pressure to help you relax and let stress go.',
    order: 1,
  },
  {
    slug: 'body-wrap',
    name: 'Body Wrap',
    category: 'Body Therapies',
    description: 'Choose the wrap that suits you best.',
    options: ['Invigorating: to firm and tone skin', 'Detoxifying: to cleanse and refresh'],
    order: 2,
  },
  {
    slug: 'body-shine',
    name: 'Body Shine',
    category: 'Body Therapies',
    description: 'A gentle scrub lifts dead skin cells, then a rich hydrating lotion leaves your skin smooth and soft.',
    order: 3,
  },
  {
    slug: 'wax',
    name: 'Wax',
    category: 'Beauty',
    description: 'A blend of alkanes and lipids grips each follicle to remove unwanted hair, with results that last four to six weeks.',
    order: 4,
  },
  {
    slug: 'mani-pedis',
    name: 'Mani-Pedis',
    category: 'Beauty',
    description: 'Our manicure and pedicure, done by professionally trained therapists.',
    order: 5,
  },
  {
    slug: 'spa-treatments',
    name: 'Spa Treatments',
    category: 'Face & Body',
    description: 'Body and facial treatments built around your needs, using THALGO spa products.',
    order: 6,
  },
  {
    slug: 'six-day-package',
    name: 'Six Day Package',
    category: 'Packages',
    description: 'Six sessions of reduction or relaxation therapy, chosen from the treatment menu.',
    options: ['Steam room', 'Mesotherapy', 'Ultrasound', 'Cavitation', 'Radio frequency', 'Cellulite reduction massage'],
    order: 7,
  },
]

export const COPY = {
  intro:
    "A Life Fitness gym, seven lit tennis courts, a members-only pool and the Impulse Spa & Clinic, all at Port de Plaisance, Cole Bay.",
  fitness: [
    "Our gym is full of Life Fitness equipment, spread across a cardio area, a leg room and a main gym floor. Between them you can work every muscle group.",
    'Personal trainers keep you on track. Personal and group training, a range of classes and kids activities in the Mimosa and Polaris rooms cover the rest. The locker rooms are spacious, with showers, a sauna and a changing area.',
    "Some members come to live healthier, and some because training is the best stress relief there is. Long-time members say even a few hours a week changed their lives. You look healthier, you feel better and you treat others better. Put the headphones in and find your happy place.",
    'Training around like-minded people builds teamwork too. Towel service and wifi are free across the club. There is a café station with food to fit your goals, and supplements at the front desk.',
  ],
  tennis: [
    'Seven new tennis courts spread around the club, each with shade and benches so adults and kids can take a breather courtside.',
    'No gear? Rackets and balls are available to rent, and the Courtside Cafe is right next to the courts. Special lighting keeps the courts open day and night for anyone who loves a late game. Bring friends and family.',
  ],
  pool: [
    'A pool just for members. Cool off after a workout, swim laps, or lounge under one of the umbrellas.',
    'Bring friends and family, the more the better. Enjoy the view while food comes poolside straight from the Courtside Cafe. Towels, chairs and swimming floats are provided.',
  ],
  spa: [
    'Step inside to the open feel of the Caribbean, a welcome drink and a comfortable chair. Take your time choosing from our menus and wellness packages.',
    'Our therapists then take you to one of our six treatment rooms. The aromas, the music and the touch of expert hands melt stress away, and you leave rested and ready for the day.',
  ],
  spaAbout:
    'Since we opened in 2011 the goal has been simple: every client walks out feeling better than when they came in. We run special packages for Valentine’s Day, Mother’s Day and Father’s Day to say thank you to our clients and their loved ones.',
  classes: 'Certified instructors run classes every day, built around what our members want.',
  team: 'Meet the people behind the club.',
  gallery: 'Like what you see? Keep going with Club Life episodes 1, 2 and 3. See you soon.',
}
