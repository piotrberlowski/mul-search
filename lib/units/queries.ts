import 'server-only'

import { unstable_cache } from 'next/cache'
import prisma from '../prisma'
import { MUL_ORIGIN } from '../mul/types'

export type FactionOption = {
  label: string
  value: number
}

export type ListedUnit = {
  Id: string
  Name: string
  Type: { Id: number; Name: string }
  Role: { Name: string }
  Rules: string
  Class: string
  Variant: string
  ImageUrl: string
  BFDamageShort: number
  BFDamageMedium: number
  BFDamageLong: number
  BFMove: string
  BFPointValue: number
  BFArmor: number
  BFStructure: number
  BFAbilities: string
  BFTMM: number
  BFOverheat: number
  BFSize: number
  BFThreshold: number
  BFType: string
  Tonnage: number
  slug: string | null
  cardUrl: string | null
}

const unitInclude = {
  type: true,
} as const

type UnitRow = Awaited<ReturnType<typeof prisma.unit.findFirst<{ include: typeof unitInclude }>>>

function damageNumber(value: string | null | undefined): number {
  if (!value) return 0
  const n = Number.parseInt(value.replace('*', ''), 10)
  return Number.isFinite(n) ? n : 0
}

export function cardUrl(slug: string | null | undefined, cardVersion: string | null | undefined): string | null {
  if (!slug || !cardVersion) return null
  return `${MUL_ORIGIN}/units/${slug}/card.png?v=${cardVersion}`
}

export function toListedUnit(unit: NonNullable<UnitRow>): ListedUnit {
  return {
    Id: unit.id,
    Name: [unit.name, unit.model].filter(Boolean).join(' '),
    Type: { Id: unit.typeId, Name: unit.type.name },
    Role: { Name: '' },
    Rules: '',
    Class: unit.name,
    Variant: unit.model ?? '',
    ImageUrl: unit.imageUrl ?? '',
    BFDamageShort: damageNumber(unit.dmgS),
    BFDamageMedium: damageNumber(unit.dmgM),
    BFDamageLong: damageNumber(unit.dmgL),
    BFMove: unit.move ?? '',
    BFPointValue: unit.pv ?? 0,
    BFArmor: unit.armor ?? 0,
    BFStructure: unit.structure ?? 0,
    BFAbilities: unit.specials ?? '',
    BFTMM: unit.tmm ?? 0,
    BFOverheat: unit.overheat ?? 0,
    BFSize: unit.size ?? 0,
    BFThreshold: unit.threshold ?? 0,
    BFType: unit.subType ?? unit.type.name,
    Tonnage: unit.tonnage ?? 0,
    slug: unit.slug,
    cardUrl: cardUrl(unit.slug, unit.cardVersion),
  }
}

async function factionsFromDb() {
  return prisma.faction.findMany({
    orderBy: { name: 'asc' },
  })
}

async function erasFromDb() {
  return prisma.era.findMany({
    orderBy: { sort: 'asc' },
  })
}

export const getFactions = unstable_cache(factionsFromDb, ['mul-factions'], { tags: ['units'] })
export const getEras = unstable_cache(erasFromDb, ['mul-eras'], { tags: ['units'] })

export async function getFactionsForUi(): Promise<FactionOption[]> {
  try {
    const factions = await getFactions()
    return factions.map((faction) => ({ label: faction.name, value: faction.id }))
  } catch (error) {
    console.error('Cannot load factions from database', error)
    return []
  }
}

async function unitsFromDb(factionId: number, eraId: number, typeIds?: number[]) {
  const units = await prisma.unit.findMany({
    where: {
      removedAt: null,
      availability: {
        some: { factionId, eraId },
      },
      ...(typeIds?.length ? { typeId: { in: typeIds } } : {}),
    },
    include: unitInclude,
    orderBy: { name: 'asc' },
  })
  return units.map(toListedUnit)
}

export function getUnits(args: { factionId: number; eraId: number; typeIds?: number[] }) {
  return unstable_cache(
    () => unitsFromDb(args.factionId, args.eraId, args.typeIds),
    ['mul-units', String(args.factionId), String(args.eraId), (args.typeIds ?? []).join(',')],
    { tags: ['units'] },
  )()
}

export async function getUnitsByIds(ids: string[]) {
  if (!ids.length) return []
  const units = await prisma.unit.findMany({
    where: { id: { in: ids } },
    include: unitInclude,
  })
  const byId = new Map(units.map((unit) => [unit.id, toListedUnit(unit)]))
  return ids.map((id) => byId.get(id)).filter((unit): unit is ListedUnit => Boolean(unit))
}

export async function resolveLegacy(idsOrNames: Array<string | number>) {
  const numeric: number[] = []
  const strings: string[] = []
  for (const value of idsOrNames) {
    if (typeof value === 'number' || /^\d+$/.test(String(value))) {
      numeric.push(Number(value))
    } else {
      strings.push(String(value))
    }
  }

  const [legacy, byId, byName] = await Promise.all([
    numeric.length
      ? prisma.legacyUnitId.findMany({
          where: { legacyId: { in: numeric } },
          include: { unit: { include: unitInclude } },
        })
      : Promise.resolve([]),
    strings.length
      ? prisma.unit.findMany({
          where: { id: { in: strings } },
          include: unitInclude,
        })
      : Promise.resolve([]),
    strings.length
      ? prisma.unit.findMany({
          where: {
            OR: strings.map((name) => ({
              name: { equals: name, mode: 'insensitive' as const },
            })),
          },
          include: unitInclude,
        })
      : Promise.resolve([]),
  ])

  const resolved = new Map<string, ListedUnit>()
  for (const row of legacy) {
    resolved.set(String(row.legacyId), toListedUnit(row.unit))
  }
  for (const unit of byId) {
    resolved.set(unit.id, toListedUnit(unit))
  }
  for (const unit of byName) {
    const key = [unit.name, unit.model].filter(Boolean).join(' ')
    resolved.set(key, toListedUnit(unit))
    resolved.set(unit.name, toListedUnit(unit))
  }
  return resolved
}
