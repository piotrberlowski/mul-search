import { isFailure } from "@/api/result"
import { ConstrainedList, parseShare } from "@/api/shareApi"
import { parseId, printListHeading } from "@/api/unitListApi"
import { findListByKey } from "@/app/api/dao/lists"
import { parametersDao } from "@/app/api/dao/parametersDao"
import { Suspense } from "react"
import VisualList, { PrintRequest } from "./visualList"
import Head from "next/head"

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

function parseFromUrl(searchParams: ShareSearchParams): ConstrainedList {
    const parsed = parseShare(searchParams.list || 'empty;')
    return {
        ...parsed,
        constraints: searchParams.constraints || "legacy",
        eraId: parseId(searchParams.era),
        factionId: parseId(searchParams.specific),
    }
}

function requestFromParams(searchParams: ShareSearchParams): Promise<PrintRequest> {
    if (searchParams.key) {
        return findListByKey(searchParams.key).then(result =>
            isFailure(result)
                ? { source: 'error', message: result.error }
                : { source: 'remote', list: result.value, serverKey: searchParams.key ?? null }
        )
    }
    if (searchParams.list) return Promise.resolve({ source: 'remote', list: parseFromUrl(searchParams), serverKey: null })
    return Promise.resolve({ source: 'local' })
}

export default async function SharedList({ searchParams }: { searchParams: ShareSearchParams }) {
    return parametersDao.getFactions().then(factions =>
        requestFromParams(searchParams).then(request => {
            const heading = request.source === 'remote'
                ? printListHeading(request.list.constraints, request.list.name)
                : 'Alpha Strike list'
            return (
                <main className="relative items-center align-top bg-inherit">
                    <Head>
                        <meta property="og:title" content={`AS List: ${heading}`} />
                        <meta property="og:description" content={`Army List for ${heading}`} />
                    </Head>
                    <Suspense fallback={<ListFallback />}>
                        <VisualList request={request} factions={factions} />
                    </Suspense>
                </main>
            )
        })
    )
}
