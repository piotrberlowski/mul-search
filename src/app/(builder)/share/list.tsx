'use client'
import { useSearchParams } from 'next/navigation'
import { MulUnit, compareSelectedUnits, parseShare } from '../../../api/shareApi'
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, loadLists, saveByName, saveLists } from '../../../api/unitListApi'
import Image from 'next/image'
import { useMemo, useState } from "react"
import { MulUnitLine } from './mulUnitLine'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import Combinations from '../../../components/combinations'
import PlayLink from '@/components/playLink'
import { unstable_noStore } from 'next/cache'

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
            <div className="w-full mx-auto flex print:hidden">
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
    const [ready, setReady] = useState(false)
    const router = useRouter()
    const params = useSearchParams()

    const listString = params.get('list')
    const constraints = params.get('constraints') ?? "legacy"
    const parsed = parseShare( listString || 'empty;')

    const fetchedList = new Array<ISelectedUnit>()
    let saveButtonFeed = (len:number) => {}
    let combinationsFeed = (len:number) => {}

    function onFetch(u: ISelectedUnit) {
        if (!fetchedList.find( x => x.ordinal == u.ordinal)) {
            fetchedList.push(u)
        }
        fetchedList.sort(compareSelectedUnits)
        setReady(fetchedList.length == parsed.units.length)
        saveButtonFeed(fetchedList.length)
        combinationsFeed(fetchedList.length)
    }

    function saveButtonReady(feed: (len:number) => void) {
        saveButtonFeed = feed
    }

    function combinationsReady(feed: (len:number) => void) {
        combinationsFeed = feed
    }

    function saveList(tweak: boolean) {
        const save = {
            units: fetchedList,
            constraints: constraints,
        }
        if (tweak) {
            saveByName(save, LOCAL_STORAGE_NAME_AUTOSAVE)
            router.push("/?builder=_")
        } else {
            const name = `imported-${parsed.name}`
            const lists = loadLists()
            saveByName(save, name)
            if (!lists.find(item => item == name)) {
                lists.push(name)
                saveLists(lists)
            }
        }
    }

    return (
        <>
            <Head>
                <title>{`AS: ${parsed.name}`}</title>
                <meta property="og:title" content={`AS: ${parsed.name}`} key="title" />
                <meta property="og:description" content={`Alpha Strike list shared via AS Builder`} key="description" />
            </Head>
            <div className='text-center w-full'>
                <div>{constraints} : {parsed.name}</div>
            </div>
            <SaveButton target={parsed.units.length} onClick={saveList} ready={saveButtonReady}/>
            <div className='text-center w-full print:hidden'>
                <button className="w-full" onClick={(e)=>window.print()}>Print</button>
            </div>
            <div>
                {
                    parsed.units.map((u,idx) => (
                        <MulUnitLine key={idx} ordinal={idx} mulUnit={u} onFetch={onFetch} />
                    ))
                }
            </div>
            <div className='w-full text-center my-2'>Total PV: {parsed.total}</div>
            <div className={`w-full grid grid-cols-2 text-center ${ready ? '' : 'hidden'}`}>
                <div className='bg-inherit'>
                    <Combinations target={parsed.units.length} ready={combinationsReady} units={fetchedList}/>
                </div>
                <div>
                    <PlayLink units={fetchedList} className='w-full h-full button-link block'>Play This!</PlayLink>
                </div>
            </div>
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
