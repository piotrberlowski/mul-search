import prisma from '../lib/prisma'
import { matchListContext } from '../lib/lists/context'

async function main() {
  const lists = await prisma.list.findMany({
    select: { id: true, key: true, name: true, constraints: true },
  })
  const [eras, factions] = await Promise.all([
    prisma.era.findMany({ select: { id: true, name: true } }),
    prisma.faction.findMany({ select: { id: true, name: true } }),
  ])

  let updated = 0
  const unmatched: string[] = []
  for (const list of lists) {
    const matched = matchListContext(list.constraints, eras, factions)
    if (matched.eraId == null || matched.factionId == null || !matched.label) {
      unmatched.push(`${list.key} ${list.name}: ${list.constraints}`)
      continue
    }
    await prisma.list.update({
      where: { id: list.id },
      data: {
        eraId: matched.eraId,
        factionId: matched.factionId,
        constraints: matched.label,
      },
    })
    updated += 1
  }

  console.log(`Updated ${updated} of ${lists.length} lists`)
  if (unmatched.length) {
    console.log('Unmatched:')
    for (const line of unmatched) console.log(`  ${line}`)
  }

  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
