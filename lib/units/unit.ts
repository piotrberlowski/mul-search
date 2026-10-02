// Columns copied from the MUL data bundle. A row exists before any unit page is scraped.
export interface UnitMetadata {
  id: string
  name: string
  model: string | null
  typeId: number
  subType: string | null
  introEraId: number | null
  tonnage: number | null
  pv: number | null
  bv: number | null
  introYear: number | null
  removedAt: Date | null
}

// One row per scraped page. unitId is the primary key and the foreign key to UnitMetadata.
// Null here means the page had no value (an em dash, or a chip that unit type does not have),
// not that the page has not been scraped yet.
export interface UnitStats {
  unitId: string
  slug: string
  size: number
  move: string | null
  tmm: number | null
  armor: number | null
  structure: number | null
  threshold: number | null
  overheat: number | null
  dmgS: string
  dmgM: string
  dmgL: string
  dmgE: string
  specials: string | null
  cardVersion: string | null
  imageUrl: string | null
  sourceLastMod: Date | null
  statsScrapedAt: Date
}

// The unit the application reads. It is a scraped metadata row plus its stats row.
// removedAt stays on metadata and is filtered out before this type is built.
// unitId is metadata id. pv stays on metadata (the bundle value); the page repeats it.
// statsScrapedAt and sourceLastMod stay on the stats row.
export interface Unit extends Omit<UnitMetadata, 'removedAt'>, Omit<UnitStats, 'unitId' | 'statsScrapedAt' | 'sourceLastMod'> {}
