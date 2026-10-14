'use client'

import { createContext, useContext } from "react"
import { useMetadata } from "@/app/metadataContext"

export type BuilderQuery = {
    era: string | null
    specific: string | null
}

export function readBuilderQuery(): BuilderQuery {
    const params = new URLSearchParams(window.location.search)
    return {
        era: params.get('era'),
        specific: params.get('specific'),
    }
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
    const eraName = eras.find((era) => `${era.value}` === (query.era ?? ''))?.label
    const factionName = factions.getFactionName(query.specific ?? '')
    return {
        constraints: (factionName && eraName) ? `[${factionName} during ${eraName}]` : "[Unknown]",
        eraId: idOrNull(query.era),
        factionId: idOrNull(query.specific),
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
