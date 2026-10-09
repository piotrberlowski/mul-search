'use client'
import Combinations from '@/components/combinations'
import PlayLink from '@/components/playLink'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { ConstrainedList, MulUnit } from '@/api/shareApi'
import { materializeUnits } from '@/api/materializeUnits'
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, loadLists, printListHeading, saveBuilderIdentity, saveByName, saveLists, validateStoredListName, WORK_IN_PROGRESS_NAME } from '../../../api/unitListApi'
import { Faction, Factions, searchParamsFromIds } from '@/app/data'
import { FactionsContext } from "@/app/factionsContext"
import CardGallery from './cardGallery'
import SummaryTable from './summaryTable'
async function fetchFromMul(queries: MulUnit[]) {
    return materializeUnits(queries)
}

function ReadyList({ units, constraints, name, total, eraId, factionId }: { units: ISelectedUnit[], constraints: string, name: string, total: number, eraId?: number | null, factionId?: number | null }) {
    const router = useRouter()

    function saveList(tweak: boolean) {
        const open = (nextEra: number | null, nextFaction: number | null, label: string) => {
            const save = {
                units: units,
                constraints: label,
                eraId: nextEra,
                factionId: nextFaction,
            }
            if (tweak) {
                saveByName(save, LOCAL_STORAGE_NAME_AUTOSAVE)
                saveBuilderIdentity({ name: WORK_IN_PROGRESS_NAME, serverKey: null })
                if (nextEra != null && nextFaction != null) {
                    router.push("/builder?" + searchParamsFromIds(nextEra, nextFaction).toString())
                }
                return
            }
            const memoryName = validateStoredListName(name) ? constraints : name
            if (validateStoredListName(memoryName)) {
                alert('Name this list in the builder before remembering it.')
                return
            }
            const lists = loadLists()
            saveByName(save, memoryName)
            if (!lists.find(item => item == memoryName)) {
                lists.push(memoryName)
                saveLists(lists)
            }
        }
        open(eraId ?? null, factionId ?? null, constraints)
    }

    return (
        <>
            <div className="w-full mx-auto flex print:hidden">
                <button className="flex-1 w-1/2" onClick={(e) => saveList(true)}>Tweak Now</button>
                <button className="flex-1 w-1/2" onClick={(e) => saveList(false)}>Remember for later</button>
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

export default function VisualList({ list, factions }: { list: ConstrainedList, factions: Faction[] }) {
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
        visualisation = <ReadyList units={units} constraints={list.constraints} name={list.name} total={list.total} eraId={list.eraId} factionId={list.factionId} />
    }

    return (
        <FactionsContext.Provider value={new Factions(factions)}>
            <Head>
                <title>{`AS: ${printListHeading(list.constraints, list.name)}`}</title>
                <meta property="og:title" content={`AS: ${printListHeading(list.constraints, list.name)}`} key="title" />
                <meta property="og:description" content={`Alpha Strike list shared via AS Builder`} key="description" />
            </Head>
            <div className='text-center w-full'>
                <div>{printListHeading(list.constraints, list.name)}</div>
            </div>
            {visualisation}
        </FactionsContext.Provider>
    )
}
