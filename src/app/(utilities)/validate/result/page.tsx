import {Suspense} from "react"
import Validation from "./validation"
import { parametersDao } from "@/app/api/dao/parametersDao"

function ListFallback() {
    return (
        <div>Rendering...</div>
    )
}

export default async function SharedList() {

    const factions = await parametersDao.getFactions()

    return (
        <main className="relative items-center align-top bg-inherit">
            <Suspense fallback={<ListFallback/>}>
                <Validation factions={factions}/>
            </Suspense>
        </main>
    )
}
