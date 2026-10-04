export const MUL_ORIGIN = 'https://masterunitlist.battletech.com'
export const MUL_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

export type MulManifest = {
  files: Record<string, string>
  unit_keys?: Record<string, string>
  availability_keys?: Record<string, string>
}

export type MulEra = {
  id: number
  name: string
  slug: string
  ys?: number | null
  ds?: number | null
  ye?: number | null
  color?: string | null
  sort?: number | null
}

export type MulFaction = {
  id: number
  name: string
  slug: string
  ys?: number | null
  ye?: number | null
  color?: string | null
  mfr?: boolean
}

export type MulUnitType = {
  id: number
  name: string
  slug: string
  ys?: number | null
  sort?: number | null
}

export type MulUnitSubType = {
  id: number
  t: number
  name: string
  slug: string
  ys?: number | null
  sort?: number | null
}

export type MulAbility = {
  id: number
  code: string
  name: string
  u?: number
}

export type MulRole = {
  id: number
  name: string
  slug: string
}

export type MulUnit = {
  id: string
  n: string
  m?: string | null
  t: number
  st: number
  r?: number | null
  te?: number | null
  ton?: number | null
  pv?: number | null
  bv?: number | null
  iy?: number | null
  ie?: number | null
  ab?: number[]
}

export type MulAvailability = {
  d: number[][]
  u: Record<string, [number, number][]>
}

export type MulBundle = {
  manifest: MulManifest
  hashes: Record<string, string>
  eras: MulEra[]
  factions: MulFaction[]
  unitTypes: MulUnitType[]
  unitSubTypes: MulUnitSubType[]
  abilities: MulAbility[]
  roles: MulRole[]
  units: MulUnit[]
  availability: MulAvailability
}

export type ParsedUnitPage = {
  slug: string | null
  hasCard: boolean
  cardVersion: string | null
  imageUrl: string | null
  pv: number | null
  size: number | null
  move: string | null
  tmm: number | null
  armor: number | null
  structure: number | null
  threshold: number | null
  overheat: number | null
  dmgS: string | null
  dmgM: string | null
  dmgL: string | null
  dmgE: string | null
  specials: string | null
}

export type SitemapEntry = {
  loc: string
  slug: string
  lastMod: Date | null
}

export type SyncOptions = {
  timeBudgetMs?: number
  scrapeDelayMs?: number
  scrapeLimit?: number
  skipScrape?: boolean
}

export type SyncResult = {
  id: string
  status: 'success' | 'partial' | 'failed'
  bundleChanged: boolean
  unitsUpserted: number
  availabilityRows: number
  pagesScraped: number
  pagesFailed: number
  errors: string[]
}
