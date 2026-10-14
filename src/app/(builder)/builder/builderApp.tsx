'use client'
import { LOCAL_STORAGE_NAME_AUTOSAVE } from "@/api/unitListApi";
import { Faction, Factions, MULSearchParams } from '@/app/data';
import { MetadataContext } from "@/app/metadataContext";
import { XCircleIcon } from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LIST_DRAWER_ID } from "./constants";
import { ListBuilderContext, ListBuilderController } from "./listBuilderController";
import SearchResults from './searchResults';
import { BuilderQuery, BuilderQueryContext } from './searchQuery';
import { UnitTypeOption } from './unitTypes';

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

export default function BuilderApp({
    factions,
    eras,
    factionsByEra,
    unitTypes,
}: {
    factions: Faction[],
    eras: Faction[],
    factionsByEra: { eraId: number, factions: Faction[] }[],
    unitTypes: UnitTypeOption[],
}) {

    const params = useSearchParams()
    const [query, setQueryState] = useState<BuilderQuery>(() => ({
        era: params.get('era'),
        specific: params.get('specific'),
    }))
    const skipUrlWrite = useRef(true)
    const fromHistory = useRef(false)
    const mulSP = useMemo(() => {
        const next = new URLSearchParams()
        if (query.era) next.set('era', query.era)
        if (query.specific) next.set('specific', query.specific)
        return new MULSearchParams(next as unknown as ReadonlyURLSearchParams)
    }, [query.era, query.specific])
    const factionData = useMemo(() => new Factions(factions), [factions])
    const metadata = useMemo(() => ({
        factions: factionData,
        eras,
        factionsByEra,
        unitTypes,
    }), [factionData, eras, factionsByEra, unitTypes])
    const eraName = eras.find((era) => `${era.value}` === (mulSP.era ?? ''))?.label
    const factionName = factionData.getFactionName(mulSP.specific ?? '')
    const listConstraints = (factionName && eraName)
        ? `[${factionName} during ${eraName}]`
        : "[Unknown]"
    const controllerRef = useRef<ListBuilderController | null>(null)
    if (!controllerRef.current) {
        controllerRef.current = new ListBuilderController(listConstraints, LOCAL_STORAGE_NAME_AUTOSAVE, mulSP.era, mulSP.specific)
    } else {
        controllerRef.current.setSearch(listConstraints, mulSP.era, mulSP.specific)
    }

    const setQuery = useCallback((next: BuilderQuery) => {
        setQueryState((current) => (
            current.era === next.era && current.specific === next.specific
        ) ? current : next)
    }, [])
    const queryValue = useMemo(() => ({ query, setQuery }), [query, setQuery])

    useEffect(() => {
        if (skipUrlWrite.current) {
            skipUrlWrite.current = false
            return
        }
        if (fromHistory.current) {
            fromHistory.current = false
            return
        }
        const next = new URLSearchParams(window.location.search)
        if (query.era) next.set('era', query.era)
        else next.delete('era')
        if (query.specific) next.set('specific', query.specific)
        else next.delete('specific')
        const nextUrl = `${window.location.pathname}?${next.toString()}`
        const currentUrl = `${window.location.pathname}${window.location.search}`
        if (nextUrl !== currentUrl) {
            window.history.pushState(null, '', nextUrl)
        }
    }, [query.era, query.specific])

    useEffect(() => {
        function onPopState() {
            const next = new URLSearchParams(window.location.search)
            fromHistory.current = true
            setQueryState({
                era: next.get('era'),
                specific: next.get('specific'),
            })
        }
        window.addEventListener('popstate', onPopState)
        return () => window.removeEventListener('popstate', onPopState)
    }, [])

    return <>
        <div className="">
            <MetadataContext.Provider value={metadata}>
                <BuilderQueryContext.Provider value={queryValue}>
                <ListBuilderContext.Provider value={controllerRef.current}>
                    <div className="drawer auto-cols-fr xl:drawer-open bg-inherit mx-auto w-full">
                        <input id={LIST_DRAWER_ID} type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content col-start-1 bg-inherit mt-8" >
                            <Suspense fallback={<Loading name="Search Results" />}>
                                <SearchResults search={mulSP} />
                            </Suspense>
                        </div>
                        <div className="drawer-side z-20 col-start-2 h-dvh w-full flex bg-inherit">
                            <ListBuilder>
                                <label htmlFor={LIST_DRAWER_ID} className="drawer-overlay xl:hidden btn btn-sm btn-error"><XCircleIcon className="h-5 w-5" /></label>
                            </ListBuilder>
                        </div>
                    </div>
                </ListBuilderContext.Provider>
                </BuilderQueryContext.Provider>
            </MetadataContext.Provider>
        </div>
    </>

}