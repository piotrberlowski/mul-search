'use client'
import dynamic from "next/dynamic";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Faction, Factions, MULSearchParams } from '../data';
import SearchResults from './searchResults';
import { SearchResultsContext, SearchResultsController } from './searchResultsController';

function Loading({ name }: { name: string }) {
    return (<div>{name} loading...</div>)
}

const ListBuilder = dynamic(
    () => {
        return import('./listBuilder')
    },
    {
        ssr: false
    }
)

export default function CsrPage({ factions }: { factions: Faction[] }) {

    const params = useSearchParams()
    const mulSP = new MULSearchParams(params)

    const listConstraints = mulSP.describe(new Factions(factions))

    return <>
        <div className="bg-inherit">
            <SearchResultsContext.Provider value={new SearchResultsController(listConstraints)}>
                <Suspense fallback={<Loading name="Search Results" />}>
                    <SearchResults search={mulSP} />
                </Suspense>
                <ListBuilder defaultVisible={Boolean(params.get("builder"))} />
            </SearchResultsContext.Provider>
        </div>
    </>

}