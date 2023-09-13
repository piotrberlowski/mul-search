'use client'
import { useSearchParams } from 'next/navigation'
import { MulUnit, parseShare } from './shareApi'
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, loadLists, saveByName, saveLists } from '../unitListApi'
import Image from 'next/image'
import { useMemo, useState } from "react"
import { MulUnitLine } from './mulUnitLine'
import { useRouter } from 'next/navigation'

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

function SaveButton({target, onClick, ready}: {target: number, onClick: (tweak: boolean)=>void, ready: (callback: (len:number)=>void)=>void}) {
    const [count, setCount] = useState(0)

    if (count >= target) {
        return (
            <div className="w-full mx-auto flex">
                <button className="flex-1 w-1/2" onClick={(e)=>onClick(true)}>Tweak Now</button>
                <button className="flex-1 w-1/2" onClick={(e)=>onClick(false)}>Save to Local Storage</button>
            </div>
        )    
    }

    ready((len:number) => setCount(len))

    return (
        <div className="w-full mx-auto text-center border border-solid dark:border-white border-black">List loading...</div>
    )
}

export default function VisualList() {
    const router = useRouter()
    const params = useSearchParams()

    const listString = params.get('list')
    const parsed = parseShare( listString || 'empty;')

    console.log(`List String: ${listString}, list name: ${parsed.name}`)

    const fetchedList = new Array<ISelectedUnit>()
    let saveButtonFeed = (len:number) => {}
    function onFetch(u: ISelectedUnit) {
        fetchedList.push(u)
        saveButtonFeed(fetchedList.length)
    }

    function saveButtonReady(feed: (len:number) => void) {
        saveButtonFeed = feed
    }

    function saveList(tweak: boolean) {
        if (tweak) {
            saveByName(fetchedList, LOCAL_STORAGE_NAME_AUTOSAVE)
            router.push("/?builder=_")
        } else {
            const name = `imported-${parsed.name}`
            const lists = loadLists()
            saveByName(fetchedList, name)
            if (!lists.find(item => item == name)) {
                lists.push(name)
                saveLists(lists)
            }
        }
    }

    return (
        <>
            <div className='text-center w-full'>
                <div>{parsed.name}</div>
            </div>
            <SaveButton target={parsed.units.length} onClick={saveList} ready={saveButtonReady}/>
            <div>
                {
                    parsed.units.map((u,idx) => (
                        <MulUnitLine key={idx} ordinal={idx} mulUnit={u} onFetch={onFetch} />
                    ))
                }
            </div>
            <div className='w-full text-center my-2'>Total PV: {parsed.total}</div>
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
