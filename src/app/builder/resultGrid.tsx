'use client'

import { ReadonlyURLSearchParams } from 'next/navigation'
import { useReducer, useState } from 'react'
import useSWR from 'swr'
import { Factions, eraMap } from '../data'
import SearchInputPanel from '../searchInputPanel'
import './unitLine'
import UnitLine, { IUnit, UnitComparators, UnitHeader } from './unitLine'
import { SearchResultsController, useSearchResultsContext } from './searchResultsController'

function matchesIfFilter<T>(filter: T | undefined, predicate: (filter: T) => boolean) {
    if (filter) {
        return predicate(filter)
    }
    return true
}

function includesIfFilter(filter: string | undefined, value: string) {
    return matchesIfFilter(filter, (f) => (value) ? value.toLowerCase().includes(f.toLowerCase()) : false)
}

type Sort = {
    column: string,
    order: number,
}

type FilterFields = {
    name?: string
    abilities?: string
    minPV?: number
    maxPV?: number
    dmg?: string
    move?: string
}

class Filter {

    fields: FilterFields

    constructor(
        overrides?: FilterFields
    ) {
        this.fields = {}
        if (overrides) {
            this.fields = { ...overrides }
        }
    }

    public matches(unit: IUnit) {
        return includesIfFilter(this.fields.name, unit.Name)
            && includesIfFilter(this.fields.abilities, unit.BFAbilities)
            && includesIfFilter(this.fields.move, unit.BFMove)
            && matchesIfFilter(this.fields.minPV, (f) => unit.BFPointValue >= f)
            && matchesIfFilter(this.fields.maxPV, (f) => unit.BFPointValue <= f)
            && includesIfFilter(this.fields.dmg, `${unit.BFDamageShort}/${unit.BFDamageMedium}/${unit.BFDamageLong}`)
    }

    public withOverrides(overrides: FilterFields) {
        return new Filter({
            ...this.fields,
            ...overrides
        })
    }
}

type FilterAction = {
    type: string,
    filter: string | undefined,
}

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

    public toUrl(unitType?: string) {
        const target = new URL("http://masterunitlist.info/Unit/QuickList")

        target.searchParams.append('minPV', '1')
        target.searchParams.append('maxPV', '999')
        target.searchParams.append('Factions', this.specific ?? '')
        target.searchParams.append('AvailableEras', this.era ?? '')

        if (unitType) {
            target.searchParams.append('Types', unitType)
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

function QuickFilter({ label, action, filterCallback }: { label: string, action: string, filterCallback: (act: FilterAction) => void }) {
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
            <div className="flex flex-1 sm:w-1/4">
                <div className="flex-none">{label}:</div>
                <div className="flex-1 h-full">
                    <input className="w-full h-full" type='text' value={value} onChange={e => filter(e.target.value)} />
                </div>
                <div className="border border-solid rounded-md flex-none w-5" onClick={e => filter(undefined)}>X</div>
            </div>
        </>
    )
}

function SortOrder({ initial, sortCallback }: { initial: Sort, sortCallback: (sort: Sort) => void }) {
    const [sortState, setSortState] = useState(initial)

    const sortText = (sortState.order > 0) ? "\u21D1" : "\u21D3"

    return (
        <>
            <div className="flex flex-1 sm:w-1/4">
                Sort:
                <select className="flex-1 border border-solid border-black dark:border-white ml-2 h-full" value={sortState.column} onChange={e => {
                    const newState = {
                        column: e.target.value,
                        order: sortState.order,
                    }
                    setSortState(newState)
                    sortCallback(newState)
                }
                }>
                    <option value="Name">Name</option>
                    <option value="BFPointValue">PV</option>
                    <option value="BFMove">Movement Speed</option>
                    <option value="SyntHP">Hit Points</option>
                </select>
                <div className="flex-none border border-solid border-black dark:border-white px-2 rounded-md" onClick={e => {
                    const newState = {
                        column: sortState.column,
                        order: -sortState.order,
                    }
                    setSortState(newState)
                    sortCallback(newState)
                }
                }>
                    {sortText}
                </div>
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
                <div className="w-full flex flex-wrap gap-2">
                    <QuickFilter label="Unit Name" action="name" filterCallback={setFilter} />
                    <QuickFilter label="Abilities" action="abilities" filterCallback={setFilter} />
                    <QuickFilter label="Dmg" action="dmg" filterCallback={setFilter} />
                </div>
                <div className=" w-full flex flex-wrap gap-2">
                    <QuickFilter label="Min PV" action="min-pv" filterCallback={setFilter} />
                    <QuickFilter label="Max PV" action="max-pv" filterCallback={setFilter} />
                    <QuickFilter label="Move" action="move" filterCallback={setFilter} />
                    <SortOrder initial={sort} sortCallback={setSort} />
                </div>
                <div className="mx-5 text-sm">
                    <UnitHeader />
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


export default function ResultGrid({ search }: { search: MULSearchParams }) {
    const controller: SearchResultsController = useSearchResultsContext()
    const [unitType, setUnitType] = useState("18")
    const data = useSearch(search.toUrl(unitType))

    if (typeof (data) === "string") {
        return data
    }

    return (
        <>
            <div className="flex flex-wrap-reverse w-full">
                <SearchInputPanel title="Unit Type" className="flex-1/4 w-1/4">
                    <select name="unitType" className='w-full' value={unitType} onChange={e => setUnitType(e.target.value)}>
                        <option value="18">Battle Mech</option>
                        <option value="19">Vehicle</option>
                        <option value="21">Infantry</option>
                    </select>
                </SearchInputPanel>
                <div className="flex-3/4 flex justify-items-center items-center text-sm w-8/12 mx-auto my-2 min-h-max align-middle border border-solid border-red-500">
                    <div className="mx-auto text-center">Building: {controller.getListConstraints()}</div>
                </div>
            </div>
            <FilteredTable key={unitType} data={data} />
        </>
    )

}
