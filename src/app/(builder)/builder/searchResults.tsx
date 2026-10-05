'use client'

import ResultGrid from './resultGrid'
import React from 'react'
import Link from 'next/link'
import { MULSearchParams } from '@/app/data'
import { UnitTypeOption } from './unitTypes'

export default function SearchResults({ search, unitTypes }: { search: MULSearchParams, unitTypes: UnitTypeOption[] }) {

    if (!search.canSearch) {
        return (
            <div className="w-full text-center items-center my-2 z-10">
                <Link href="/">Please select the search parameters here!</Link>
            </div>
        )
    }

    return (
        <ResultGrid unitTypes={unitTypes} />
    )

}


