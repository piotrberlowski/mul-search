'use client'

import { createContext, useContext } from "react"
import { useMetadata } from "@/app/metadataContext"

export class BuilderQuery {
    constructor(
        readonly era: string | null,
        readonly specific: string | null,
    ) {}

    static fromParams(params: { get(name: string): string | null }) {
        return new BuilderQuery(params.get('era'), params.get('specific'))
    }

    static of(eraId: number, factionId: number) {
        return new BuilderQuery(String(eraId), String(factionId))
    }

    get eraText() {
        return this.era ?? ''
    }

    get factionText() {
        return this.specific ?? ''
    }

    get eraId() {
        return idOrNull(this.era)
    }

    get factionId() {
        return idOrNull(this.specific)
    }

    get canSearch() {
        return this.eraId != null && this.factionId != null
    }

    same(other: BuilderQuery) {
        return this.era === other.era && this.specific === other.specific
    }

    withEra(era: string) {
        return new BuilderQuery(era || null, this.specific)
    }
}

export function readBuilderQuery(): BuilderQuery {
    return BuilderQuery.fromParams(new URLSearchParams(window.location.search))
}

export function writeBuilderQuery(query: BuilderQuery) {
    const params = new URLSearchParams(window.location.search)
    if (query.era) params.set('era', query.era)
    else params.delete('era')
    if (query.specific) params.set('specific', query.specific)
    else params.delete('specific')
    const nextUrl = `${window.location.pathname}?${params.toString()}`
    const currentUrl = `${window.location.pathname}${window.location.search}`
    if (nextUrl !== currentUrl) {
        window.history.pushState(null, '', nextUrl)
    }
}

export type ListSearch = {
    constraints: string
    eraId: number | null
    factionId: number | null
}

function idOrNull(value: string | null) {
    if (value == null || value === '') return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

export function useListSearch(): ListSearch {
    const { query } = useBuilderQuery()
    const { factions, eras } = useMetadata()
    const eraName = eras.find((era) => `${era.value}` === query.eraText)?.label
    const factionName = factions.getFactionName(query.factionText)
    return {
        constraints: (factionName && eraName) ? `[${factionName} during ${eraName}]` : "[Unknown]",
        eraId: query.eraId,
        factionId: query.factionId,
    }
}

type BuilderQueryValue = {
    query: BuilderQuery
    setQuery: (next: BuilderQuery) => void
}

export const BuilderQueryContext = createContext<BuilderQueryValue | null>(null)

export function useBuilderQuery() {
    const value = useContext(BuilderQueryContext)
    if (!value) {
        throw new Error("Builder query is only available inside the builder")
    }
    return value
}
