'use server'

import { unitsDao, type ListedUnit } from './unitsDao'

export async function getUnitsForSearch(factionId: number, eraId: number, typeId?: number): Promise<ListedUnit[]> {
  return unitsDao.getUnits({
    factionId,
    eraId,
    typeIds: typeId ? [typeId] : undefined,
  })
}

export async function resolveUnits(ids: Array<string | number>): Promise<Record<string, ListedUnit>> {
  const resolved = await unitsDao.resolveLegacy(ids)
  return Object.fromEntries(resolved)
}
