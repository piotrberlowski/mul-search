'use server'

import { unitsDao, type ListedUnit } from './unitsDao'

export async function getUnitsForSearch(factionId: number, eraId: number, typeId?: number): Promise<ListedUnit[]> {
  return unitsDao.getUnits({
    factionId,
    eraId,
    typeIds: typeId ? [typeId] : undefined,
  })
}

export type ResolvedUnit = {
  unit: ListedUnit | null
  available: boolean
}

export async function resolveUnits(ids: Array<string | number>): Promise<Record<string, ListedUnit>> {
  const resolved = await unitsDao.resolveLegacy(ids)
  return Object.fromEntries(resolved)
}

export async function resolveUnitsAvailability(
  keys: string[],
  eraId: number,
  factionId: number,
): Promise<Record<string, ResolvedUnit>> {
  const resolved = await unitsDao.resolveLegacy(keys)
  const unitIds = [...new Set([...resolved.values()].map((unit) => unit.Id))]
  const available = await unitsDao.availableUnitIds(unitIds, eraId, factionId)
  return Object.fromEntries(keys.map((key) => {
    const unit = resolved.get(key) ?? null
    return [key, { unit, available: unit != null && available.has(unit.Id) }]
  }))
}
