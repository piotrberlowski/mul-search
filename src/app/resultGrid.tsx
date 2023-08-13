'use client'

import { ReadonlyURLSearchParams } from 'next/navigation'
import UnitLine, { Unit } from './unitLine'
import './unitLine'
import useSWR from 'swr'
import {useState} from 'react'

type Sort = {
    column: string,
    order: number,
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

function useSearch(params: MULSearchParams): Unit[] | string {

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

function NameSearch({filterCallback}:{filterCallback: (name: string)=>void}) {
    const [nameFilter, setNameFilter] = useState('')

    function filterName(name: string) {
        setNameFilter(name)
        filterCallback(name)
    }

    return (
        <label className="mx-4">
            Unit Name: <input className="border border-solid border-black dark:border-white ml-2" type='text' value={nameFilter} onChange={e => filterName(e.target.value)}/>
        </label>
    )
}

function SortOrder({initial, sortCallback}:{initial: Sort, sortCallback:(sort:Sort)=>void}) {
    const [sortState, setSortState] = useState(initial)
    return (
        <>
            <label className="mx-4">
                Sort Order:         
                <select className="border border-solid border-black dark:border-white ml-2" value={sortState.column} onChange={e => {
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
                </select>    
                <select className="border border-solid border-black dark:border-white ml-2" value={sortState.order} onChange={e => {
                        const newState = {
                            column: sortState.column,
                            order: +e.target.value, 
                        }
                        setSortState(newState) 
                        sortCallback(newState)
                    }
                }>
                    <option value={1}>Ascending</option>
                    <option value={-1}>Descending</option>
                </select>
            </label>
        </>
    )
}

function FilteredTable({data}:{data:Unit[]}) {
    const initialSort = {
        column: "Name",
        order: -1
    }

    const [units, setUnits] = useState(data)
    const [sort, setSort] = useState(initialSort)

    function filterCallback(name: string) {
        if (typeof data === "string") {
            return
        }
        setUnits(data.filter((unit) => unit.Name.toLowerCase().includes(name.toLowerCase())))
        sortCallback(sort)
    }

    function sortCallback(sort: Sort) {
        type UnitKey = keyof Unit
        const col = sort.column as UnitKey
        units.sort((a,b) => {
            const valA = a[col] 
            const valB = b[col]
            if (valA == valB) return 0
            if (valA > valB) return sort.order
            return -1 * sort.order
        })
       setSort(sort)
    }

    return (
        <>
            <div className="sticky top-0 my-2 items-center text-center bg-inherit">
                <NameSearch filterCallback={filterCallback}/>
                <SortOrder initial={sort} sortCallback={sortCallback}/>
            </div>
            <div className="mx-20 text-sm">
            {
                units.map(entry => {
                    return <UnitLine key={entry.Id} unit={entry} />
                })
            }
            </div>
        </>
    )
}

export default function ResultGrid({search}:{search:MULSearchParams}) {
    const data = useSearch(search)
    
    if (typeof (data) === "string") {
        return data
    }

    return (
        <FilteredTable data={data}/>
    )

}
