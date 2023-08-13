export type Faction = {
    label: string,
    value: number,
}

export async function fetchFactions() {
    const res = await fetch("http://www.masterunitlist.info/Faction/Autocomplete?term=")

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Cannot fetch factions...')
    }

    return res.json()
}
