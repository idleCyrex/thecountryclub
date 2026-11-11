// Media manifest: key -> source file under _media/. Self-contained (no imports) so the
// Node scripts can transpile and load it without a bundler.

export type MediaKind = 'image' | 'video'

export interface MediaItem {
  file: string
  kind: MediaKind
  alt: string
  poster?: string
}

const S = 'site/'
const V = 'stock/'

export const MEDIA = {
  // brand / aerials
  'aerial-side': { file: S + 'CC-Pic-side-scaled-e1602261090552.jpg', kind: 'image', alt: 'Aerial view of the Country Club tennis courts and pool at Port de Plaisance' },
  'aerial-club': { file: S + 'Club2.jpg', kind: 'image', alt: 'Aerial view of the red roofs, courts and gardens of the Country Club' },
  logo: { file: S + 'cropped-The-Country-Club-at-Yacht-Club-Port-De-Plaisance.png', kind: 'image', alt: 'The Country Club at Port de Plaisance logo' },

  // pool
  pool: { file: S + 'IMG_3528-scaled.jpg', kind: 'image', alt: 'The members-only pool with loungers, palms and planters' },
  'pool-yoga': { file: S + '55788425_2600265343335054_7013282321323261952_o.jpg', kind: 'image', alt: 'Outdoor yoga session beside the pool' },
  'pool-party': { file: S + '62372712_2769227516438835_9039540723552092160_o.jpg', kind: 'image', alt: 'Pool party with giant floats and the hills behind' },
  'pool-walk': { file: S + '60193618_2674624565899131_1189673763097018368_n.jpg', kind: 'image', alt: 'Member walking along the pool edge' },
  'pool-lounge': { file: S + '65418814_2769229983105255_4729179032107614208_o.jpg', kind: 'image', alt: 'Member relaxing on a pool lounger with a drink' },

  // tennis
  'tennis-court': { file: S + 'IMG_1376.jpg', kind: 'image', alt: 'Turquoise tennis court with a red-roofed shade pavilion and green hills' },
  'tennis-night': { file: S + 'IMG_23567.jpg', kind: 'image', alt: 'Night tennis under the court floodlights' },
  'tennis-shade': { file: S + '56732711_2614800955214826_5167663002249330688_o.jpg', kind: 'image', alt: 'Players resting under the courtside shade pavilion' },

  // gym
  'gym-highfive': { file: S + 'DSC03724-scaled.jpeg', kind: 'image', alt: 'Trainer and member high-five on the gym floor' },
  'gym-rack': { file: S + 'DSC03849-scaled.jpeg', kind: 'image', alt: 'Athlete flexing in front of the power racks' },
  'gym-coach': { file: S + 'DSC03858-scaled.jpeg', kind: 'image', alt: 'Trainer coaching a member through a cable exercise' },
  'gym-bike': { file: S + 'DSC03873-scaled.jpeg', kind: 'image', alt: 'Trainer guiding a member on a bike' },
  'gym-seated': { file: S + '56514040_2614788478549407_4699619087196618752_o.jpg', kind: 'image', alt: 'Smiling member on a seated machine' },
  'gym-cardio': { file: S + '56593653_2614806168547638_8399700234078257152_o.jpg', kind: 'image', alt: 'Cardio area with members on bikes and treadmills' },
  'gym-flex': { file: S + '56775597_2619179068110348_3652475415840161792_o.jpg', kind: 'image', alt: 'Athlete posing on the gym floor' },
  'gym-floor': { file: S + '56887002_2619141428114112_7831920010112008192_o.jpg', kind: 'image', alt: 'Busy main gym floor with dumbbells' },
  'gym-kickback': { file: S + '57400058_2619168751444713_7381187592106016768_o.jpg', kind: 'image', alt: 'Member doing a cable kickback' },
  'gym-deadlift': { file: S + '59916566_2674623385899249_8097509474752790528_n.jpg', kind: 'image', alt: 'Member lifting a loaded barbell' },
  'gym-legpress': { file: S + '64578179_2745686128792974_2119874219536809984_o.jpg', kind: 'image', alt: 'Member on the leg press' },
  'gym-cable': { file: S + '66311029_2782893158405604_7771849656912314368_o.jpg', kind: 'image', alt: 'Athlete pulling a cable bar' },
  'gym-stretch': { file: S + '56468296_2614796568548598_719976113836654592_o.jpg', kind: 'image', alt: 'Member stretching at the bar beside stability balls' },
  'gym-duo': { file: S + '64417416_2745692192125701_6984924821226258432_o.jpg', kind: 'image', alt: 'Two members smiling after a workout' },
  'gym-stair': { file: S + '65085512_2745688252126095_7059653219202367488_n.jpg', kind: 'image', alt: 'Member on the stair climber' },

  // spa
  'spa-stones': { file: S + '64666951_2748220435206210_5339753893599379456_o.jpg', kind: 'image', alt: 'Hot stone massage at Impulse Spa' },
  'spa-clinic': { file: S + '64781765_2748220885206165_5522708153105383424_o.jpg', kind: 'image', alt: 'Impulse Spa & Clinic pedicure and treatment room' },
  'spa-salon': { file: S + '64602936_2748217925206461_5671099187282837504_o.jpg', kind: 'image', alt: 'Guests in the Impulse Spa salon' },
  'spa-nails': { file: S + 'IMG_222555.jpg', kind: 'image', alt: 'Manicure in progress' },
  'spa-logo': { file: S + 'impulse-cropped.jpg', kind: 'image', alt: 'Impulse Spa Clinic logo' },

  // club life
  kids: { file: S + '65391941_2769227649772155_9098063398171574272_n.jpg', kind: 'image', alt: 'Two kids at the club by the beach' },
  carnival: { file: S + '59203957_657653551341945_4421774521787219968_n.jpg', kind: 'image', alt: 'Member in carnival costume' },

  // crew headshots (unlabelled on purpose: names are not matched to faces)
  'crew-1': { file: S + 'IMG_20777.jpg', kind: 'image', alt: 'Country Club team member' },
  'crew-2': { file: S + 'IMG_20799.jpg', kind: 'image', alt: 'Country Club team member' },
  'crew-3': { file: S + 'IMG_20844.jpg', kind: 'image', alt: 'Country Club team member' },
  'crew-4': { file: S + 'IMG_20888.jpg', kind: 'image', alt: 'Country Club team member' },
  'crew-5': { file: S + 'IMG_20899.jpg', kind: 'image', alt: 'Country Club team member' },
  'crew-6': { file: S + 'IMG_21055.jpg', kind: 'image', alt: 'Country Club team member' },

  // video (stock clips + the spa's own cover video)
  'v-lift': { file: V + 'lift.mp4', kind: 'video', alt: 'Weightlifting', poster: 'gym-rack' },
  'v-dumbbell': { file: V + 'dumbbell.mp4', kind: 'video', alt: 'Dumbbell training', poster: 'gym-cable' },
  'v-spin': { file: V + 'spin.mp4', kind: 'video', alt: 'Indoor cycling', poster: 'gym-bike' },
  'v-tennis': { file: V + 'tennis.mp4', kind: 'video', alt: 'Tennis serve', poster: 'tennis-court' },
  'v-pool': { file: V + 'pool.mp4', kind: 'video', alt: 'Resort pool', poster: 'pool' },
  'v-yoga': { file: V + 'yoga.mp4', kind: 'video', alt: 'Yoga practice', poster: 'pool-yoga' },
  'v-spa': { file: V + 'spa.mp4', kind: 'video', alt: 'Relaxing massage', poster: 'spa-stones' },
  'v-aerial': { file: V + 'aerial.mp4', kind: 'video', alt: 'Caribbean coastline from above', poster: 'aerial-club' },
  'v-spa-cover': { file: S + 'spaimpulseclinic-cover.mp4', kind: 'video', alt: 'Impulse Spa & Clinic', poster: 'spa-clinic' },
} satisfies Record<string, MediaItem>

export type MediaKey = keyof typeof MEDIA
