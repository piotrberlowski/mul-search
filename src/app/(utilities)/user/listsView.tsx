'use client'

import { materializeUnits } from "@/api/materializeUnits"
import { ConstrainedList, savedListHref, shareHref } from "@/api/shareApi"
import useCopiedLinkDialog from "@/components/copiedLinkDialog"
import { storeUnitsForPlay } from "@/components/playLink"
import { builderHref } from "@/app/data"
import { deleteListByKey, findListByKey } from "@/app/api/dao/lists"
import {
    LOCAL_STORAGE_NAME_AUTOSAVE,
    Save,
    detachBuilderIdentity,
    loadByName,
    loadLists,
    removeByName,
    saveLists,
    stageList,
    totalPV,
} from "@/api/unitListApi"
import { PencilSquareIcon, PlayIcon, PrinterIcon, ShareIcon, TrashIcon } from "@heroicons/react/24/outline"
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

type RowModel = {
    id: string
    name: string
    total: number
    constraints: string
    busy?: boolean
    onDelete: () => void
    onEdit: () => void
    onPrint: () => void
    onShare: () => void
    onPlay: () => void
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

function savedUnits(list: ConstrainedList): Save {
    return {
        units: [],
        constraints: list.constraints,
        eraId: list.eraId ?? null,
        factionId: list.factionId ?? null,
    }
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
            <span className="list-action-label max-md:hidden">{label}</span>
        </button>
    )
}

function RowActions({ row }: { row: RowModel }) {
    const icon = "h-3.5 w-3.5 shrink-0"
    return (
        <div className="list-actions w-max">
            <ListAction label="Delete" icon={<TrashIcon className={icon} />} disabled={row.busy} onClick={row.onDelete} />
            <ListAction label="Edit" icon={<PencilSquareIcon className={icon} />} disabled={row.busy} onClick={row.onEdit} />
            <ListAction label="Print" icon={<PrinterIcon className={icon} />} disabled={row.busy} onClick={row.onPrint} />
            <ListAction label="Share" icon={<ShareIcon className={icon} />} onClick={row.onShare} />
            <ListAction label="Play" icon={<PlayIcon className={icon} />} disabled={row.busy} onClick={row.onPlay} />
        </div>
    )
}

function ListsTable({ rows }: { rows: RowModel[] }) {
    return (
        <div className="w-full">
            <table className="table lists-table w-full">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Total PV</th>
                        <th>Constraints</th>
                        <th className="w-[1%] whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id}>
                            <th>{row.name}</th>
                            <td>{row.total}</td>
                            <td>{row.constraints}</td>
                            <td className="w-[1%] whitespace-nowrap">
                                <RowActions row={row} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
    const [showCopiedLink, copiedLinkDlg] = useCopiedLinkDialog()

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
        stageList(row.save, '', null)
        router.push(builderHref(row.save.eraId, row.save.factionId))
    }

    function printMemory(row: MemoryRow) {
        stageList(row.save, row.name, null)
        router.push('/share')
    }

    function shareMemory(row: MemoryRow) {
        showCopiedLink(shareHref({
            name: row.name,
            total: row.total,
            units: row.save.units,
            constraints: row.save.constraints,
            eraId: row.save.eraId,
            factionId: row.save.factionId,
        }))
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

    function withSavedList(key: string, action: (list: ConstrainedList) => Promise<unknown> | void) {
        setBusy(key)
        setNotice(null)
        return findListByKey(key).then(list => {
            if (!list.units.length) {
                setNotice(unavailableMessage(list))
                return
            }
            return action(list)
        }).catch(error => {
            console.error(error)
            setNotice('Could not open that list.')
        }).finally(() => setBusy(null))
    }

    function stageSaved(list: ConstrainedList, name: string, serverKey: string | null) {
        return materializeUnits(list.units).then(units => {
            const save: Save = { ...savedUnits(list), units }
            stageList(save, name, serverKey)
            return save
        })
    }

    function editSaved(summary: SavedListSummary) {
        return withSavedList(summary.key, list =>
            stageSaved(list, list.name || summary.name, summary.key).then(save => {
                router.push(builderHref(save.eraId, save.factionId))
            })
        )
    }

    function printSaved(summary: SavedListSummary) {
        return withSavedList(summary.key, list =>
            stageSaved(list, list.name || summary.name, summary.key).then(() => {
                router.push('/share')
            })
        )
    }

    function playSaved(summary: SavedListSummary) {
        return withSavedList(summary.key, list =>
            materializeUnits(list.units).then(units => {
                storeUnitsForPlay(units)
                router.push('/play')
            })
        )
    }

    function shareSaved(summary: SavedListSummary) {
        showCopiedLink(savedListHref(summary.key))
    }

    function deleteSaved(key: string) {
        setBusy(key)
        setNotice(null)
        deleteListByKey(key).then(
            error => {
                if (error) {
                    setNotice('Could not delete that list.')
                    return
                }
                detachBuilderIdentity(key)
                router.refresh()
            },
            error => {
                console.error(error)
                setNotice('Could not delete that list.')
            },
        ).finally(() => setBusy(null))
    }

    const memoryRows: RowModel[] = memories.map((row) => ({
        id: row.name,
        name: row.name,
        total: row.total,
        constraints: row.constraints,
        onDelete: () => deleteMemory(row.name),
        onEdit: () => editMemory(row),
        onPrint: () => printMemory(row),
        onShare: () => shareMemory(row),
        onPlay: () => playSave(row.save),
    }))

    const savedRows: RowModel[] = savedLists.map((list) => ({
        id: list.key,
        name: list.name,
        total: list.total,
        constraints: list.constraints,
        busy: busy === list.key,
        onDelete: () => deleteSaved(list.key),
        onEdit: () => editSaved(list),
        onPrint: () => printSaved(list),
        onShare: () => shareSaved(list),
        onPlay: () => playSaved(list),
    }))

    return (
        <div className="w-full max-w-screen-lg mx-auto my-4 flex flex-col gap-6">
            <h1 className="text-lg">Lists</h1>
            {notice ? <div role="alert" className="alert alert-error">{notice}</div> : null}
            {copiedLinkDlg}
            <section>
                <h2 className="text-base font-semibold mb-2">Memories</h2>
                {memoryRows.length === 0 ? <p className="text-sm">No lists remembered on this device.</p> : <ListsTable rows={memoryRows} />}
            </section>
            {loggedIn ? (
                <section>
                    <h2 className="text-base font-semibold mb-2">Saved lists</h2>
                    {savedRows.length === 0 ? <p className="text-sm">No lists saved yet.</p> : <ListsTable rows={savedRows} />}
                </section>
            ) : null}
        </div>
    )
}
