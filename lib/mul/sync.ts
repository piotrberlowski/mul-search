import prisma from '../prisma'
import { changedFiles, fetchBundle, fetchManifest } from './bundle'
import { loadBundle } from './load'
import { scrapeUnits } from './scrape'
import type { SyncOptions, SyncResult } from './types'

async function invalidateUnitCache() {
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag('units')
  } catch {
    // tsx scripts run outside the Next.js runtime
  }
}

async function latestHashes(): Promise<Record<string, string> | null> {
  const last = await prisma.syncRun.findFirst({
    where: { status: { in: ['success', 'partial'] } },
    orderBy: { startedAt: 'desc' },
    select: { manifestHashes: true },
  })
  if (!last?.manifestHashes || typeof last.manifestHashes !== 'object' || Array.isArray(last.manifestHashes)) {
    return null
  }
  return last.manifestHashes as Record<string, string>
}

export async function syncMul(options: SyncOptions = {}): Promise<SyncResult> {
  const startedAt = new Date()
  const deadline = options.timeBudgetMs ? Date.now() + options.timeBudgetMs : undefined
  const run = await prisma.syncRun.create({
    data: { startedAt, status: 'running' },
  })

  const errors: string[] = []
  let unitsUpserted = 0
  let availabilityRows = 0
  let pagesScraped = 0
  let pagesFailed = 0
  let bundleChanged = false
  let hashes: Record<string, string> | null = null

  try {
    const manifest = await fetchManifest()
    hashes = Object.fromEntries(
      ['eras', 'factions', 'unit_types', 'unit_sub_types', 'abilities', 'roles', 'units', 'availability']
        .filter((key) => manifest.files[key])
        .map((key) => [key, manifest.files[key]]),
    )
    const previous = await latestHashes()
    bundleChanged = changedFiles(hashes, previous).length > 0

    if (bundleChanged) {
      console.log('[sync] manifest changed, loading bundle')
      const bundle = await fetchBundle(manifest)
      const loaded = await loadBundle(bundle)
      console.log(`[sync] loaded ${loaded.unitsUpserted} units, ${loaded.availabilityRows} availability rows`)
      unitsUpserted = loaded.unitsUpserted
      availabilityRows = loaded.availabilityRows
    }

    if (!options.skipScrape) {
      console.log('[sync] scraping stale unit pages')
      const scrape = await scrapeUnits({
        deadline,
        delayMs: options.scrapeDelayMs,
        limit: options.scrapeLimit,
      })
      pagesScraped = scrape.scraped
      pagesFailed = scrape.failed
      errors.push(...scrape.errors)
    }

    const status = errors.length && pagesScraped === 0 && !bundleChanged
      ? 'failed'
      : errors.length || (deadline && Date.now() >= deadline)
        ? 'partial'
        : 'success'

    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status,
        manifestHashes: hashes,
        unitsUpserted,
        availabilityRows,
        pagesScraped,
        pagesFailed,
        errors,
      },
    })

    if (bundleChanged || pagesScraped > 0) {
      await invalidateUnitCache()
    }

    return {
      id: run.id,
      status,
      bundleChanged,
      unitsUpserted,
      availabilityRows,
      pagesScraped,
      pagesFailed,
      errors,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    errors.push(message)
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: 'failed',
        manifestHashes: hashes ?? undefined,
        unitsUpserted,
        availabilityRows,
        pagesScraped,
        pagesFailed,
        errors,
      },
    })
    return {
      id: run.id,
      status: 'failed',
      bundleChanged,
      unitsUpserted,
      availabilityRows,
      pagesScraped,
      pagesFailed,
      errors,
    }
  }
}
