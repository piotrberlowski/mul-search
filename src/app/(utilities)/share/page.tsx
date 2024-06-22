import { Suspense } from "react"
import VisualList from "./visualList"
import { fetchFactions } from "@/app/data"
import { MulUnit, MulList, ConstrainedList, parseShare } from "@/api/shareApi"
import prisma from "@/../lib/prisma"
import { Prisma } from "@prisma/client"

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

function fetchFromDb(key: string): Promise<ConstrainedList> {

    return prisma.list.findUnique({
        where: { key: key }
    }).then(
        (list) => {
            if (list && list.content) {
                return {
                    constraints: list.constraints,
                    name: list.name,
                    total: list.total,
                    units: (list.content as Prisma.JsonArray).map(o => o as MulUnit),
                }
            }
            return {
                constraints: "List not found",
                name: "Empty",
                total: 0,
                units: [],
            }
        }
    ).catch(e => {
        console.error(e)
        return {
            constraints: e as string,
            name: "Error loading list!",
            total: 0,
            units: [],
        }
    })
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
        return fetchFromDb(searchParams.key)
    }
    return parseFromUrl(searchParams.constraints, searchParams.list)
}


export default async function SharedList({ searchParams }: { searchParams: ShareSearchParams }) {

    const factions = await fetchFactions()
    const list = await processParameters(searchParams)

    return (
        <main className="relative items-center align-top bg-inherit">
            <Suspense fallback={<ListFallback />}>
                <VisualList factions={factions} list={list} />
            </Suspense>
        </main>
    )
}
