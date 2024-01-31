'use client'

import { IUnit, UNIT_TYPES } from '@/api/unitListApi'
import { ReadonlyURLSearchParams } from 'next/navigation'
import React from 'react'
import useSWR from 'swr'
import { Factions, MASTER_UNIT_LIST, eraMap } from '../data'
import { SearchResultsController, useSearchResultsContext } from './searchResultsController'
import './unitLine'
import FilteredTable from './filteredTable'

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
                        <React.Fragment key={t.Id}>
                            <input type="radio" name="unit_types" role="tab" className="tab text-xs min-w-[65px] md:text-base md:min-w-max" aria-label={t.Name} defaultChecked={idx == 0} />
                            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-md p-2">
                                <ResultTab search={search} typeId={t.Id} />
                            </div>
                        </React.Fragment>
                    ))
                }
            </div>
        </>
    )

}
