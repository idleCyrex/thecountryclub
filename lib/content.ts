import { cache } from 'react'
import { CLASSES, FACILITIES, TEAM, SPA, SETTINGS, COPY, type ClassItem, type Facility, type TeamMember, type SpaTreatment, type Settings } from '@/content/site'
import { connectDb, hasDb } from './db'

export interface SiteContent {
  classes: ClassItem[]
  facilities: Facility[]
  team: TeamMember[]
  spa: SpaTreatment[]
  settings: Settings
  copy: typeof COPY
  source: 'mongo' | 'static'
}

const STATIC: SiteContent = { classes: CLASSES, facilities: FACILITIES, team: TEAM, spa: SPA, settings: SETTINGS, copy: COPY, source: 'static' }

const strip = <T,>(docs: unknown[]): T[] =>
  docs.map((d) => {
    const { _id, __v, createdAt, updatedAt, ...rest } = d as Record<string, unknown>
    void _id; void __v; void createdAt; void updatedAt
    return rest as T
  })

/** Reads site content from MongoDB when configured, otherwise (or on any failure) the static content. */
export const getContent = cache(async (): Promise<SiteContent> => {
  if (!hasDb()) return STATIC
  try {
    await connectDb()
    const { ClassItemModel, FacilityModel, TeamMemberModel, SpaTreatmentModel, SettingsModel } = await import('@/models')
    const [classes, facilities, team, spa, settings] = await Promise.all([
      ClassItemModel.find().sort({ order: 1 }).lean(),
      FacilityModel.find().sort({ order: 1 }).lean(),
      TeamMemberModel.find().sort({ order: 1 }).lean(),
      SpaTreatmentModel.find().sort({ order: 1 }).lean(),
      SettingsModel.findOne({ key: 'site' }).lean(),
    ])
    const s = settings as { data?: Settings; copy?: typeof COPY } | null
    return {
      classes: classes.length ? strip<ClassItem>(classes) : CLASSES,
      facilities: facilities.length ? strip<Facility>(facilities) : FACILITIES,
      team: team.length ? strip<TeamMember>(team) : TEAM,
      spa: spa.length ? strip<SpaTreatment>(spa) : SPA,
      settings: s?.data ? { ...SETTINGS, ...s.data } : SETTINGS,
      copy: s?.copy ? { ...COPY, ...s.copy } : COPY,
      source: 'mongo',
    }
  } catch (e) {
    console.warn('[content] MongoDB unavailable, using static content:', (e as Error).message)
    return STATIC
  }
})
