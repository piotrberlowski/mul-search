'use client'
import Combinations from '@/components/combinations'
import PlayLink from '@/components/playLink'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from "react"
import { ConstrainedList, MulUnit } from '@/api/shareApi'
import { ISelectedUnit, IUnit, LOCAL_STORAGE_NAME_AUTOSAVE, loadLists, saveByName, saveLists } from '../../../api/unitListApi'
import { EMPTY_UNIT } from '@/app/(builder)/builder/unitLine'
import { Faction, Factions, searchParamsFromIds } from '@/app/data'
import { MetadataContext, type EraFactionList } from "@/app/metadataContext"
import type { UnitTypeOption } from '@/app/(builder)/builder/unitTypes'
import CardGallery from './cardGallery'
import SummaryTable from './summaryTable'
import { list } from 'postcss'
import { resolveUnits } from '@/app/api/dao/units'


function selectUnit(mulUnit: MulUnit, units: IUnit[]): ISelectedUnit {
    const data = units.find(u => u.Id == mulUnit.id || u.Name.trim().toLowerCase() === mulUnit.name.trim().toLowerCase()) || EMPTY_UNIT
    return {
        ordinal: mulUnit.ordinal,
        skill: mulUnit.skill,
        lance: mulUnit.lance,
        ...data
    }
}

async function fetchFromMul(queries: MulUnit[]) {
    const resolved = await resolveUnits(queries.flatMap((unit) => [unit.id, unit.name]))
    const units = Object.values(resolved)
    return queries.map((unit) => selectUnit(unit, units))
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
                if (nextEra != null && nextFaction != null) {
                    router.push("/builder?" + searchParamsFromIds(nextEra, nextFaction).toString())
                }
                return
            }
            const lists = loadLists()
            saveByName(save, name)
            if (!lists.find(item => item == name)) {
                lists.push(name)
                saveLists(lists)
            }
        }
        open(eraId ?? null, factionId ?? null, constraints)
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
                <title>{`AS: ${list.name}`}</title>
                <meta property="og:title" content={`AS: ${list.name}`} key="title" />
                <meta property="og:description" content={`Alpha Strike list shared via AS Builder`} key="description" />
            </Head>
            <div className='text-center w-full'>
                <div>{list.constraints} : {list.name}</div>
            </div>
            {visualisation}
        </MetadataContext.Provider>
    )
}
