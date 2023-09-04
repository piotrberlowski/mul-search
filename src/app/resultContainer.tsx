'use client'

import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import ResultGrid, { MULSearchParams } from './resultGrid'
import React, {memo} from 'react'
import { AddUnitCallback } from './unitListApi'

function resultBody(searchParams: ReadonlyURLSearchParams, onAdd: AddUnitCallback): React.ReactNode {

    const mulSearch = new MULSearchParams(searchParams)

    if (!mulSearch.canSearch) {
        return (<span>Please select the search parameters.</span>)
    }

    return (
        <ResultGrid search={mulSearch} onAdd={onAdd} />
    )
}

export default function ResultContainer({ onAdd }: { onAdd: AddUnitCallback }) {

    const searchParams = useSearchParams()

    const children = resultBody(searchParams, onAdd)

    return (
        <div id="resultContainer" className='bg-inherit'>
            {children}
        </div>
    )

}


