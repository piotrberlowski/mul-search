'use server'

import { matchListContext, type ListContext } from '../../../../lib/lists/context'
import prisma from '../../../../lib/prisma'

export async function resolveListIds(constraints: string): Promise<ListContext> {
  const [eras, factions] = await Promise.all([
    prisma.era.findMany({ select: { id: true, name: true } }),
    prisma.faction.findMany({ select: { id: true, name: true } }),
  ])
  return matchListContext(constraints, eras, factions)
}
