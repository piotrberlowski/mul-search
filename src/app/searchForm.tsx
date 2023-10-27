'use client'
import { useSearchParams } from "next/navigation"
import { Faction, Factions as Factions, eraMap, eras } from "./data"
import SearchInputPanel from "./searchInputPanel"
import { useState } from 'react';
import Link from "next/link";

function renderOptions(factions: Faction[]) {
    return factions
        .map(fa => {
            return (
                <option key={fa.value} value={fa.value || ""}>{fa.label}</option>
            )
        })
}

function renderEras() {
    return eras.map(eraKV => {
        const [val, lab] = eraKV
        return (
            <option key={val} value={val || ""}>{lab}</option>
        )
    })
}

export default function SearchForm({ factions }: { factions: Faction[] }) {

    const fData = new Factions(factions)

    const params = useSearchParams()

    const [spec, setSpec] = useState(params.get('specific')?.toString())
    const [gen, setGen] = useState(params.get('general')?.toString())
    const [era, setEra] = useState(params.get('era')?.toString())


    var mulGenLink
    if (era && spec) {
        mulGenLink = (
            <Link href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${spec}&EraId=${era}`} target="_blank">-&gt; Use this link to find the General List for {fData.getFactionName(spec)} in {eraMap.get(era)} era &lt;-</Link>
        )
    } else {
        mulGenLink = (<></>)
    }

    return (
        <form className="my-1 border border-solid border-gray-800 dark:border-gray-300 p-1 items-center" method='GET' action="/builder">
            <SearchInputPanel title="Faction" className="text-center items-center bg-inherit w-3/4 mx-auto">
                    <select className="flex w-full" name="specific" value={spec} onChange={e => setSpec(e.target.value)}>
                        <option value=''></option>
                        {renderOptions(fData.getFactions())}
                    </select>
            </SearchInputPanel>
            <SearchInputPanel title="Availability Era"className="text-center items-center bg-inherit w-3/4 mx-auto">
                <select name="era" className="flex w-full" value={era} onChange={e => setEra(e.target.value)}>
                    <option value=''></option>
                    {renderEras()}
                </select>
            </SearchInputPanel>
            <div className="w-100 text-center items-ceter">
                {mulGenLink}
            </div>
            <SearchInputPanel title="General List" className="text-center items-center bg-inherit w-3/4 mx-auto">
                    <select className="flex w-full" name="general" value={gen} onChange={e => setGen(e.target.value)}>
                        {renderOptions(fData.getGenerals())}
                    </select>
            </SearchInputPanel>
            <div className="flex-1 text-center">
                <input className="w-3/4" type="submit" value="Search" />
            </div>
        </form>
    )
}