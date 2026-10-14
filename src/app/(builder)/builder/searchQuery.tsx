'use client'

import { createContext, useContext } from "react"

export type BuilderQuery = {
    era: string | null
    specific: string | null
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
