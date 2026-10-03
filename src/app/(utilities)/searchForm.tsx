'use client'
import { useSearchParams } from "next/navigation"
import { Faction, Factions as Factions, constraintsToParams } from "@/app/data"
import SearchInputPanel from "./searchInputPanel"
import { useEffect, useState } from 'react';
import Link from "next/link";
import { LOCAL_STORAGE_NAME_AUTOSAVE, loadByName } from "@/api/unitListApi";

function renderOptions(factions: Faction[]) {
    return factions
        .map(fa => {
            return (
                <option key={fa.value} value={fa.value || ""}>{fa.label}</option>
            )
        })
}

export default function SearchForm({
    eras,
    factionsByEra,
}: {
    eras: Faction[],
    factionsByEra: { eraId: number, factions: Faction[] }[],
}) {

    const params = useSearchParams()

    const [spec, setSpec] = useState(params.get('specific')?.toString())
    const [era, setEra] = useState(params.get('era')?.toString())
    const [searchLink, setSearchLink] = useState(<></>)
    const factionsForEra = factionsByEra.find((entry) => `${entry.eraId}` === era)?.factions ?? []

    useEffect(() => {
            const load = loadByName(LOCAL_STORAGE_NAME_AUTOSAVE)
            if (load?.units) {
                const fData = new Factions(factionsByEra.flatMap((entry) => entry.factions))
                setSearchLink(<>Last build: <Link href={`/builder/?${constraintsToParams(load.constraints, fData)}`}>{load.constraints}</Link></>)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    function onEra(value: string) {
        setEra(value)
        const allowed = factionsByEra.find((entry) => `${entry.eraId}` === value)?.factions ?? []
        if (!allowed.some((faction) => `${faction.value}` === spec)) {
            setSpec('')
        }
    }

    return (
        <form className="my-1 border border-solid border-gray-800 dark:border-gray-300 p-1 items-center" method='GET' action="/builder">
            <SearchInputPanel title="Availability Era" className="text-center items-center bg-inherit w-3/4 mx-auto">
                <select name="era" className="flex w-full" value={era} onChange={e => onEra(e.target.value)}>
                    <option value=''></option>
                    {renderOptions(eras)}
                </select>
            </SearchInputPanel>
            <SearchInputPanel title="Faction" className="text-center items-center bg-inherit w-3/4 mx-auto">
                    <select className="flex w-full" name="specific" value={spec} onChange={e => setSpec(e.target.value)} disabled={!era}>
                        <option value=''></option>
                        {renderOptions(factionsForEra)}
                    </select>
            </SearchInputPanel>
            <div className="flex-1 text-center">
                <input className="w-3/4" type="submit" value="Search" />
            </div>
            <div className="w-100 text-center items-ceter">
                {searchLink}
            </div>
        </form>
    )
}