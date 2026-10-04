import { ReadonlyURLSearchParams } from "next/navigation"
import { searchParamsFromIds } from "../../lib/lists/context"

export interface Faction {
    label: string,
    value: number,
}

export { searchParamsFromIds }

export class Factions {
    private factionNames: Map<string, string> = new Map()
    private factions: Faction[] = []

    constructor(factions: Faction[]) {
        factions.forEach(v => {
            this.factions.push(v)
            this.factionNames.set(`${v.value}`, v.label)
        })
    }

    public getFactions() {
        return this.factions
    }

    public getFactionId(specific: string) {
        return this.factions.find(f => f.label == specific)?.value
    }

    public getFactionName(id:string) {
        return this.factionNames.get(id)
    }
}

export class MULSearchParams {
    public canSearch: boolean
    specific: string | null
    era: string | null

    constructor(
        searchParams: ReadonlyURLSearchParams
    ) {
        const era = searchParams.get('era')
        const specific = searchParams.get('specific')

        this.canSearch = !(!era || !specific)

        this.specific = specific
        this.era = era
    }

}
