import {Suspense} from "react"
import Validation from "./validation"
import { fetchFactions } from "@/app/data"

function ListFallback() {
    return (
        <div>Rendering...</div>
    )
}

export default async function SharedList() {

    const factions = await fetchFactions()

    return (
        <main className="relative items-center align-top bg-inherit">
            <Suspense fallback={<ListFallback/>}>
                <Validation factions={factions}/>
            </Suspense>
        </main>
    )
}
