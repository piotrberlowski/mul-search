import {Suspense} from "react"
import Validation from "./validation"
import { getFactionsForUi } from "@/../lib/units/queries"

function ListFallback() {
    return (
        <div>Rendering...</div>
    )
}

export default async function SharedList() {

    const factions = await getFactionsForUi()

    return (
        <main className="relative items-center align-top bg-inherit">
            <Suspense fallback={<ListFallback/>}>
                <Validation factions={factions}/>
            </Suspense>
        </main>
    )
}
