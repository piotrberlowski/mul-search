import { fetchMulJson } from './http'
import type {
  MulAbility,
  MulAvailability,
  MulBundle,
  MulEra,
  MulFaction,
  MulManifest,
  MulRole,
  MulUnit,
  MulUnitSubType,
  MulUnitType,
} from './types'

const LOOKUPS = [
  'eras',
  'factions',
  'unit_types',
  'unit_sub_types',
  'abilities',
  'roles',
  'units',
  'availability',
] as const

export function changedFiles(
  current: Record<string, string>,
  previous: Record<string, string> | null | undefined,
): string[] {
  return LOOKUPS.filter((key) => current[key] && current[key] !== previous?.[key])
}

export async function fetchManifest(): Promise<MulManifest> {
  return fetchMulJson<MulManifest>('/data/manifest.json')
}

export async function fetchBundle(manifest?: MulManifest): Promise<MulBundle> {
  const resolved = manifest ?? await fetchManifest()
  const files = resolved.files
  const [
    eras,
    factions,
    unitTypes,
    unitSubTypes,
    abilities,
    roles,
    units,
    availability,
  ] = await Promise.all([
    fetchMulJson<MulEra[]>(`/data/${files.eras}`),
    fetchMulJson<MulFaction[]>(`/data/${files.factions}`),
    fetchMulJson<MulUnitType[]>(`/data/${files.unit_types}`),
    fetchMulJson<MulUnitSubType[]>(`/data/${files.unit_sub_types}`),
    fetchMulJson<MulAbility[]>(`/data/${files.abilities}`),
    fetchMulJson<MulRole[]>(`/data/${files.roles}`),
    fetchMulJson<MulUnit[]>(`/data/${files.units}`),
    fetchMulJson<MulAvailability>(`/data/${files.availability}`),
  ])

  const hashes: Record<string, string> = {}
  for (const key of LOOKUPS) {
    hashes[key] = files[key]
  }

  return {
    manifest: resolved,
    hashes,
    eras,
    factions,
    unitTypes,
    unitSubTypes,
    abilities,
    roles,
    units,
    availability,
  }
}
