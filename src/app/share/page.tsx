import {Suspense} from "react"
import VisualList from "./list"
import Link from "next/link"

function ListFallback() {
    return (
        <div>Rendering...</div>
    )
}

export default function SharedList() {

    return (
        <main className="relative items-center align-top bg-inherit">
            <Link href="/">Back to Builder</Link>
            <Suspense fallback={<ListFallback/>}>
                <VisualList/>
            </Suspense>
        </main>
    )
}
