import 'server-only'

import { unstable_cache } from 'next/cache'
import prisma from '../../../../lib/prisma'

export type ParameterOption = {
  label: string
  value: number
}

const loadFactions = unstable_cache(
  () => prisma.faction.findMany({ orderBy: { name: 'asc' } }),
  ['mul-factions'],
  { tags: ['units'] },
)

const loadEras = unstable_cache(
  () => prisma.era.findMany({ orderBy: { sort: 'asc' } }),
  ['mul-eras'],
  { tags: ['units'] },
)

export class ParametersDao {
  async getFactions(): Promise<ParameterOption[]> {
    try {
      const factions = await loadFactions()
      return factions.map((faction) => ({ label: faction.name, value: faction.id }))
    } catch (error) {
      console.error('Cannot load factions from database', error)
      return []
    }
  }

  async getEras(): Promise<ParameterOption[]> {
    try {
      const eras = await loadEras()
      return eras.map((era) => ({ label: era.name, value: era.id }))
    } catch (error) {
      console.error('Cannot load eras from database', error)
      return []
    }
  }
}

export const parametersDao = new ParametersDao()
