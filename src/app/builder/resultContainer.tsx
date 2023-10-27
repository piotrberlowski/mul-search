'use client'

import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import ResultGrid, { MULSearchParams } from './resultGrid'
import React from 'react'
import { AddUnitCallback } from '../api/unitListApi'
import Link from 'next/link'

function resultBody(searchParams: MULSearchParams, onAdd: AddUnitCallback, constraints: string): React.ReactNode {

    if (!searchParams.canSearch) {
        return (
        <div className="w-full text-center items-center my-2">
            <Link href="/">Please select the search parameters here!</Link>
        </div>
        )
    }

    return (
        <ResultGrid search={searchParams} onAdd={onAdd} constraints={constraints}/>
    )
}

export default function ResultContainer({ search, constraints, onAdd }: { search: MULSearchParams, constraints: string, onAdd: AddUnitCallback }) {

    const children = resultBody(search, onAdd, constraints)

    return (
        <div id="resultContainer" className='bg-inherit'>
            {children}
        </div>
    )

}


