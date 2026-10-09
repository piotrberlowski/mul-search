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
import { PencilSquareIcon, PlayIcon, PrinterIcon, TrashIcon } from "@heroicons/react/24/outline"
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

function ListAction({
    label,
    icon,
    disabled,
    onClick,
}: {
    label: string
    icon: React.ReactNode
    disabled?: boolean
    onClick: () => void
}) {
    return (
        <button type="button" className="list-action btn btn-outline btn-xs" aria-label={label} disabled={disabled} onClick={onClick}>
            {icon}
            <span className="list-action-label">{label}</span>
        </button>
    )
}

function RowActions({
    disabled,
    onDelete,
    onEdit,
    onPrint,
    onPlay,
}: {
    disabled?: boolean
    onDelete: () => void
    onEdit: () => void
    onPrint: () => void
    onPlay: () => void
}) {
    const icon = "h-3.5 w-3.5 shrink-0"
    return (
        <div className="list-actions">
            <ListAction label="Delete" icon={<TrashIcon className={icon} />} disabled={disabled} onClick={onDelete} />
            <ListAction label="Edit" icon={<PencilSquareIcon className={icon} />} disabled={disabled} onClick={onEdit} />
            <ListAction label="Print" icon={<PrinterIcon className={icon} />} onClick={onPrint} />
            <ListAction label="Play" icon={<PlayIcon className={icon} />} disabled={disabled} onClick={onPlay} />
        </div>
    )
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
                        <table className="table lists-table">
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
                                            <RowActions
                                                onDelete={() => deleteMemory(row.name)}
                                                onEdit={() => editMemory(row)}
                                                onPrint={() => router.push(memoryPrintHref(row))}
                                                onPlay={() => playSave(row.save)}
                                            />
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
                            <table className="table lists-table">
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
                                                <RowActions
                                                    disabled={busy === list.key}
                                                    onDelete={() => deleteSaved(list.key)}
                                                    onEdit={() => editSaved(list)}
                                                    onPrint={() => router.push(`/share?key=${list.key}`)}
                                                    onPlay={() => playSaved(list)}
                                                />
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
