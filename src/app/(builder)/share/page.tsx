import {Suspense} from "react"
import VisualList from "./visualList"
import Link from "next/link"
import { fetchFactions } from "../data"

function ListFallback() {
    return (
        <div>Rendering...</div>
    )
}

export default async function SharedList() {

    const factions = await fetchFactions()

    return (
        <main className="relative items-center align-top bg-inherit">
            <div className="h-8 w-full print:hidden flex flex-row-reverse">
                <div className="flex-0 w-1/2 max-xl:hidden text-center items-center border border-1 border-green-500 rounded-lg align-bottom">
                    <div className="w-full text-xl text-center">Share this with friends!</div>
                </div>
            </div>
            <Suspense fallback={<ListFallback/>}>
                <VisualList factions={factions}/>
            </Suspense>
        </main>
    )
}
