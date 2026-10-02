import { load } from 'cheerio'
import type { ParsedUnitPage } from './types'

const DASH = /^(?:[—–−\-]|n\/a)$/i
const CARD_VERSION_RE = /[?&]v=([^&]+)/
const SLUG_RE = /\/units\/([^/?#]+)/

function textOf(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function nullableInt(value: string | null | undefined): number | null {
  if (!value || DASH.test(value)) return null
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

function nullableNumber(value: string | null | undefined): number | null {
  if (!value || DASH.test(value)) return null
  const n = Number.parseFloat(value.replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function parseDamage(raw: string | null): Pick<ParsedUnitPage, 'dmgS' | 'dmgM' | 'dmgL' | 'dmgE'> {
  if (!raw) {
    return { dmgS: null, dmgM: null, dmgL: null, dmgE: null }
  }
  const parts = raw.trim().split('/')
  return {
    dmgS: parts[0] ?? null,
    dmgM: parts[1] ?? null,
    dmgL: parts[2] ?? null,
    dmgE: parts[3] ?? null,
  }
}

export function parseUnitPage(html: string): ParsedUnitPage {
  const $ = load(html)
  const heading = $('h3.u-colh').filter((_, el) => textOf($(el).text()) === 'Alpha Strike Stats').first()
  const $section = heading.parent()

  const grid: Record<string, string> = {}
  $section.find('.u-statgrid > div').each((_, el) => {
    const label = textOf($(el).find('.k').text())
    const value = textOf($(el).find('.v').text())
    if (label) grid[label] = value
  })

  let damage: string | null = null
  let overheat: number | null = null
  let threshold: number | null = null
  const specials: string[] = []

  $section.find('.u-abilrow .aschip').each((_, el) => {
    const $chip = $(el)
    const clone = $chip.clone()
    clone.find('.an').remove()
    const label = textOf(clone.text())
    if (!label || label === 'None') return
    if (label.startsWith('DMG ')) {
      damage = label.slice(4).trim()
      return
    }
    if (label.startsWith('OV ')) {
      overheat = nullableInt(label.slice(3).trim())
      return
    }
    if (label.startsWith('TH ')) {
      threshold = nullableInt(label.slice(3).trim())
      return
    }
    const hasAbilityName = $chip.find('.an').length > 0
    const looksLikeCode = /^[A-Z]{2,}/.test(label)
    if (hasAbilityName || looksLikeCode) {
      specials.push(label)
    }
  })

  const canonical = $('link[rel="canonical"]').attr('href')
  const cardSrc = $('img[src*="/card.png"]')
    .filter((_, el) => !($(el).attr('src') ?? '').includes('side='))
    .first()
    .attr('src')
  const slugMatch = (canonical ?? cardSrc ?? '').match(SLUG_RE)
  const noCard = textOf($('body').text()).includes('No Alpha Strike card is available')
  const art = $('img[src*="point-backs/unit-art"]').first().attr('src')

  return {
    slug: slugMatch ? decodeURIComponent(slugMatch[1]) : null,
    hasCard: Boolean(cardSrc) && !noCard,
    cardVersion: cardSrc?.match(CARD_VERSION_RE)?.[1] ?? null,
    imageUrl: art && !art.includes('placeholder') ? art : null,
    pv: nullableNumber(grid.PV),
    size: nullableInt(grid.Size),
    move: grid.Move && !DASH.test(grid.Move) ? grid.Move : null,
    tmm: nullableInt(grid.TMM),
    armor: nullableInt(grid.Armor),
    structure: nullableInt(grid.Struct),
    ...parseDamage(damage),
    overheat,
    threshold,
    specials: specials.length ? specials.join(', ') : null,
  }
}
