export const MASTER_UNIT_LIST = "https://masterunitlist.azurewebsites.net/"
const BLANK = "Blank General List"

export type Faction = {
    label: string,
    value: number,
}

export async function fetchFactions() {
    const url = new URL("/Faction/Autocomplete?term=", MASTER_UNIT_LIST)
    const res = await fetch(url.toString())

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Cannot fetch factions...')
    }

    return res.json()
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

    public getFactionName(id:string) {
        return this.factionNames.get(id)
    }

    public getGeneralName(id:string | null | undefined) {
        return this.generalNames.get(id ?? "")
    }
}