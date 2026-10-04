'use server'

import { unitsDao, type ListedUnit } from './unitsDao'

export async function getUnitsForSearch(factionId: number, eraId: number, typeId?: number): Promise<ListedUnit[]> {
  return unitsDao.getUnits({
    factionId,
    eraId,
    typeIds: typeId ? [typeId] : undefined,
  })
}

export async function unitIsAvailable(unitId: string, eraId: number, factionId: number): Promise<boolean> {
  return unitsDao.isAvailable(unitId, eraId, factionId)
}

export async function resolveUnits(ids: Array<string | number>): Promise<Record<string, ListedUnit>> {
  const resolved = await unitsDao.resolveLegacy(ids)
  return Object.fromEntries(resolved)
}
