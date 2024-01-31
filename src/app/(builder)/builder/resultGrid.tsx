'use client'

import { IUnit, UNIT_TYPES } from '@/api/unitListApi'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ReadonlyURLSearchParams } from 'next/navigation'
import { useReducer, useState } from 'react'
import useSWR from 'swr'
import { Factions, MASTER_UNIT_LIST, eraMap } from '../data'
import { SearchResultsController, useSearchResultsContext } from './searchResultsController'
import './unitLine'
import UnitLine, { UnitComparators, UnitHeader } from './unitLine'
import { FilterAction, Sort, Filter } from './listFilters'

export class MULSearchParams {
    public canSearch: boolean
    specific: string | null
    era: string | null
    general: string | null

    constructor(
        searchParams: ReadonlyURLSearchParams
    ) {
        const era = searchParams.get('era')
        const specific = searchParams.get('specific')
        const general = searchParams.get('general')

        this.canSearch = !(!era || !specific)

        this.specific = specific
        this.era = era
        this.general = general
    }

    public toUrl(unitType?: number) {
        const target = new URL("/Unit/QuickList", MASTER_UNIT_LIST)

        target.searchParams.append('minPV', '1')
        target.searchParams.append('maxPV', '999')
        target.searchParams.append('Factions', this.specific ?? '')
        target.searchParams.append('AvailableEras', this.era ?? '')

        if (unitType) {
            target.searchParams.append('Types', `${unitType}`)
        }

        if (this.general) {
            target.searchParams.append('Factions', this.general)
        }

        return target.href
    }

    public describe(factions: Factions) {
        if (!this.specific || !this.era) {
            return "[Unknown]"
        }
        return `[${factions.getFactionName(this.specific)} including ${factions.getGeneralName(this.general)} during ${eraMap.get(this.era)}]`
    }
}



const fetcher = (url: string) => fetch(url).then((r) => r.json())

function useSearch(url: string): IUnit[] | string {

    console.log(`Trying to fetch ${url}`)

    const { data, error } = useSWR(
        url,
        fetcher
    )

    if (error) {
        console.log(error)
        return 'Unable to fetch units...'
    }

    if (!data) return 'Loading...'

    return data.Units
}

function QuickFilter({ label, action, className, filterCallback, tooltip }: { label: string, action: string, className?: string, filterCallback: (act: FilterAction) => void, tooltip?: string }) {
    const [value, setValue] = useState<string | undefined>('')

    function filter(v: string | undefined) {
        setValue((v == undefined) ? '' : v)
        filterCallback({
            type: action,
            filter: v,
        })
    }

    return (
        <>
            <div className={`flex flex-1 ${className} text-xs md:text-base relative`}>
                <input type="text" placeholder={label} value={value} className="input input-bordered w-full input-xs" onChange={e => filter(e.target.value)} title={tooltip} alt={tooltip} />
                <button className="btn btn-square btn-outline absolute right-0 btn-xs" onClick={e => filter(undefined)}><XMarkIcon className='min-h-4 min-w-4 h-4 w-4 shrink-0 resize-none' /></button>
            </div>
        </>
    )
}

function reduceFilter(filter: Filter, action: FilterAction) {
    switch (action.type) {
        case 'name':
            return filter.withOverrides({ name: action.filter })
        case 'abilities':
            return filter.withOverrides({ abilities: action.filter })
        case 'min-pv':
            return filter.withOverrides({ minPV: (action.filter) ? parseInt(action.filter) : undefined })
        case 'max-pv':
            return filter.withOverrides({ maxPV: (action.filter) ? parseInt(action.filter) : undefined })
        case 'move':
            return filter.withOverrides({ move: action.filter })
        case 'dmg':
            return filter.withOverrides({ dmg: action.filter })
        default:
            return filter
    }
}

function FilteredTable({ data }: { data: IUnit[] }) {

    const [units, setUnits] = useState(data)
    const [filter, setFilter] = useReducer(reduceFilter, new Filter())
    const [sort, setSort] = useState({
        column: 'Name',
        order: 1
    })

    function sortAndFilter(data: IUnit[]) {
        return data
            .filter((unit) => filter.matches(unit))
            .sort((a, b) => UnitComparators[sort.column](a, b) * sort.order)
    }

    return (
        <div className="bg-inherit">
            <div className="sticky z-0 top-0 mt-2 items-center text-center bg-inherit border-b border-b-solid border-b-1 border-b-black dark:border-b-white text-sm">
                <div className="w-full flex flex-wrap gap-x-2 gap-y-1">
                    <QuickFilter label="Unit Name" className="basis-full md:basis-5/12" action="name" filterCallback={setFilter} />
                    <QuickFilter label="Abilities" className="basis-2/5 md:basis-1/4" action="abilities" filterCallback={setFilter} tooltip='Use comma to search for multiple abilities: "AM, MEC"' />
                    <QuickFilter label="Dmg" className="basis-1/5 md:basis-1/4" action="dmg" filterCallback={setFilter} tooltip='"//N" => N at long range, "/5" => 5 at medium, "5/" => 5 at short' />
                    <QuickFilter label="Move" className="basis-1/5 md:basis-1/4" action="move" filterCallback={setFilter} />
                    <QuickFilter label="MinPV" className="basis-1/5 md:basis-1/12" action="min-pv" filterCallback={setFilter} />
                    <QuickFilter label="MaxPV" className="basis-1/5 md:basis-1/12" action="max-pv" filterCallback={setFilter} />
                </div>
                <div className="mx-5 text-sm">
                    <UnitHeader initial={sort} onSort={setSort}/>
                </div>
            </div>
            <div className="mx-5 text-sm mb-2">
                {
                    sortAndFilter(units).map(entry => {
                        return <UnitLine key={entry.Id} unit={entry} />
                    })
                }
            </div>
        </div>
    )
}

function ResultTab({ search, typeId }: { search: MULSearchParams, typeId: number }) {
    const data = useSearch(search.toUrl(typeId))
    if (typeof (data) === "string") {
        return data
    }
    return (
        <FilteredTable data={data} />
    )
}

export default function ResultGrid({ search }: { search: MULSearchParams }) {
    const controller: SearchResultsController = useSearchResultsContext()

    return (
        <>
            <div className="flex flex-wrap-reverse w-full">
                <div className="flex-3/4 flex justify-items-center items-center text-xs md:text-sm w-full md:w-8/12 mx-auto my-2 min-h-max align-middle border border-solid border-red-500">
                    <div className="mx-auto text-center">{controller.getListConstraints()}</div>
                </div>
            </div>
            <div role="tablist" className="tabs tabs-lifted tabs-xs md:tabs-md p-1">
                {
                    UNIT_TYPES.map((t, idx) => (
                        <>
                            <input key={t.Id} type="radio" name="unit_types" role="tab" className="tab text-xs min-w-[65px] md:text-base md:min-w-max" aria-label={t.Name} defaultChecked={idx == 0} />
                            <div key={t.Name} role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-md p-2">
                                <ResultTab search={search} typeId={t.Id} />
                            </div>
                        </>
                    ))
                }
            </div>
        </>
    )

}
