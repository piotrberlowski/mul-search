'use client'

import ResultGrid, { MULSearchParams } from './resultGrid'
import React from 'react'
import Link from 'next/link'

export default function SearchResults({ search }: { search: MULSearchParams }) {

    if (!search.canSearch) {
        return (
        <div className="w-full text-center items-center my-2">
            <Link href="/">Please select the search parameters here!</Link>
        </div>
        )
    }

    return (
        <div id="resultContainer" className='bg-inherit'>
            <ResultGrid search={search} />
        </div>
    )

}


