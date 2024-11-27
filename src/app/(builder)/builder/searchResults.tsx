'use client'

import ResultGrid from './resultGrid'
import React from 'react'
import Link from 'next/link'
import { MULSearchParams } from '@/app/data'

export default function SearchResults({ search }: { search: MULSearchParams }) {

    if (!search.canSearch) {
        return (
            <div className="w-full text-center items-center my-2 z-10">
                <Link href="/">Please select the search parameters here!</Link>
            </div>
        )
    }

    return (
        <ResultGrid />
    )

}


