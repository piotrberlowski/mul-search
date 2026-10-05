'use client'

import { IUnit } from '@/api/unitListApi'
import { useEffect, useMemo, useState } from 'react'
import { MULSearchParams, searchParamsFromIds } from '@/app/data'
import { useFactionsContext, useEraCatalog } from "@/app/factionsContext"
import FilteredTable from './filteredTable'
import { useBuilderContext } from './listBuilderController'
import './unitLine'
import dynamic from 'next/dynamic'
import useEraDialog from './eraDialog'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUnitsForSearch } from '@/app/api/dao/units'
import UnitTypeFilter from './unitTypeFilter'
import { arrangeUnitTypes, defaultSelectedIds, selectionIncludesHeat, UnitTypeOption } from './unitTypes'

export function useSearch(factionId: string | null, eraId: string | null, typeIds: number[]): IUnit[] | string {
    const typeKey = typeIds.join(',')
    const [data, setData] = useState<IUnit[] | string>(typeKey ? 'Loading...' : [])
    const [query, setQuery] = useState({ factionId, eraId, typeKey })

    if (factionId !== query.factionId || eraId !== query.eraId || typeKey !== query.typeKey) {
        setQuery({ factionId, eraId, typeKey })
        setData(typeKey ? 'Loading...' : [])
    }

    useEffect(() => {
        if (!typeKey) {
            setData([])
            return
        }
        const faction = Number(factionId)
        const era = Number(eraId)
        if (!Number.isFinite(faction) || !Number.isFinite(era)) {
            setData('Unable to fetch units...')
            return
        }
        const ids = typeKey.split(',').map(Number)
        let cancelled = false
        getUnitsForSearch(faction, era, ids)
            .then((units) => {
                if (!cancelled) setData(units)
            })
            .catch((error) => {
                console.log(error)
                if (!cancelled) setData('Unable to fetch units...')
            })
        return () => { cancelled = true }
    }, [factionId, eraId, typeKey])

    return data
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

export default function ResultGrid({ unitTypes }: { unitTypes: UnitTypeOption[] }) {
    const factions = useFactionsContext()
    const { eras } = useEraCatalog()
    const controller = useBuilderContext()
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = new MULSearchParams(searchParams)
    const eraName = eras.find((era) => `${era.value}` === (searchParams.get('era') ?? ''))?.label
    const factionName = factions.getFactionName(searchParams.get('specific') ?? '')
    const constraintLabel = (factionName && eraName) ? `[${factionName} during ${eraName}]` : "[Unknown]"
    const arranged = useMemo(() => arrangeUnitTypes(unitTypes), [unitTypes])
    const [selected, setSelected] = useState(() => new Set(defaultSelectedIds(unitTypes)))
    const [expanded, setExpanded] = useState(false)
    const selectedIds = useMemo(() => [...selected].sort((a, b) => a - b), [selected])
    const data = useSearch(params.specific, params.era, selectedIds)
    const mech = selectionIncludesHeat(arranged.all, selected)

    controller.registerConstraintsObserver((save) => {
        if (save.eraId == null || save.factionId == null) return
        router.push("/builder?" + searchParamsFromIds(save.eraId, save.factionId).toString())
    })

    function toggleType(id: number) {
        setSelected((current) => {
            const next = new Set(current)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <>
            <div className="flex w-full">
                <ConstraintsLabel>
                    {constraintLabel}
                </ConstraintsLabel>
                <BuilderLabelDynamic />
            </div>
            <UnitTypeFilter
                folded={arranged.folded}
                all={arranged.all}
                selected={selected}
                expanded={expanded}
                onToggle={toggleType}
                onClear={() => setSelected(new Set())}
                onExpanded={setExpanded}
            />
            <div className="bg-base-100 border-base-300 rounded-md p-2">
                {selectedIds.length === 0 ? (
                    <div className="p-2 text-center text-sm">Select a unit type.</div>
                ) : typeof data === 'string' ? (
                    data
                ) : (
                    <FilteredTable key={`${params.specific}-${params.era}`} data={data} mech={mech} />
                )}
            </div>
        </>
    )

}
