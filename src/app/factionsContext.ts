import { Factions, type Faction } from "@/app/data";

import { createContext, useContext } from "react";

export const FactionsContext = createContext<Factions>(new Factions([]))

export function useFactionsContext() {
    return useContext(FactionsContext)
}

export type EraFactionList = { eraId: number, factions: Faction[] }

export const EraCatalogContext = createContext<{
    eras: Faction[],
    factionsByEra: EraFactionList[],
}>({ eras: [], factionsByEra: [] })

export function useEraCatalog() {
    return useContext(EraCatalogContext)
}

