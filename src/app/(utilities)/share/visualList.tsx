'use client'
import Combinations from '@/components/combinations'
import PlayLink from '@/components/playLink'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { ConstrainedList, MulUnit } from '@/api/shareApi'
import { ISelectedUnit, IUnit, LOCAL_STORAGE_NAME_AUTOSAVE, loadLists, saveByName, saveLists } from '../../../api/unitListApi'
import { EMPTY_UNIT } from '@/app/(builder)/builder/unitLine'
import { Faction, Factions, MASTER_UNIT_LIST, parseConstraints } from '@/app/data'
import CardGallery from './cardGallery'
import SummaryTable from './summaryTable'
import { list } from 'postcss'


function selectUnit(mulUnit: MulUnit, { Units }: { Units: IUnit[] }): ISelectedUnit {
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
            router.push("/builder?" + params.toString())
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

export default function VisualList({ factions, list }: { factions: Faction[], list: ConstrainedList }) {
    const [units, setUnits] = useState<ISelectedUnit[]>(new Array<ISelectedUnit>())

    useEffect(
        () => {
            fetchFromMul(list.units).then(setUnits).then(() => console.log(JSON.stringify({
                ...list,
            }))).catch(err => console.log(err))
        }
        , [list])

    let visualisation = <div className="w-full h-full text-center items-center justify-items-center"><span className="loading loading-dots loading-lg"></span></div>

    if (units.length == list.units.length) {
        visualisation = <ReadyList units={units} constraints={list.constraints} name={list.name} total={list.total} factions={factions} />
    }

    return (
        <>
            <Head>
                <title>{`AS: ${list.name}`}</title>
                <meta property="og:title" content={`AS: ${list.name}`} key="title" />
                <meta property="og:description" content={`Alpha Strike list shared via AS Builder`} key="description" />
            </Head>
            <div className='text-center w-full'>
                <div>{list.constraints} : {list.name}</div>
            </div>
            {visualisation}
        </>
    )
}
