import { ConstrainedList, parseShare } from "@/api/shareApi"
import { fetchFactions } from "@/app/data"
import { Suspense } from "react"
import VisualList from "./visualList"
import { findListByKey } from "@/app/api/dao/lists"
import Head from "next/head"

const NOT_FOUND : ConstrainedList = {
    constraints: "NOT FOUND",
    name: "404",
    total: 0,
    units: [],
}

function ListFallback() {
    return (
        <div>Rendering...</div>
    )
}

interface ShareSearchParams {
    key?: string,
    list?: string,
    constraints?: string,
}

async function parseFromUrl(constraints?: string, encodedList?: string): Promise<ConstrainedList> {
    const parsed = parseShare(encodedList || 'empty;')
    return Promise.resolve({
        constraints: constraints || "legacy",
        ...parsed
    })
}

function processParameters(searchParams: ShareSearchParams): Promise<ConstrainedList> {
    if (searchParams.key) {
        return findListByKey(searchParams.key) || NOT_FOUND
    }
    return parseFromUrl(searchParams.constraints, searchParams.list)
}


export default async function SharedList({ searchParams }: { searchParams: ShareSearchParams }) {

    const factions = await fetchFactions()
    const list = await processParameters(searchParams)

    return (
        <main className="relative items-center align-top bg-inherit">
            <Head>
                <meta property="og:title" content={`AS List: ${list.name}`}/>
                <meta property="og:description" content={`Army List for ${list.constraints}`}/>
            </Head>
            <Suspense fallback={<ListFallback />}>
                <VisualList list={list} factions={factions}/>
            </Suspense>
        </main>
    )
}
