import { Factions } from "@/app/data";

import { createContext, useContext } from "react";

export const FactionsContext = createContext<Factions>(new Factions([]))

export function useFactionsContext() {
    return useContext(FactionsContext)
}

