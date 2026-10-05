export type UnitTypeOption = {
    id: number
    name: string
    slug: string
    sort: number
}

const FOLDED_SLUGS = ['battlemech', 'infantry', 'battle-armor', 'combat-vehicle', 'omnivehicle'] as const

const BACK_SLUGS = ['fighter-craft', 'aerospace-craft', 'advanced-support']

const EXCLUDED_SLUGS = new Set(['buildings', 'unknown'])

const HEAT_SLUGS = new Set(['battlemech', 'industrialmech', 'protomech'])

export const SHORT_LABEL: Record<(typeof FOLDED_SLUGS)[number], string> = {
    battlemech: 'Mech',
    infantry: 'Inf',
    'battle-armor': 'BA',
    'combat-vehicle': 'CV',
    omnivehicle: 'OV',
}

function bySlug(types: UnitTypeOption[], slugs: readonly string[]) {
    const lookup = new Map(types.map((type) => [type.slug, type]))
    return slugs.flatMap((slug) => {
        const type = lookup.get(slug)
        return type ? [type] : []
    })
}

export function arrangeUnitTypes(types: UnitTypeOption[]) {
    const placed = new Set<string>([...FOLDED_SLUGS, ...BACK_SLUGS, ...EXCLUDED_SLUGS])
    const middle = types
        .filter((type) => !placed.has(type.slug))
        .sort((a, b) => a.sort - b.sort || a.id - b.id)
    const folded = bySlug(types, FOLDED_SLUGS)
    return {
        folded,
        all: [...folded, ...middle, ...bySlug(types, BACK_SLUGS)],
    }
}

export function defaultSelectedIds(types: UnitTypeOption[]) {
    return arrangeUnitTypes(types).folded.map((type) => type.id)
}

export function selectionIncludesHeat(types: UnitTypeOption[], selected: ReadonlySet<number>) {
    return types.some((type) => selected.has(type.id) && HEAT_SLUGS.has(type.slug))
}
