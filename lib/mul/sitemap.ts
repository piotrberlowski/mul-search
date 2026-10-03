import { load } from 'cheerio'
import type { SitemapEntry } from './types'

const SITEMAP_SLUG_RE = /\/units\/([^/?#]+)/

export function parseSitemap(xml: string): SitemapEntry[] {
  const $ = load(xml, { xml: true })
  const entries: SitemapEntry[] = []
  $('url').each((_, el) => {
    const loc = $(el).find('loc').text().trim()
    const match = loc.match(SITEMAP_SLUG_RE)
    if (!match) return
    const lastModRaw = $(el).find('lastmod').text().trim()
    entries.push({
      loc,
      slug: decodeURIComponent(match[1]),
      lastMod: lastModRaw ? new Date(lastModRaw) : null,
    })
  })
  return entries
}

export function sitemapIndexLocs(xml: string): string[] {
  const $ = load(xml, { xml: true })
  return $('sitemap loc').toArray().map((el) => $(el).text().trim()).filter(Boolean)
}
