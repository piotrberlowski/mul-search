import {Suspense} from "react"
import Validation from "./validation"

function ListFallback() {
    return (
        <div>Rendering...</div>
    )
}

export default async function SharedList() {

    return (
        <main className="relative items-center align-top bg-inherit">
            <Suspense fallback={<ListFallback/>}>
                <Validation/>
            </Suspense>
        </main>
    )
}
