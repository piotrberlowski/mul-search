import { Suspense } from "react"
import PrintedLists from "./printedLists"

export default function PrintListsPage() {
    return (
        <main className="relative items-center align-top bg-inherit">
            <Suspense fallback={<div>Rendering...</div>}>
                <PrintedLists />
            </Suspense>
        </main>
    )
}
