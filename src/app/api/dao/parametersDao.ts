import 'server-only'

import { unstable_cache } from 'next/cache'
import prisma from '../../../../lib/prisma'
import type { UnitTypeOption } from '@/app/(builder)/builder/unitTypes'

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

const loadUnitTypes = unstable_cache(
  () => prisma.unitType.findMany({
    orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      sort: true,
      shortName: true,
      placement: true,
      placementSort: true,
    },
  }),
  ['mul-unit-types-placement'],
  { tags: ['units'] },
)

const loadFactionsByEra = unstable_cache(async () => {
  const [factions, pairs] = await Promise.all([
    prisma.faction.findMany({ orderBy: { name: 'asc' } }),
    prisma.unitAvailability.groupBy({ by: ['eraId', 'factionId'] }),
  ])
  const nameById = new Map(factions.map((faction) => [faction.id, faction.name]))
  const byEra = new Map<number, ParameterOption[]>()
  for (const pair of pairs) {
    const label = nameById.get(pair.factionId)
    if (!label) continue
    const list = byEra.get(pair.eraId) ?? []
    list.push({ label, value: pair.factionId })
    byEra.set(pair.eraId, list)
  }
  for (const list of byEra.values()) {
    list.sort((a, b) => a.label.localeCompare(b.label))
  }
  return [...byEra.entries()].map(([eraId, factionsForEra]) => ({
    eraId,
    factions: factionsForEra,
  }))
}, ['mul-factions-by-era'], { tags: ['units'] })

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

  async getFactionsByEra(): Promise<{ eraId: number, factions: ParameterOption[] }[]> {
    try {
      return await loadFactionsByEra()
    } catch (error) {
      console.error('Cannot load factions by era from database', error)
      return []
    }
  }

  async getUnitTypes(): Promise<UnitTypeOption[]> {
    try {
      return await loadUnitTypes()
    } catch (error) {
      console.error('Cannot load unit types from database', error)
      return []
    }
  }
}

export const parametersDao = new ParametersDao()
