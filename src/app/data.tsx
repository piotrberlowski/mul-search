import { ReadonlyURLSearchParams } from "next/navigation"


export const MASTER_UNIT_LIST = "https://masterunitlist.azurewebsites.net/"
const BLANK = "Blank General List"
const CONSTRAINTS_RE = /\[(.+) including (.+) during (.+)\]/

export interface Faction {
    label: string,
    value: number,
}

export async function fetchFactions() {
    const url = new URL("/Faction/Autocomplete?term=", MASTER_UNIT_LIST)
    const sUrl = url.toString()
    console.log("Fetching %s", sUrl)
    const res = await fetch(sUrl)

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Cannot fetch factions...')
    }

    return res.text().then(t=>JSON.parse(t)).catch(e => {console.log("Cannot fetch factions: " + e); return [];})
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
    private generalNames: Map<string, string> = new Map()
    private generals: Faction[] = []
    private factions: Faction[] = []

    constructor(factions: Faction[]) {
        this.generals.push({
            label: BLANK,
            value: 0
        })
        this.generalNames.set("", BLANK)
        factions.forEach(v => {
            if (v.label.toLowerCase().endsWith("general")) {
                this.generals.push(v)
                this.generalNames.set(`${v.value}`, v.label)
            } else {
                this.factions.push(v)
                this.factionNames.set(`${v.value}`, v.label)
            }
        })
    }

    public getFactions() {
        return this.factions
    }

    public getGenerals() {
        return this.generals
    }

    public getGeneralId(general: string) {
        return this.generals.find(f => f.label == general)?.value
    }

    public getFactionId(specific: string) {
        return this.factions.find(f => f.label == specific)?.value
    }


    public getFactionName(id:string) {
        return this.factionNames.get(id)
    }

    public getGeneralName(id:string | null | undefined) {
        return this.generalNames.get(id ?? "")
    }
}

export class MULSearchParams {
    public canSearch: boolean
    specific: string | null
    era: string | null
    general: string | null

    constructor(
        searchParams: ReadonlyURLSearchParams
    ) {
        const era = searchParams.get('era')
        const specific = searchParams.get('specific')
        const general = searchParams.get('general')

        this.canSearch = !(!era || !specific)

        this.specific = specific
        this.era = era
        this.general = general
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

        if (this.general) {
            target.searchParams.append('Factions', this.general)
        }

        return target.href
    }

    public describe(factions: Factions) {
        if (!this.specific || !this.era) {
            return "[Unknown]"
        }
        return `[${factions.getFactionName(this.specific)} including ${factions.getGeneralName(this.general)} during ${eraMap.get(this.era)}]`
    }

}

interface BuilderSearchParams  {
    era: string,
    specific: string,
    general: string,
}

export function parseConstraints(constraints: string, factions: Factions): BuilderSearchParams {
    const parsed = CONSTRAINTS_RE.exec(constraints)
    if (parsed == null) {
        console.log(`Couldn't parse constraints... ${constraints}`)
        return {
            era: "",
            specific: "",
            general: ""
        }
    } 
    const [_, specific, general, era] = parsed

    const [eraId, _1] = eras.find(([_, name]) => name == era) || [null, null]
    const specificId = factions.getFactionId(specific)
    const generalId = factions.getGeneralId(general)

    return {
        era: `${eraId || ""}`,
        specific: `${specificId || ""}`,
        general: `${generalId || ""}`,
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
