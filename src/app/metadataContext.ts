'use client'

import type { UnitTypeOption } from "@/app/(builder)/builder/unitTypes"
import { Factions, type Faction } from "@/app/data"
import { createContext, useContext } from "react"

export type EraFactionList = { eraId: number, factions: Faction[] }

export type Metadata = {
    factions: Factions
    eras: Faction[]
    factionsByEra: EraFactionList[]
    unitTypes: UnitTypeOption[]
}

export const MetadataContext = createContext<Metadata>({
    factions: new Factions([]),
    eras: [],
    factionsByEra: [],
    unitTypes: [],
})

export function useMetadata() {
    return useContext(MetadataContext)
}
