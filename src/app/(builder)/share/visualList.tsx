'use client'
import Combinations from '@/components/combinations'
import PlayLink from '@/components/playLink'
import Head from 'next/head'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from "react"
import { MulUnit, parseShare } from '../../../api/shareApi'
import { ISelectedUnit, IUnit, LOCAL_STORAGE_NAME_AUTOSAVE, loadLists, saveByName, saveLists } from '../../../api/unitListApi'
import { EMPTY_UNIT } from '../builder/unitLine'
import { Faction, Factions, MASTER_UNIT_LIST, parseConstraints } from '../data'
import CardGallery from './cardGallery'
import SummaryTable from './summaryTable'


function selectUnit(mulUnit: MulUnit, { Units }: { Units: IUnit[] }): ISelectedUnit {
    console.log(Units)
    const data = Units.find(u => u.Id == mulUnit.id) || EMPTY_UNIT
    return {
        ordinal: mulUnit.ordinal,
        skill: mulUnit.skill,
        lance: mulUnit.lance,
        ...data
    }
}

async function fetchUnit(mu: MulUnit) {
    const url = new URL("/Unit/QuickList", MASTER_UNIT_LIST)
    url.searchParams.append('Name', mu.name)
    return fetch(url.href).then(r => r.json()).then(data => selectUnit(mu, data))
}

async function fetchFromMul(queries: MulUnit[]) {

    return Promise.all(
        queries.map(mu => fetchUnit(mu))
    )

}

function ReadyList({ units, constraints, factions, name, total }: { units: ISelectedUnit[], constraints: string, name: string, total: number, factions: Faction[] }) {
    const router = useRouter()

    function saveList(tweak: boolean) {
        const save = {
            units: units,
            constraints: constraints,
        }
        if (tweak) {
            saveByName(save, LOCAL_STORAGE_NAME_AUTOSAVE)
            const params = parseConstraints(constraints, new Factions(factions))
            router.push("/builder?"+params.toString())
        } else {
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
            <div className="w-full mx-auto flex print:hidden">
                <button className="flex-1 w-1/2" onClick={(e) => saveList(true)}>Tweak Now</button>
                <button className="flex-1 w-1/2" onClick={(e) => saveList(false)}>Save to Local Storage</button>
            </div>
            <div className='text-center w-full print:hidden'>
                <button className="w-full" onClick={(e) => window.print()}>Print</button>
            </div>
            <div className='print:mx-3'>
                <SummaryTable input={units} />
            </div>
            <div className='w-full text-center my-2' style={{ pageBreakAfter: "always" }}>Total PV: {total}</div>
            <div className={`bg-inherit w-full grid grid-cols-2 text-center print:hidden`}>
                <div className='bg-inherit'>
                    <Combinations units={units}>Generate Sub-lists</Combinations>
                </div>
                <div>
                    <PlayLink units={units} className='w-full h-full button-link block'>Play This!</PlayLink>
                </div>
            </div>
            <CardGallery units={units} />
        </>
    )

}

export default function VisualList({factions}:{factions: Faction[]}) {
    const [units, setUnits] = useState<ISelectedUnit[]>(new Array<ISelectedUnit>())
    const params = useSearchParams()

    const listString = params.get('list')
    const constraints = params.get('constraints') ?? "legacy"
    const parsed = parseShare(listString || 'empty;')

    useEffect(
        () => { fetchFromMul(parsed.units).then(setUnits).catch(err => console.log(err)) }
        , [parsed.units])

    let visualisation = <div className="w-full h-full text-center items-center justify-items-center"><span className="loading loading-dots loading-lg"></span></div>

    if (units.length == parsed.units.length) {
        visualisation = <ReadyList units={units} constraints={constraints} name={parsed.name} total={parsed.total} factions={factions} />
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
            {visualisation}
        </>
    )
}
