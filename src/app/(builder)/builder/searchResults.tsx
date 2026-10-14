'use client'

import ResultGrid from './resultGrid'
import React from 'react'
import Link from 'next/link'
import { useBuilderQuery } from './searchQuery'

export default function SearchResults() {
    const { query } = useBuilderQuery()

    if (!query.canSearch) {
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


