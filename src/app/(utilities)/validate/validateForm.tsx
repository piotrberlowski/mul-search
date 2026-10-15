'use client'
import { Faction, searchParamsFromIds } from "@/app/data";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from 'react';
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, saveByName } from "@/api/unitListApi";
import { resolveUnits } from "@/app/api/dao/units";
import { parseForceFile } from "./forceFile";

function renderOptions(factions: Faction[]) {
    return factions
        .map(fa => {
            return (
                <option key={fa.value} value={fa.value || ""}>{fa.label}</option>
            )
        })
}

function constraintsLabel(
    eraId: string,
    factionId: string,
    eras: Faction[],
    factionsByEra: { eraId: number, factions: Faction[] }[],
) {
    const eraName = eras.find((era) => `${era.value}` === eraId)?.label
    const factionName = factionsByEra
        .find((entry) => `${entry.eraId}` === eraId)
        ?.factions.find((faction) => `${faction.value}` === factionId)?.label
    return (factionName && eraName) ? `[${factionName} during ${eraName}]` : "[Unknown]"
}

export default function ValidateForm({
    eras,
    factionsByEra,
}: {
    eras: Faction[],
    factionsByEra: { eraId: number, factions: Faction[] }[],
}) {

    const router = useRouter()

    const params = useSearchParams()

    const [spec, setSpec] = useState(params.get('specific')?.toString())
    const [era, setEra] = useState(params.get('era')?.toString())
    const [error, setError] = useState<string>()
    const [forceFile, setFile] = useState<File>()
    const [busy, setBusy] = useState(false)
    const factionsForEra = factionsByEra.find((entry) => `${entry.eraId}` === era)?.factions ?? []

    function onEra(value: string) {
        setEra(value)
        const allowed = factionsByEra.find((entry) => `${entry.eraId}` === value)?.factions ?? []
        if (!allowed.some((faction) => `${faction.value}` === spec)) {
            setSpec('')
        }
    }

    async function openInBuilder(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault()
        if (!forceFile || !era || !spec || busy) {
            return
        }
        setBusy(true)
        setError(undefined)
        try {
            const parseResult = parseForceFile(await forceFile.text())
            if (!parseResult.success || !parseResult.entries?.length) {
                setError(parseResult.error || "That force file has no units.")
                return
            }
            const resolved = await resolveUnits(parseResult.entries.map((entry) => entry.id))
            const missing = [...new Set(parseResult.entries.map((entry) => entry.id).filter((id) => !resolved[id]))]
            if (missing.length) {
                setError(`Could not match: ${missing.join(", ")}`)
                return
            }
            const units: ISelectedUnit[] = parseResult.entries.map((entry, ordinal) => ({
                ...resolved[entry.id],
                ordinal,
                skill: entry.skill,
                lance: '',
            }))
            saveByName({
                units,
                constraints: constraintsLabel(era, spec, eras, factionsByEra),
                eraId: Number(era),
                factionId: Number(spec),
            }, LOCAL_STORAGE_NAME_AUTOSAVE)
            router.push(`/builder?${searchParamsFromIds(Number(era), Number(spec))}`)
        } catch (err) {
            setError(`Failed to import the force file: ${err}`)
        } finally {
            setBusy(false)
        }
    }

    return (
        <form className="my-1 border border-solid border-gray-800 dark:border-gray-300 p-1 items-center">
            <label className="form-control bg-inherit w-3/4 mx-auto">
                <div className="label">
                    <span className="label-text">Availability Era</span>
                </div>
                <select name="era" className="select select-bordered select-sm" value={era} onChange={e => onEra(e.target.value)}>
                    <option value=''></option>
                    {renderOptions(eras)}
                </select>
            </label>
            <label className="form-control bg-inherit w-3/4 mx-auto">
                <div className="label">
                    <span className="label-text">Faction</span>
                </div>
                <select className="select select-bordered select-sm" name="specific" value={spec} onChange={e => setSpec(e.target.value)} disabled={!era}>
                    <option value=''></option>
                    {renderOptions(factionsForEra)}
                </select>
            </label>

            <label className="form-control bg-inherit w-3/4 mx-auto">
                <div className="label">
                    <span className="label-text">MUL force file</span>
                </div>
                <input type="file" className="file-input file-input-bordered file-input-sm bg-inherit w-full" onChange={e => setFile(e.target.files?.[0])} accept=".json,application/json" />
            </label>
            <div className="flex-1 text-center mt-3">
                <button className="btn w-3/4 btn-sm" onClick={e => openInBuilder(e)} disabled={!(era && spec && forceFile) || busy}>
                    {busy ? "Opening..." : "Open in builder"}
                </button>
            </div>
            <p className="text-center text-xs mt-2">This replaces the list currently open in the builder.</p>
            {error ? <div role="alert" className="alert alert-error"><span>{error}</span></div> : null}
        </form>
    )
}
