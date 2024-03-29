'use client'

import { IUnit, UNIT_TYPES } from '@/api/unitListApi'
import React from 'react'
import { MULSearchParams } from '../data'
import FilteredTable from './filteredTable'
import { SearchResultsController, useSearchResultsContext } from './searchResultsController'
import './unitLine'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useSearch(url: string): IUnit[] | string {

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
