'use client'

import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import ResultGrid, { MULSearchParams } from './resultGrid'
import React from 'react'

function resultBody(searchParams: ReadonlyURLSearchParams): React.ReactNode {

    const mulSearch = new MULSearchParams(searchParams)

    if (!mulSearch.canSearch) {
        return (<span>Please select the search parameters.</span>)
    }

    return (
        <ResultGrid search={mulSearch}/>
    )
}

export default function ResultContainer() {

    const searchParams = useSearchParams()

    const children = resultBody(searchParams)

    return (
        <div id="resultContainer" className='bg-inherit'>
            {children}
        </div>
    )

}


