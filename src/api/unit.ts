import type { UnitMetadata, UnitStats } from '../../lib/units/unit'

// The unit the application reads. It is a scraped metadata row plus its stats row.
// removedAt stays on metadata and is filtered out before this type is built.
// unitId is metadata id. pv stays on metadata (the bundle value); the page repeats it.
// statsScrapedAt and sourceLastMod stay on the stats row.
export interface Unit extends Omit<UnitMetadata, 'removedAt'>, Omit<UnitStats, 'unitId' | 'statsScrapedAt' | 'sourceLastMod'> {}
