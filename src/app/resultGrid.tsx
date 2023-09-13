'use client'

import { ReadonlyURLSearchParams } from 'next/navigation'
import UnitLine, { UnitHeader, IUnit, UnitComparators } from './unitLine'
import './unitLine'
import useSWR from 'swr'
import { useReducer, useState, memo } from 'react'
import { AddUnitCallback } from './unitListApi'

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
            this.fields = {...overrides}
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
    unitType: string | null
    general: string | null

    constructor(
        searchParams: ReadonlyURLSearchParams
    ) {
        const era = searchParams.get('era')
        const specific = searchParams.get('specific')
        const unitType = searchParams.get('unitType')
        const general = searchParams.get('general')

        this.canSearch = !(!era || !specific || !unitType)

        this.specific = specific
        this.era = era
        this.unitType = unitType
        this.general = general
    }

    public toUrl() {
        const target = new URL("http://masterunitlist.info/Unit/QuickList")

        target.searchParams.append('minPV', '1')
        target.searchParams.append('maxPV', '999')
        target.searchParams.append('Factions', this.specific ?? '')
        target.searchParams.append('AvailableEras', this.era ?? '')
        target.searchParams.append('Types', this.unitType ?? '')

        if (this.general) {
            target.searchParams.append('Factions', this.general)
        }

        return target.href
    }
}



const fetcher = (params: MULSearchParams) => fetch(params.toUrl()).then((r) => r.json())

function useSearch(params: MULSearchParams): IUnit[] | string {

    const { data, error } = useSWR(
        params,
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
    const [value, setValue] = useState<string|undefined>('')

    function filter(v: string|undefined) {
        setValue(v)
        filterCallback({
            type: action,
            filter: v,
        })
    }

    return (
        <>
            <span className="flex-none mr-1">{label}:</span> 
            <input className="h-5 min-h-full flex-1 w-8" type='text' value={value} onChange={e => filter(e.target.value)} />
            <span className="px-2 border border-solid rounded-md flex-none mr-2" onClick={e => {
                filter(undefined)
            }
            }>X</span>
        </>
    )
}

function SortOrder({ initial, sortCallback }: { initial: Sort, sortCallback: (sort: Sort) => void }) {
    const [sortState, setSortState] = useState(initial)

    const sortText = (sortState.order > 0) ? "\u21D1" : "\u21D3"

    return (
        <>
            <label className="mx-0">
                Sort Order:
                <select className="border border-solid border-black dark:border-white ml-2 h-5" value={sortState.column} onChange={e => {
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
                <span className="inline-block border border-solid border-black dark:border-white px-2 rounded-md" onClick={e => {
                    const newState = {
                        column: sortState.column,
                        order: -sortState.order,
                    }
                    setSortState(newState)
                    sortCallback(newState)
                }
                }>
                    {sortText}
                </span>
            </label>
        </>
    )
}

const FilteredTable = memo(
    function FilteredTable({ data, onAdd }: { data: IUnit[], onAdd: AddUnitCallback }) {

        function reduceFilter(filter: Filter, action: FilterAction) {
            switch (action.type) {
                case 'name':
                    return filter.withOverrides({name: action.filter})
                case 'abilities':
                    return filter.withOverrides({abilities: action.filter})
                case 'min-pv':
                    return filter.withOverrides({minPV: (action.filter) ? parseInt(action.filter) : undefined})
                case 'max-pv':
                    return filter.withOverrides({maxPV: (action.filter) ? parseInt(action.filter) : undefined})
                case 'move':
                    return filter.withOverrides({move: action.filter})
                case 'dmg':
                    return filter.withOverrides({dmg: action.filter})
                default:
                    return filter
            }
        }

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
                    <div className="flex">
                        <QuickFilter label="Unit Name" action="name" filterCallback={setFilter} />
                        <QuickFilter label="Abilities" action="abilities" filterCallback={setFilter} />
                        <SortOrder initial={sort} sortCallback={setSort} />
                    </div>
                    <div className="flex w-full max-w-full">
                        <QuickFilter label="Min PV" action="min-pv" filterCallback={setFilter} />
                        <QuickFilter label="Max PV" action="max-pv" filterCallback={setFilter} />
                        <QuickFilter label="Move" action="move" filterCallback={setFilter} />
                        <QuickFilter label="Dmg" action="dmg" filterCallback={setFilter} />
                    </div>
                    <div className="mx-5 text-sm">
                        <UnitHeader />
                    </div>
                </div>
                <div className="mx-5 text-sm mb-2">
                    {
                        sortAndFilter(units).map(entry => {
                            return <UnitLine key={entry.Id} unit={entry} onAdd={onAdd} />
                        })
                    }
                </div>
            </div>
        )
    }
)

export default function ResultGrid({ search, onAdd }: { search: MULSearchParams, onAdd: AddUnitCallback }) {
    const data = useSearch(search)

    if (typeof (data) === "string") {
        return data
    }

    return (
        <FilteredTable data={data} onAdd={onAdd} />
    )

}
