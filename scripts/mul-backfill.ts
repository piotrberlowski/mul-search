import { syncMul } from '../lib/mul/sync'

function arg(name: string): string | undefined {
  const prefix = `--${name}=`
  const match = process.argv.find((value) => value.startsWith(prefix))
  if (match) return match.slice(prefix.length)
  const index = process.argv.indexOf(`--${name}`)
  if (index >= 0) return process.argv[index + 1]
  return undefined
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

async function main() {
  const skipScrape = hasFlag('lookups-only') || hasFlag('skip-scrape')
  const scrapeLimit = arg('scrape-limit') ? Number(arg('scrape-limit')) : undefined
  const scrapeDelayMs = arg('delay-ms') ? Number(arg('delay-ms')) : 10_000

  const result = await syncMul({
    skipScrape,
    scrapeLimit: Number.isFinite(scrapeLimit) ? scrapeLimit : undefined,
    scrapeDelayMs,
  })

  console.log(JSON.stringify(result, null, 2))
  if (result.status === 'failed') {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
