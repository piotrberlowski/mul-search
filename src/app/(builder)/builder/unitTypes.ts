export type UnitTypePlacement = 'primary' | 'secondary' | 'excluded'

export type UnitTypeOption = {
    id: number
    name: string
    slug: string
    sort: number
    shortName: string | null
    placement: UnitTypePlacement | null
    placementSort: number
}

const HEAT_SLUGS = new Set(['battlemech', 'industrialmech', 'protomech'])

function byPlacement(types: UnitTypeOption[], placement: UnitTypePlacement) {
    return types
        .filter((type) => type.placement === placement)
        .sort((a, b) => a.placementSort - b.placementSort || a.sort - b.sort || a.id - b.id)
}

export function arrangeUnitTypes(types: UnitTypeOption[]) {
    const folded = byPlacement(types, 'primary')
    const middle = types
        .filter((type) => type.placement == null)
        .sort((a, b) => a.sort - b.sort || a.id - b.id)
    return {
        folded,
        all: [...folded, ...middle, ...byPlacement(types, 'secondary')],
    }
}

export function defaultSelectedIds(types: UnitTypeOption[]) {
    return arrangeUnitTypes(types).folded.map((type) => type.id)
}

export function selectionIncludesHeat(types: UnitTypeOption[], selected: ReadonlySet<number>) {
    return types.some((type) => selected.has(type.id) && HEAT_SLUGS.has(type.slug))
}
