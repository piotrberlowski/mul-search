'use client'
import { Faction } from "@/app/data";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from 'react';
import { parsePdf } from "./pdf/parsePdf";

function renderOptions(factions: Faction[]) {
    return factions
        .map(fa => {
            return (
                <option key={fa.value} value={fa.value || ""}>{fa.label}</option>
            )
        })
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
    const [pdf, setFile] = useState<File>()
    const factionsForEra = factionsByEra.find((entry) => `${entry.eraId}` === era)?.factions ?? []

    function onEra(value: string) {
        setEra(value)
        const allowed = factionsByEra.find((entry) => `${entry.eraId}` === value)?.factions ?? []
        if (!allowed.some((faction) => `${faction.value}` === spec)) {
            setSpec('')
        }
    }

    function submit(serializedList: string) {
        const params = new URLSearchParams()
        params.append("era", `${era}`)
        params.append("specific", `${spec}`)
        params.append("list", serializedList)
        router.push(`/validate/result?${params.toString()}`)
    }

    function validate(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault()
        if (!pdf) {
            return
        }
        parsePdf(pdf)
            .then(parseResult => {
                if (!parseResult.success) {
                    console.log(`Server Error: ${parseResult.error}`)
                    setError(error)
                } else if (parseResult.serializedList === undefined || !parseResult.serializedList) {
                    console.log("Empty List!")
                    setError("Empty List!")
                } else {
                    submit(parseResult.serializedList)
                }
            }).catch(e => {
                setError(`Failed to parse the PDF: ${e}`)
            })
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
                    <span className="label-text">MUL PDF</span>
                </div>
                <input type="file" className="file-input file-input-bordered file-input-sm bg-inherit w-full" onChange={e => setFile(e.target.files?.[0])} accept="application/pdf" />
            </label>
            <div className="flex-1 text-center mt-3">
                <button className="btn w-3/4 btn-sm" onClick={e => validate(e)} disabled={!(era && spec && pdf)}>Validate</button>
            </div>
            <div role="alert" className={`alert alert-error ${error ? "" : "invisible"}`}><span>{error}</span></div>
        </form>
    )
}