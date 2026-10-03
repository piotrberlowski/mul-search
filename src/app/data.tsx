import { ReadonlyURLSearchParams } from "next/navigation"


export const MASTER_UNIT_LIST = "https://masterunitlist.azurewebsites.net/"
const WITH_GENERAL_RE = /\[(.+) including (.+) during (.+)\]/
const FACTION_ERA_RE = /\[(.+) during (.+)\]/

export interface Faction {
    label: string,
    value: number,
}

export const eras:Array<[string, string]> = [
    ["10", "Star League"],
    ["11","Early Succession War"],
    ["255","Late Succession War - LosTech"],
    ["256","Late Succession War - Renaissance"],
    ["13","Clan Invasion"],
    ["247","Civil War"],
    ["14","Jihad"],
    ["15","Early Republic"],
    ["254","Late Republic"],
    ["16","Dark Age"],
    ["257","ilClan"],
]

export const eraMap: Map<string, string> = new Map(eras)

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

    public toUrl(unitType?: number) {
        const target = new URL("/Unit/QuickList", MASTER_UNIT_LIST)

        target.searchParams.append('minPV', '1')
        target.searchParams.append('maxPV', '999')
        target.searchParams.append('Factions', this.specific ?? '')
        target.searchParams.append('AvailableEras', this.era ?? '')

        if (unitType) {
            target.searchParams.append('Types', `${unitType}`)
        }

        return target.href
    }

    public describe(factions: Factions) {
        if (!this.specific || !this.era) {
            return "[Unknown]"
        }
        return `[${factions.getFactionName(this.specific)} during ${eraMap.get(this.era)}]`
    }

}

interface BuilderSearchParams  {
    era: string,
    specific: string,
}

export function parseConstraints(constraints: string, factions: Factions): BuilderSearchParams {
    const withGeneral = WITH_GENERAL_RE.exec(constraints)
    const simple = withGeneral ? null : FACTION_ERA_RE.exec(constraints)
    const specific = withGeneral?.[1] ?? simple?.[1]
    const era = withGeneral?.[3] ?? simple?.[2]
    if (!specific || !era) {
        console.log(`Couldn't parse constraints... ${constraints}`)
        return {
            era: "",
            specific: "",
        }
    }

    const [eraId, _1] = eras.find(([_, name]) => name == era) || [null, null]
    const specificId = factions.getFactionId(specific)

    return {
        era: `${eraId || ""}`,
        specific: `${specificId || ""}`,
    }

}

export function constraintsToParams(constraints: string, factions: Factions): URLSearchParams{
    const params = {
        ...parseConstraints(constraints, factions)
    }
    return new URLSearchParams(
        params
    )
}
export function renderEras() {
    return eras.map(eraKV => {
        const [val, lab] = eraKV;
        return (
            <option key={val} value={val || ""}>{lab}</option>
        );
    });
}
