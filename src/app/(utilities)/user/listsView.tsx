'use client'

import { materializeUnits } from "@/api/materializeUnits"
import { ConstrainedList, shareQuery } from "@/api/shareApi"
import { storeUnitsForPlay } from "@/components/playLink"
import { builderHref } from "@/app/data"
import { deleteListByKey, findListByKey } from "@/app/api/dao/lists"
import {
    LOCAL_STORAGE_NAME_AUTOSAVE,
    Save,
    WORK_IN_PROGRESS_NAME,
    detachBuilderIdentity,
    loadByName,
    loadLists,
    removeByName,
    saveBuilderIdentity,
    saveByName,
    saveLists,
    totalPV,
} from "@/api/unitListApi"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export type SavedListSummary = {
    key: string
    name: string
    constraints: string
    total: number
}

type MemoryRow = {
    name: string
    total: number
    constraints: string
    save: Save
}

function readMemories(): MemoryRow[] {
    try {
        return loadLists()
            .filter((name) => name && name !== LOCAL_STORAGE_NAME_AUTOSAVE)
            .map((name) => {
                const save = loadByName(name)
                return {
                    name,
                    total: totalPV(save.units),
                    constraints: save.constraints,
                    save,
                }
            })
    } catch (error) {
        console.error(error)
        return []
    }
}

function memoryPrintHref(row: MemoryRow) {
    const params = shareQuery({
        name: row.name,
        total: row.total,
        units: row.save.units,
        constraints: row.save.constraints,
        eraId: row.save.eraId,
        factionId: row.save.factionId,
    })
    return `/share?${params.toString()}`
}

function openInBuilder(save: Save, name: string, serverKey: string | null) {
    saveByName(save, LOCAL_STORAGE_NAME_AUTOSAVE)
    saveBuilderIdentity(serverKey ? { name, serverKey } : { name: WORK_IN_PROGRESS_NAME, serverKey: null })
}

const actionClass = "btn btn-outline btn-xs"

function Actions({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-1">{children}</div>
}

export default function ListsView({
    loggedIn,
    savedLists,
    savedError,
}: {
    loggedIn: boolean
    savedLists: SavedListSummary[]
    savedError: string | null
}) {
    const router = useRouter()
    const [memories, setMemories] = useState<MemoryRow[]>([])
    const [busy, setBusy] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(savedError)

    useEffect(() => {
        setMemories(readMemories())
    }, [])

    function deleteMemory(name: string) {
        const lists = loadLists().filter((item) => item !== name)
        saveLists(lists)
        removeByName(name)
        setMemories(readMemories())
    }

    function editMemory(row: MemoryRow) {
        openInBuilder(row.save, WORK_IN_PROGRESS_NAME, null)
        router.push(builderHref(row.save.eraId, row.save.factionId))
    }

    function playSave(save: Save) {
        storeUnitsForPlay(save.units)
        router.push('/play')
    }

    function unavailableMessage(list: ConstrainedList) {
        if (list.constraints === 'List not found' || list.constraints === 'Server Error!' || list.name === 'Error loading list!') {
            return list.constraints || 'Could not open that list.'
        }
        return 'That list has no units.'
    }

    async function withSavedList(key: string, action: (list: ConstrainedList) => Promise<void>) {
        setBusy(key)
        setNotice(null)
        try {
            const list = await findListByKey(key)
            if (!list.units.length) {
                setNotice(unavailableMessage(list))
                return
            }
            await action(list)
        } catch (error) {
            console.error(error)
            setNotice('Could not open that list.')
        } finally {
            setBusy(null)
        }
    }

    function editSaved(summary: SavedListSummary) {
        return withSavedList(summary.key, async (list) => {
            const units = await materializeUnits(list.units)
            const save: Save = {
                units,
                constraints: list.constraints,
                eraId: list.eraId ?? null,
                factionId: list.factionId ?? null,
            }
            openInBuilder(save, list.name || summary.name, summary.key)
            router.push(builderHref(save.eraId, save.factionId))
        })
    }

    function playSaved(summary: SavedListSummary) {
        return withSavedList(summary.key, async (list) => {
            const units = await materializeUnits(list.units)
            storeUnitsForPlay(units)
            router.push('/play')
        })
    }

    async function deleteSaved(key: string) {
        setBusy(key)
        setNotice(null)
        try {
            await deleteListByKey(key)
            detachBuilderIdentity(key)
            router.refresh()
        } catch (error) {
            console.error(error)
            setNotice('Could not delete that list.')
        } finally {
            setBusy(null)
        }
    }

    return (
        <div className="w-full max-w-screen-lg mx-auto my-4 flex flex-col gap-6">
            <h1 className="text-lg">Lists</h1>
            {notice ? <div role="alert" className="alert alert-error">{notice}</div> : null}
            <section>
                <h2 className="text-base font-semibold mb-2">Memories</h2>
                {memories.length === 0 ? <p className="text-sm">No lists remembered on this device.</p> : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Total PV</th>
                                    <th>Constraints</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memories.map((row) => (
                                    <tr key={row.name}>
                                        <th>{row.name}</th>
                                        <td>{row.total}</td>
                                        <td>{row.constraints}</td>
                                        <td>
                                            <Actions>
                                                <button type="button" className={actionClass} onClick={() => deleteMemory(row.name)}>Delete</button>
                                                <button type="button" className={actionClass} onClick={() => editMemory(row)}>Edit</button>
                                                <button type="button" className={actionClass} onClick={() => router.push(memoryPrintHref(row))}>Print</button>
                                                <button type="button" className={actionClass} onClick={() => playSave(row.save)}>Play</button>
                                            </Actions>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
            {loggedIn ? (
                <section>
                    <h2 className="text-base font-semibold mb-2">Saved lists</h2>
                    {savedLists.length === 0 ? <p className="text-sm">No lists saved yet.</p> : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Total PV</th>
                                        <th>Constraints</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedLists.map((list) => (
                                        <tr key={list.key}>
                                            <th>{list.name}</th>
                                            <td>{list.total}</td>
                                            <td>{list.constraints}</td>
                                            <td>
                                                <Actions>
                                                    <button type="button" className={actionClass} disabled={busy === list.key} onClick={() => deleteSaved(list.key)}>Delete</button>
                                                    <button type="button" className={actionClass} disabled={busy === list.key} onClick={() => editSaved(list)}>Edit</button>
                                                    <button type="button" className={actionClass} onClick={() => router.push(`/share?key=${list.key}`)}>Print</button>
                                                    <button type="button" className={actionClass} disabled={busy === list.key} onClick={() => playSaved(list)}>Play</button>
                                                </Actions>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            ) : null}
        </div>
    )
}
