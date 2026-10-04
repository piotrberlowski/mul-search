const WITH_GENERAL_RE = /\[(.+) including (.+) during (.+)\]/
const FACTION_ERA_RE = /\[(.+) during (.+)\]/

export type NamedId = {
  id: number
  name: string
}

export type ListContext = {
  eraId: number | null
  factionId: number | null
  label: string | null
}

function normalizeName(value: string) {
  return value
    .replace(/[–—−]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function constraintNames(constraints: string): { faction: string, era: string } | null {
  const withGeneral = WITH_GENERAL_RE.exec(constraints)
  const simple = withGeneral ? null : FACTION_ERA_RE.exec(constraints)
  const faction = (withGeneral?.[1] ?? simple?.[1])?.trim()
  const era = (withGeneral?.[3] ?? simple?.[2])?.trim()
  if (!faction || !era) return null
  return { faction, era }
}

export function matchListContext(
  constraints: string,
  eras: NamedId[],
  factions: NamedId[],
): ListContext {
  const names = constraintNames(constraints)
  if (!names) return { eraId: null, factionId: null, label: null }
  const era = eras.find((entry) => normalizeName(entry.name) === normalizeName(names.era))
  const faction = factions.find((entry) => normalizeName(entry.name) === normalizeName(names.faction))
  if (!era || !faction) {
    return { eraId: era?.id ?? null, factionId: faction?.id ?? null, label: null }
  }
  return {
    eraId: era.id,
    factionId: faction.id,
    label: `[${faction.name} during ${era.name}]`,
  }
}
