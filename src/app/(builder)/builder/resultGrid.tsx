'use client'

import { IUnit, UNIT_TYPES } from '@/api/unitListApi'
import React, { useState } from 'react'
import useSWR from 'swr'
import { Factions, MULSearchParams, constraintsToParams } from '@/app/data'
import { useFactionsContext } from "@/app/factionsContext"
import FilteredTable from './filteredTable'
import { ListBuilderController, useBuilderContext } from './listBuilderController'
import './unitLine'
import dynamic from 'next/dynamic'
import useEraDialog from './eraDialog'
import { useRouter, useSearchParams } from 'next/navigation'

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
        <FilteredTable key={search.toUrl(typeId)} data={data} />
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
    const controller = useBuilderContext()
    const router = useRouter()
    const params = new MULSearchParams(useSearchParams())

    controller.registerConstraintsObserver((constraints) => {
        console.log("Re-setting constraints: " + constraints)
        const newParams = constraintsToParams(constraints, factions).toString()
        router.push(
            "/builder?"+newParams
        )
    })
    
    return (
        <>
            <div className="flex w-full">
                <ConstraintsLabel>
                    {params.describe(factions)}
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
