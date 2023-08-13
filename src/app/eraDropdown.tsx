'use client'
import { useSearchParams } from "next/navigation";
import SearchInputPanel from "./searchInputPanel";
import { useState} from "react"

export default function EraDropdown() {
    const params = useSearchParams()
    
    const [era, setEra] = useState(params.get('era')?.toString())

    return (
       <SearchInputPanel title="Availability Era">
            <select name="era" className='ml-4' value={era} onChange={e => setEra(e.target.value)}>
                <option value="10">Star League</option>
                <option value="11">Early Succession War</option>
                <option value="255">Late Succession War - LosTech</option>
                <option value="256">Late Succession War - Renaissance</option>
                <option value="13">Clan Invasion</option>
                <option value="247">Civil War</option>
                <option value="14">Jihad</option>
                <option value="15">Early Republic</option>
                <option value="254">Late Republic</option>
                <option value="16">Dark Age</option>
                <option value="257">ilClan</option>                
            </select>
        </SearchInputPanel>
    )
}