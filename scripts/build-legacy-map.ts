import prisma from '../lib/prisma'

type MekbayUnit = {
  mul1id?: number
  chassis?: string
  model?: string
  name?: string
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function displayName(name: string, model?: string | null): string {
  return [name, model].filter(Boolean).join(' ')
}

async function fetchMekbayUnits(): Promise<MekbayUnit[]> {
  const res = await fetch('https://db.mekbay.com/units.json', {
    headers: {
      'User-Agent': 'mul-search legacy mapper',
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`MekBay units.json failed: ${res.status}`)
  }
  return res.json() as Promise<MekbayUnit[]>
}

async function main() {
  const [ours, mekbay] = await Promise.all([
    prisma.unit.findMany({
      where: { removedAt: null },
      select: { id: true, name: true, model: true },
    }),
    fetchMekbayUnits(),
  ])

  const byName = new Map<string, string[]>()
  for (const unit of ours) {
    const keys = new Set([
      normalize(unit.name),
      normalize(displayName(unit.name, unit.model)),
    ])
    for (const key of keys) {
      const ids = byName.get(key) ?? []
      ids.push(unit.id)
      byName.set(key, ids)
    }
  }

  let unique = 0
  let ambiguous = 0
  let missing = 0
  const rows: { legacyId: number; unitId: string; method: string; legacyName: string }[] = []

  for (const unit of mekbay) {
    if (!unit.mul1id) continue
    const legacyName = displayName(unit.chassis ?? unit.name ?? '', unit.model)
    const key = normalize(legacyName)
    const matches = [...new Set(byName.get(key) ?? [])]
    if (matches.length === 1) {
      unique += 1
      rows.push({
        legacyId: unit.mul1id,
        unitId: matches[0],
        method: 'name',
        legacyName,
      })
    } else if (matches.length > 1) {
      ambiguous += 1
    } else {
      missing += 1
    }
  }

  for (const row of rows) {
    await prisma.legacyUnitId.upsert({
      where: { legacyId: row.legacyId },
      update: row,
      create: row,
    })
  }

  console.log(JSON.stringify({
    mekbay: mekbay.length,
    ours: ours.length,
    unique,
    ambiguous,
    missing,
    written: rows.length,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
