'use client'
import dynamic from "next/dynamic";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Faction, Factions, MULSearchParams } from '@/app/data';
import SearchResults from './searchResults';
import { XCircleIcon } from "@heroicons/react/16/solid";
import { LIST_DRAWER_ID } from "./constants";
import { ListBuilderContext, ListBuilderController } from "./listBuilderController";
import { LOCAL_STORAGE_NAME_AUTOSAVE } from "@/api/unitListApi";

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

export default function BuilderApp({ factions }: { factions: Faction[] }) {

    const params = useSearchParams()
    const mulSP = new MULSearchParams(params)

    const listConstraints = mulSP.describe(new Factions(factions))

    return <>
        <div className="">
            <ListBuilderContext.Provider value={new ListBuilderController(listConstraints, LOCAL_STORAGE_NAME_AUTOSAVE)}>
                <div className="drawer auto-cols-fr xl:drawer-open bg-inherit mx-auto w-[98dvw]">
                    <input id={LIST_DRAWER_ID} type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content col-start-1 bg-inherit mt-8" >
                        <Suspense fallback={<Loading name="Search Results" />}>
                            <SearchResults search={mulSP} />
                        </Suspense>
                    </div>
                    <div className="drawer-side z-20 col-start-2 h-dvh w-dvw flex bg-inherit">
                        <ListBuilder>
                            <label htmlFor={LIST_DRAWER_ID} className="drawer-overlay xl:hidden btn btn-sm btn-error"><XCircleIcon className="h-5 w-5" /></label>
                        </ListBuilder>
                    </div>
                </div>
            </ListBuilderContext.Provider>
        </div>
    </>

}