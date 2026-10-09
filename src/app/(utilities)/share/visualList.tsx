'use client'
import { copyShareLink, savedListHref, shareHref, shareHrefFromMul, ConstrainedList } from '@/api/shareApi'
import { materializeUnits } from '@/api/materializeUnits'
import { ISelectedUnit, WORK_IN_PROGRESS_NAME, loadStagedList, printListHeading, stageList, totalPV } from '../../../api/unitListApi'
import { Faction, Factions, builderHref } from '@/app/data'
import { FactionsContext } from "@/app/factionsContext"
import Combinations from '@/components/combinations'
import PlayLink from '@/components/playLink'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import CardGallery from './cardGallery'
import SummaryTable from './summaryTable'

export type PrintRequest =
    | { source: 'local' }
    | { source: 'remote', list: ConstrainedList, serverKey: string | null }
    | { source: 'error', message: string }

type ReadyList = {
    kind: 'ready'
    units: ISelectedUnit[]
    constraints: string
    name: string
    total: number
    eraId: number | null
    factionId: number | null
    sharePath: string
    fromStorage: boolean
}

type ResolvedList = ReadyList | { kind: 'error', message: string }

function requestKey(request: PrintRequest) {
    if (request.source !== 'remote') return request.source
    const ids = request.list.units.map(unit => `${unit.id}:${unit.ordinal}`).join(',')
    return `remote:${request.serverKey ?? ''}:${request.list.name}:${ids}`
}

function fromStorage(): ResolvedList {
    const staged = loadStagedList()
    const total = totalPV(staged.save.units)
    return {
        kind: 'ready',
        units: staged.save.units,
        constraints: staged.save.constraints,
        name: staged.name,
        total,
        eraId: staged.save.eraId,
        factionId: staged.save.factionId,
        sharePath: shareHref({
            name: staged.name,
            total,
            units: staged.save.units,
            constraints: staged.save.constraints,
            eraId: staged.save.eraId,
            factionId: staged.save.factionId,
        }),
        fromStorage: true,
    }
}

function PrintBody({ list }: { list: ReadyList }) {
    const router = useRouter()
    const [status, setStatus] = useState<string | null>(null)
    const heading = printListHeading(list.constraints, list.name)

    useEffect(() => {
        document.title = `AS: ${heading}`
    }, [heading])

    function tweak() {
        if (!list.fromStorage) {
            stageList({
                units: list.units,
                constraints: list.constraints,
                eraId: list.eraId,
                factionId: list.factionId,
            }, WORK_IN_PROGRESS_NAME, null)
        }
        router.push(builderHref(list.eraId, list.factionId))
    }

    function share() {
        copyShareLink(list.sharePath).then(error => setStatus(error ?? 'Link copied.'))
    }

    if (!list.units.length) {
        return (
            <div className="text-center my-6">
                <p>No list to print yet. Build a list, then choose Print.</p>
                <button type="button" className="mt-3 print:hidden" onClick={tweak}>Tweak Now</button>
            </div>
        )
    }

    return (
        <>
            <div className="text-center w-full">
                <div>{heading}</div>
            </div>
            <div className="w-full mx-auto flex print:hidden">
                <button type="button" className="flex-1 w-1/2" onClick={tweak}>Tweak Now</button>
                <button type="button" className="flex-1 w-1/2" onClick={share}>Share</button>
            </div>
            <div className="text-center w-full print:hidden">
                <button type="button" className="w-full" onClick={() => window.print()}>Print</button>
            </div>
            {status ? <p role="status" className="text-center print:hidden">{status}</p> : null}
            <div className="print:mx-3">
                <SummaryTable input={list.units} />
            </div>
            <div className="w-full text-center my-2" style={{ pageBreakAfter: "always" }}>Total PV: {list.total}</div>
            <div className="bg-inherit w-full grid grid-cols-2 text-center print:hidden">
                <div className="bg-inherit">
                    <Combinations units={list.units}>Generate Sub-lists</Combinations>
                </div>
                <div>
                    <PlayLink units={list.units} className="w-full h-full button-link block">Play This!</PlayLink>
                </div>
            </div>
            <CardGallery units={list.units} />
        </>
    )
}

export default function VisualList({ request, factions }: { request: PrintRequest, factions: Faction[] }) {
    const key = requestKey(request)
    const [resolved, setResolved] = useState<ResolvedList | null>(null)

    useEffect(() => {
        if (request.source === 'error') return
        let cancelled = false
        const apply = (next: ResolvedList) => {
            if (!cancelled) setResolved(next)
        }
        const load = () => {
            if (request.source === 'local') {
                try {
                    apply(fromStorage())
                } catch (error) {
                    console.error(error)
                    apply({ kind: 'error', message: 'Could not read the list on this device.' })
                }
                return
            }
            const list = request.list
            const serverKey = request.serverKey
            materializeUnits(list.units).then(units => {
                apply({
                    kind: 'ready',
                    units,
                    constraints: list.constraints,
                    name: list.name,
                    total: list.total,
                    eraId: list.eraId ?? null,
                    factionId: list.factionId ?? null,
                    sharePath: serverKey ? savedListHref(serverKey) : shareHrefFromMul(list),
                    fromStorage: false,
                })
            }).catch(error => {
                console.error(error)
                apply({ kind: 'error', message: 'Could not load units.' })
            })
        }
        load()
        window.addEventListener('pageshow', load)
        return () => {
            cancelled = true
            window.removeEventListener('pageshow', load)
        }
    }, [key, request])

    let body = <div className="w-full h-full text-center items-center justify-items-center"><span className="loading loading-dots loading-lg"></span></div>
    if (request.source === 'error') {
        body = <p className="text-center my-6">{request.message}</p>
    } else if (resolved?.kind === 'error') {
        body = <p className="text-center my-6">{resolved.message}</p>
    } else if (resolved?.kind === 'ready') {
        body = <PrintBody list={resolved} />
    }

    return (
        <FactionsContext.Provider value={new Factions(factions)}>
            {body}
        </FactionsContext.Provider>
    )
}
