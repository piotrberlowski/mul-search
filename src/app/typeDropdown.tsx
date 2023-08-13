'use client'
import { useSearchParams } from "next/navigation";
import SearchInputPanel from "./searchInputPanel";
import { useState} from "react"

export default function TypeDropdown() {
    const params = useSearchParams()
    
    const [unitType, setUnitType] = useState(params.get('unitType')?.toString())

    return (
       <SearchInputPanel title="Unit Type">
            <select name="unitType" className='ml-4' value={unitType} onChange={e => setUnitType(e.target.value)}>
                <option value="18">Battle Mech</option>
                <option value="19">Vehicle</option>
                <option value="21">Infantry</option>
            </select>
        </SearchInputPanel>
    )
}