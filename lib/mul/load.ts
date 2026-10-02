import { Prisma } from '@/generated/prisma/client'
import prisma from '../prisma'
import { expandAvailability } from './availability'
import type { MulAvailability, MulBundle, MulUnit } from './types'

const AVAILABILITY_BATCH = 2000
const UNIT_BATCH = 400

function unitWrite(unit: MulUnit, subTypeName: string | null) {
  return {
    name: unit.n,
    model: unit.m ?? null,
    typeId: unit.t,
    subType: subTypeName,
    introEraId: unit.ie ?? null,
    tonnage: unit.ton ?? null,
    pv: unit.pv ?? null,
    bv: unit.bv ?? null,
    introYear: unit.iy ?? null,
    removedAt: null,
  }
}

async function upsertLookups(bundle: MulBundle) {
  for (const era of bundle.eras) {
    await prisma.era.upsert({
      where: { id: era.id },
      update: {
        name: era.name,
        slug: era.slug,
        yearStart: era.ys ?? null,
        displayStart: era.ds ?? null,
        yearEnd: era.ye ?? null,
        color: era.color ?? null,
        sort: era.sort ?? 0,
      },
      create: {
        id: era.id,
        name: era.name,
        slug: era.slug,
        yearStart: era.ys ?? null,
        displayStart: era.ds ?? null,
        yearEnd: era.ye ?? null,
        color: era.color ?? null,
        sort: era.sort ?? 0,
      },
    })
  }

  for (const faction of bundle.factions) {
    await prisma.faction.upsert({
      where: { id: faction.id },
      update: {
        name: faction.name,
        slug: faction.slug,
        yearStart: faction.ys ?? null,
        yearEnd: faction.ye ?? null,
        color: faction.color ?? null,
        manufacturer: faction.mfr ?? false,
      },
      create: {
        id: faction.id,
        name: faction.name,
        slug: faction.slug,
        yearStart: faction.ys ?? null,
        yearEnd: faction.ye ?? null,
        color: faction.color ?? null,
        manufacturer: faction.mfr ?? false,
      },
    })
  }

  for (const type of bundle.unitTypes) {
    await prisma.unitType.upsert({
      where: { id: type.id },
      update: {
        name: type.name,
        slug: type.slug,
        yearStart: type.ys ?? null,
        sort: type.sort ?? 0,
      },
      create: {
        id: type.id,
        name: type.name,
        slug: type.slug,
        yearStart: type.ys ?? null,
        sort: type.sort ?? 0,
      },
    })
  }

  for (const ability of bundle.abilities) {
    await prisma.ability.upsert({
      where: { id: ability.id },
      update: { code: ability.code, name: ability.name },
      create: { id: ability.id, code: ability.code, name: ability.name },
    })
  }
}

async function upsertUnits(bundle: MulBundle): Promise<number> {
  const units = bundle.units
  const subTypeNames = new Map(bundle.unitSubTypes.map((subType) => [subType.id, subType.name]))
  for (let i = 0; i < units.length; i += UNIT_BATCH) {
    const chunk = units.slice(i, i + UNIT_BATCH)
    const values = chunk.map((unit) => {
      const data = unitWrite(unit, subTypeNames.get(unit.st) ?? null)
      return Prisma.sql`(
        ${unit.id},
        ${data.name},
        ${data.model},
        ${data.typeId},
        ${data.subType},
        ${data.introEraId},
        ${data.tonnage},
        ${data.pv},
        ${data.bv},
        ${data.introYear},
        ${data.removedAt},
        NOW(),
        NOW()
      )`
    })
    await prisma.$executeRaw`
      INSERT INTO "Unit" (
        "id", "name", "model", "typeId", "subType",
        "introEraId", "tonnage", "pv", "bv", "introYear", "removedAt", "createdAt", "updatedAt"
      )
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "model" = EXCLUDED."model",
        "typeId" = EXCLUDED."typeId",
        "subType" = EXCLUDED."subType",
        "introEraId" = EXCLUDED."introEraId",
        "tonnage" = EXCLUDED."tonnage",
        "pv" = EXCLUDED."pv",
        "bv" = EXCLUDED."bv",
        "introYear" = EXCLUDED."introYear",
        "removedAt" = EXCLUDED."removedAt",
        "updatedAt" = NOW()
    `
  }

  const abilityRows = units.flatMap((unit) =>
    (unit.ab ?? []).map((abilityId) => ({ unitId: unit.id, abilityId })),
  )
  await prisma.unitAbility.deleteMany()
  for (let i = 0; i < abilityRows.length; i += AVAILABILITY_BATCH) {
    await prisma.unitAbility.createMany({
      data: abilityRows.slice(i, i + AVAILABILITY_BATCH),
      skipDuplicates: true,
    })
  }

  const seen = units.map((unit) => unit.id)
  if (seen.length) {
    await prisma.unit.updateMany({
      where: { id: { notIn: seen }, removedAt: null },
      data: { removedAt: new Date() },
    })
  }

  return units.length
}

async function rebuildAvailability(availability: MulAvailability): Promise<number> {
  const rows = expandAvailability(availability)
  await prisma.$transaction(async (tx) => {
    await tx.unitAvailability.deleteMany()
    for (let i = 0; i < rows.length; i += AVAILABILITY_BATCH) {
      await tx.unitAvailability.createMany({
        data: rows.slice(i, i + AVAILABILITY_BATCH),
        skipDuplicates: true,
      })
    }
  }, { timeout: 180_000, maxWait: 20_000 })
  return rows.length
}

export async function loadBundle(bundle: MulBundle): Promise<{
  unitsUpserted: number
  availabilityRows: number
}> {
  await upsertLookups(bundle)
  const unitsUpserted = await upsertUnits(bundle)
  const availabilityRows = await rebuildAvailability(bundle.availability)
  return { unitsUpserted, availabilityRows }
}
