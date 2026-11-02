'use client'
import Combinations from '@/components/combinations'
import PlayLink from '@/components/playLink'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from "react"
import { ConstrainedList, MulUnit } from '@/api/shareApi'
import { materializeUnits } from '@/api/materializeUnits'
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, defaultBuilderIdentity, loadLists, printListHeading, saveBuilderIdentity, saveByName, saveLists, validateStoredListName } from '../../../api/unitListApi'
import { Faction, Factions, searchParamsFromIds } from '@/app/data'
import { MetadataContext, type EraFactionList } from "@/app/metadataContext"
import type { UnitTypeOption } from '@/app/(builder)/builder/unitTypes'
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
                saveBuilderIdentity(defaultBuilderIdentity())
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

export default function VisualList({ list, factions, eras, factionsByEra, unitTypes }: { list: ConstrainedList, factions: Faction[], eras: Faction[], factionsByEra: EraFactionList[], unitTypes: UnitTypeOption[] }) {
    const metadata = useMemo(() => ({
        factions: new Factions(factions),
        eras,
        factionsByEra,
        unitTypes,
    }), [factions, eras, factionsByEra, unitTypes])
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
        <MetadataContext.Provider value={metadata}>
            <Head>
                <title>{`AS: ${printListHeading(list.constraints, list.name)}`}</title>
                <meta property="og:title" content={`AS: ${printListHeading(list.constraints, list.name)}`} key="title" />
                <meta property="og:description" content={`Alpha Strike list shared via AS Builder`} key="description" />
            </Head>
            <div className='text-center w-full'>
                <div>{printListHeading(list.constraints, list.name)}</div>
            </div>
            {visualisation}
        </MetadataContext.Provider>
    )
}
