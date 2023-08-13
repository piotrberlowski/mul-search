'use client'
import { useSearchParams } from "next/navigation"
import { Faction } from "./data"
import SearchInputPanel from "./searchInputPanel"
import { useState } from 'react';

export interface FactionProps {
    factions: Faction[]
}

function renderOptions(factions: Faction[]) {
    return factions
    .map(fa => {
        return (
            <option key={fa.value} value={fa.value}>{fa.label}</option>
        )
    })
}


export function FactionDropdown(props: FactionProps) {
    let general:Faction[] = []
    let specific:Faction[] = []
    props.factions.forEach(v => {
        if (v.label.toLowerCase().endsWith("general")) {
            general.push(v)
        } else {
            specific.push(v)
        }
    })
    
    const params = useSearchParams()
    
    const [spec, setSpec] = useState(params.get('specific')?.toString())
    const [gen, setGen] = useState(params.get('general')?.toString())

    return (
        <SearchInputPanel title="Unit List">
            <label className="mx-4">
                Faction:
                <select className='ml-4' name="specific" value={spec} onChange={e => setSpec(e.target.value)}>
                    <option value=''></option>
                    {renderOptions(specific)}
                </select>
            </label>
            <label className="mx-4">
                General List:
                <select className='ml-4' name="general" value={gen} onChange={e => setGen(e.target.value)}>
                    <option value=''>Blank General List</option>
                    {renderOptions(general)}
                </select>
            </label>
        </SearchInputPanel>
    )
}