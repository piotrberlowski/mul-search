import { ConstrainedList, parseShare } from "@/api/shareApi"
import { printListHeading } from "@/api/unitListApi"
import { parametersDao } from "@/app/api/dao/parametersDao"
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
    era?: string,
    specific?: string,
}

function idFromParam(value?: string): number | null {
    if (value == null || value === '') return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

async function parseFromUrl(searchParams: ShareSearchParams): Promise<ConstrainedList> {
    const parsed = parseShare(searchParams.list || 'empty;')
    return {
        ...parsed,
        constraints: searchParams.constraints || "legacy",
        eraId: idFromParam(searchParams.era),
        factionId: idFromParam(searchParams.specific),
    }
}

function processParameters(searchParams: ShareSearchParams): Promise<ConstrainedList> {
    if (searchParams.key) {
        return findListByKey(searchParams.key) || NOT_FOUND
    }
    return parseFromUrl(searchParams)
}


export default async function SharedList({ searchParams }: { searchParams: ShareSearchParams }) {

    const factions = await parametersDao.getFactions()
    const list = await processParameters(searchParams)

    return (
        <main className="relative items-center align-top bg-inherit">
            <Head>
                <meta property="og:title" content={`AS List: ${printListHeading(list.constraints, list.name)}`}/>
                <meta property="og:description" content={`Army List for ${list.constraints}`}/>
            </Head>
            <Suspense fallback={<ListFallback />}>
                <VisualList list={list} factions={factions}/>
            </Suspense>
        </main>
    )
}
