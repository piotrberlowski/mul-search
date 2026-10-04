import 'server-only'

import { unstable_cache } from 'next/cache'
import prisma from '../../../../lib/prisma'
import { MUL_ORIGIN } from '../../../../lib/mul/types'

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
  dmgS: string | null
  dmgM: string | null
  dmgL: string | null
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
  role: true,
  stats: true,
} as const

type MetadataRow = {
  id: string
  name: string
  model: string | null
  typeId: number
  subType: string | null
  introEraId: number | null
  tonnage: number | null
  pv: number | null
  bv: number | null
  introYear: number | null
  type: { name: string }
  role: { name: string } | null
  stats: {
    slug: string
    size: number
    move: string | null
    tmm: number | null
    armor: number | null
    structure: number | null
    threshold: number | null
    overheat: number | null
    dmgS: string
    dmgM: string
    dmgL: string
    dmgE: string
    specials: string | null
    cardVersion: string | null
    imageUrl: string | null
  } | null
}

function damageNumber(value: string | null | undefined): number {
  if (!value) return 0
  const n = Number.parseInt(value.replace('*', ''), 10)
  return Number.isFinite(n) ? n : 0
}

export function cardUrl(slug: string | null | undefined, cardVersion: string | null | undefined): string | null {
  if (!slug || !cardVersion) return null
  return `${MUL_ORIGIN}/units/${slug}/card.png?v=${cardVersion}`
}

export function toListedUnit(unit: MetadataRow): ListedUnit {
  const stats = unit.stats
  return {
    Id: unit.id,
    Name: [unit.name, unit.model].filter(Boolean).join(' '),
    Type: { Id: unit.typeId, Name: unit.type.name },
    Role: { Name: unit.role?.name ?? '' },
    Rules: '',
    Class: unit.name,
    Variant: unit.model ?? '',
    ImageUrl: stats?.imageUrl ?? '',
    BFDamageShort: damageNumber(stats?.dmgS),
    BFDamageMedium: damageNumber(stats?.dmgM),
    BFDamageLong: damageNumber(stats?.dmgL),
    dmgS: stats?.dmgS ?? null,
    dmgM: stats?.dmgM ?? null,
    dmgL: stats?.dmgL ?? null,
    BFMove: stats?.move ?? '',
    BFPointValue: unit.pv ?? 0,
    BFArmor: stats?.armor ?? 0,
    BFStructure: stats?.structure ?? 0,
    BFAbilities: stats?.specials ?? '',
    BFTMM: stats?.tmm ?? 0,
    BFOverheat: stats?.overheat ?? 0,
    BFSize: stats?.size ?? 0,
    BFThreshold: stats?.threshold ?? 0,
    BFType: unit.subType ?? unit.type.name,
    Tonnage: unit.tonnage ?? 0,
    slug: stats?.slug ?? null,
    cardUrl: cardUrl(stats?.slug, stats?.cardVersion),
  }
}

async function unitsFromDb(factionId: number, eraId: number, typeIds?: number[]) {
  const units = await prisma.unitMetadata.findMany({
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

export class UnitsDao {
  getUnits(args: { factionId: number; eraId: number; typeIds?: number[] }) {
    return unstable_cache(
      () => unitsFromDb(args.factionId, args.eraId, args.typeIds),
      ['mul-units', String(args.factionId), String(args.eraId), (args.typeIds ?? []).join(',')],
      { tags: ['units'] },
    )()
  }

  async getUnitsByIds(ids: string[]) {
    if (!ids.length) return []
    const units = await prisma.unitMetadata.findMany({
      where: { id: { in: ids } },
      include: unitInclude,
    })
    const byId = new Map(units.map((unit) => [unit.id, toListedUnit(unit)]))
    return ids.map((id) => byId.get(id)).filter((unit): unit is ListedUnit => Boolean(unit))
  }

  async availableUnitIds(unitIds: string[], eraId: number, factionId: number) {
    if (!unitIds.length) return new Set<string>()
    const rows = await prisma.unitAvailability.findMany({
      where: { eraId, factionId, unitId: { in: unitIds } },
      select: { unitId: true },
    })
    return new Set(rows.map((row) => row.unitId))
  }

  async resolveLegacy(idsOrNames: Array<string | number>) {
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
        ? prisma.unitMetadata.findMany({
            where: { id: { in: strings } },
            include: unitInclude,
          })
        : Promise.resolve([]),
      strings.length
        ? prisma.unitMetadata.findMany({
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
}

export const unitsDao = new UnitsDao()
