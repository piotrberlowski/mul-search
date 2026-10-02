import type { MulAvailability } from './types'

export function expandAvailability(availability: MulAvailability): {
  unitId: string
  eraId: number
  factionId: number
}[] {
  const rows: { unitId: string; eraId: number; factionId: number }[] = []
  for (const [unitId, pairs] of Object.entries(availability.u)) {
    for (const [eraId, dictIndex] of pairs) {
      const factions = availability.d[dictIndex] ?? []
      for (const factionId of factions) {
        rows.push({ unitId, eraId, factionId })
      }
    }
  }
  return rows
}
