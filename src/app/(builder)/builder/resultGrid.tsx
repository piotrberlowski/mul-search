'use client'

import { IUnit, UNIT_TYPES } from '@/api/unitListApi'
import React, { useEffect, useState } from 'react'
import { MULSearchParams, searchParamsFromIds } from '@/app/data'
import { resolveListIds } from '@/app/api/dao/listContext'
import { useFactionsContext, useEraCatalog } from "@/app/factionsContext"
import FilteredTable from './filteredTable'
import { ListBuilderController, useBuilderContext } from './listBuilderController'
import './unitLine'
import dynamic from 'next/dynamic'
import useEraDialog from './eraDialog'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUnitsForSearch } from '@/app/api/dao/units'

export function useSearch(factionId: string | null, eraId: string | null, typeId: number): IUnit[] | string {
    const [data, setData] = useState<IUnit[] | string>('Loading...')
    const [query, setQuery] = useState({ factionId, eraId, typeId })

    if (factionId !== query.factionId || eraId !== query.eraId || typeId !== query.typeId) {
        setQuery({ factionId, eraId, typeId })
        setData('Loading...')
    }

    useEffect(() => {
        const faction = Number(factionId)
        const era = Number(eraId)
        if (!Number.isFinite(faction) || !Number.isFinite(era)) {
            setData('Unable to fetch units...')
            return
        }
        let cancelled = false
        getUnitsForSearch(faction, era, typeId)
            .then((units) => {
                if (!cancelled) setData(units)
            })
            .catch((error) => {
                console.log(error)
                if (!cancelled) setData('Unable to fetch units...')
            })
        return () => { cancelled = true }
    }, [factionId, eraId, typeId])

    return data
}

function ResultTab({ search, typeId }: { search: MULSearchParams, typeId: number }) {
    const data = useSearch(search.specific, search.era, typeId)
    if (typeof (data) === "string") {
        return data
    }
    return (
        <FilteredTable key={`${search.specific}-${search.era}-${typeId}`} data={data} mech={typeId == 1}/>
    )
}


const BuilderLabelDynamic = dynamic(() => import('@/app/(builder)/builder/builderLabel'), { ssr: false })

function ConstraintsLabel({children}:{children: React.ReactNode}) {
    const [eraDlg, eraBtn] = useEraDialog(children, "btn btn-outline btn-error mx-auto text-center btn-sm")
    console.log("Re-rendering with constraints " + children)
    return (
        <div className="flex-3/4 flex justify-items-center items-center text-xs md:text-sm w-full md:w-8/12 mx-auto my-2 min-h-max align-middle">
            {eraBtn}
            {eraDlg}
        </div>
    )
}

export default function ResultGrid() {
    const factions = useFactionsContext()
    const { eras } = useEraCatalog()
    const controller = useBuilderContext()
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = new MULSearchParams(searchParams)
    const eraName = eras.find((era) => `${era.value}` === (searchParams.get('era') ?? ''))?.label
    const factionName = factions.getFactionName(searchParams.get('specific') ?? '')
    const constraintLabel = (factionName && eraName) ? `[${factionName} during ${eraName}]` : "[Unknown]"

    controller.registerConstraintsObserver((save) => {
        const open = (eraId: number | null, factionId: number | null) => {
            if (eraId == null || factionId == null) return
            router.push("/builder?" + searchParamsFromIds(eraId, factionId).toString())
        }
        if (save.eraId != null && save.factionId != null) {
            open(save.eraId, save.factionId)
            return
        }
        resolveListIds(save.constraints)
            .then((matched) => open(matched.eraId, matched.factionId))
            .catch((error) => console.log(error))
    })
    
    return (
        <>
            <div className="flex w-full">
                <ConstraintsLabel>
                    {constraintLabel}
                </ConstraintsLabel>
                <BuilderLabelDynamic />
            </div>
            <div role="tablist" className="tabs tabs-lifted tabs-xs md:tabs-md p-1">
                {
                    UNIT_TYPES.map((t, idx) => (
                        <React.Fragment key={t.Id}>
                            <input type="radio" name="unit_types" role="tab" className="tab text-xs min-w-[65px] md:text-base md:min-w-max" aria-label={t.Name} defaultChecked={idx == 0} />
                            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-md p-2">
                                <ResultTab search={params} typeId={t.Id} />
                            </div>
                        </React.Fragment>
                    ))
                }
            </div>
        </>
    )

}
