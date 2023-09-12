'use client'
import { useSearchParams } from 'next/navigation'
import { MulUnit, parseShare } from './shareApi'
import { ISelectedUnit, currentPV } from '../unitListApi'
import { saveByName } from '../listContainer'
import Image from 'next/image'
import { useMemo } from "react"
import { MulUnitLine } from './mulUnitLine'

function MemoImage({ordinal, unit}:{ordinal:number, unit:MulUnit}) {
    return useMemo(() => (
        <Image
        key={ordinal}
        src={`http://www.masterunitlist.info/Unit/Card/${unit.id}?skill=${unit.skill}`}
        width="558"
        height="399"
        alt={`${unit.id}: ${unit.name} @ ${unit.skill}`}
     />
    ), [ordinal, unit])
}

export default function VisualList() {

    const params = useSearchParams()
    const listString = params.get('list')
    const parsed = parseShare( listString || 'empty;')

    console.log(`List String: ${listString}, list name: ${parsed.name}`)

    const fetchedList = new Array<ISelectedUnit>()
    function onFetch(u: ISelectedUnit) {
        fetchedList.push(u)
    }

    return (
        <>
            <div className='grid grid-cols-2 text-center w-full'>
                <div>{parsed.name}</div>
                <button onClick={(e)=>saveByName(fetchedList, `imported-${parsed.name}`)}>Save to Local</button>
            </div>
            <div>
                {
                    parsed.units.map((u,idx) => (
                        <MulUnitLine key={idx} ordinal={idx} mulUnit={u} onFetch={onFetch} />
                    ))
                }
            </div>
            <div>Total PV: {parsed.total}</div>
            <div className='grid grid-cols-2'>
                {
                    parsed.units.map((u, idx) => (
                        <MemoImage key={idx} unit={u} ordinal={idx}/> 
                    ))
                }
            </div>
        </>
    )
}
