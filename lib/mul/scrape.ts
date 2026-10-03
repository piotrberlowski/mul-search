import prisma from '../prisma'
import { fetchMulText, sleep } from './http'
import { parseUnitPage } from './parseUnitPage'
import { parseSitemap, sitemapIndexLocs } from './sitemap'
import type { SitemapEntry } from './types'

export { parseSitemap }

export async function fetchSitemap(): Promise<SitemapEntry[]> {
  const xml = await fetchMulText('/sitemap.xml')
  const indexes = sitemapIndexLocs(xml)
  if (indexes.length === 0) {
    return parseSitemap(xml)
  }
  const parts = await Promise.all(indexes.map((url) => fetchMulText(url)))
  return parts.flatMap(parseSitemap)
}

export function isStaleUnit(
  unit: { slug: string | null; sourceLastMod: Date | null; statsScrapedAt: Date | null },
  lastModBySlug: Map<string, Date | null>,
): boolean {
  if (!unit.statsScrapedAt) return true
  if (!unit.slug) return true
  const lastMod = lastModBySlug.get(unit.slug)
  return Boolean(lastMod && (!unit.sourceLastMod || lastMod > unit.sourceLastMod))
}

export async function unitsNeedingScrape(limit?: number) {
  const sitemap = await fetchSitemap()
  const lastModBySlug = new Map(sitemap.map((entry) => [entry.slug, entry.lastMod]))
  const units = await prisma.unitMetadata.findMany({
    where: { removedAt: null },
    select: {
      id: true,
      name: true,
      stats: {
        select: {
          slug: true,
          sourceLastMod: true,
          statsScrapedAt: true,
        },
      },
    },
  })

  const stale = units
    .map((unit) => ({
      id: unit.id,
      name: unit.name,
      slug: unit.stats?.slug ?? null,
      sourceLastMod: unit.stats?.sourceLastMod ?? null,
      statsScrapedAt: unit.stats?.statsScrapedAt ?? null,
    }))
    .filter((unit) => isStaleUnit(unit, lastModBySlug))
    .sort((a, b) => {
      if (!a.statsScrapedAt && b.statsScrapedAt) return -1
      if (a.statsScrapedAt && !b.statsScrapedAt) return 1
      const aTime = a.statsScrapedAt?.getTime() ?? 0
      const bTime = b.statsScrapedAt?.getTime() ?? 0
      if (aTime !== bTime) return aTime - bTime
      return a.name.localeCompare(b.name)
    })
  const selected = typeof limit === 'number' ? stale.slice(0, limit) : stale
  return { units: selected, lastModBySlug }
}

export async function scrapeUnit(id: string, lastModBySlug: Map<string, Date | null>) {
  const html = await fetchMulText(`/u/${id}`)
  const parsed = parseUnitPage(html)
  if (!parsed.slug || parsed.size == null || parsed.dmgS == null || parsed.dmgM == null || parsed.dmgL == null || parsed.dmgE == null) {
    throw new Error('page is missing slug, size, or damage')
  }
  const scrapedAt = new Date()
  const data = {
    slug: parsed.slug,
    size: parsed.size,
    move: parsed.move,
    tmm: parsed.tmm,
    armor: parsed.armor,
    structure: parsed.structure,
    threshold: parsed.threshold,
    overheat: parsed.overheat,
    dmgS: parsed.dmgS,
    dmgM: parsed.dmgM,
    dmgL: parsed.dmgL,
    dmgE: parsed.dmgE,
    specials: parsed.specials,
    cardVersion: parsed.hasCard ? parsed.cardVersion : null,
    imageUrl: parsed.imageUrl,
    sourceLastMod: lastModBySlug.get(parsed.slug) ?? null,
    statsScrapedAt: scrapedAt,
  }
  await prisma.unitStats.upsert({
    where: { unitId: id },
    create: { unitId: id, ...data },
    update: data,
  })
  return parsed
}

export async function scrapeUnits(options: {
  deadline?: number
  delayMs?: number
  limit?: number
}): Promise<{ scraped: number; failed: number; errors: string[] }> {
  const delayMs = options.delayMs ?? 10_000
  const { units: pending, lastModBySlug } = await unitsNeedingScrape(options.limit)
  let scraped = 0
  let failed = 0
  const errors: string[] = []

  for (const [index, unit] of pending.entries()) {
    if (options.deadline && Date.now() >= options.deadline) break
    try {
      const parsed = await scrapeUnit(unit.id, lastModBySlug)
      scraped += 1
      console.log(`[scrape] ${index + 1}/${pending.length} ${unit.id} ${parsed.slug ?? ''} ok`)
    } catch (error) {
      failed += 1
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${unit.id}: ${message}`)
      console.log(`[scrape] ${index + 1}/${pending.length} ${unit.id} fail ${message}`)
    }
    if (index < pending.length - 1 && delayMs > 0) {
      if (options.deadline && Date.now() + delayMs >= options.deadline) break
      await sleep(delayMs)
    }
  }

  return { scraped, failed, errors }
}
