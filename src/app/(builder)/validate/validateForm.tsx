'use client'
import { Faction, Factions, eraMap, eras } from "@/app/(builder)/data";
import Link from "next/link";
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

function renderEras() {
    return eras.map(eraKV => {
        const [val, lab] = eraKV
        return (
            <option key={val} value={val || ""}>{lab}</option>
        )
    })
}

export default function ValidateForm({ factions }: { factions: Faction[] }) {

    const fData = new Factions(factions)
    const router = useRouter()

    const params = useSearchParams()

    const [spec, setSpec] = useState(params.get('specific')?.toString())
    const [gen, setGen] = useState(params.get('general')?.toString())
    const [era, setEra] = useState(params.get('era')?.toString())
    const [error, setError] = useState<string>()
    const [pdf, setFile] = useState<File>()

    const mulGenLink = (era && spec) ? (
        <Link href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${spec}&EraId=${era}`} target="_blank">-&gt; Use this link to find the General List for {fData.getFactionName(spec)} in {eraMap.get(era)} era &lt;-</Link>
    ) : (<></>)


    function submit(serializedList: string) {
        const params = new URLSearchParams()
        params.append("era", `${era}`)
        params.append("specific", `${spec}`)
        if (gen) {
            params.append("general", `${gen}`)
        }
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
                    <span className="label-text">Faction</span>
                </div>
                <select className="select select-bordered select-sm" name="specific" value={spec} onChange={e => setSpec(e.target.value)}>
                    <option value=''></option>
                    {renderOptions(fData.getFactions())}
                </select>
            </label>
            <label className="form-control bg-inherit w-3/4 mx-auto">
                <div className="label">
                    <span className="label-text">Availability Era</span>
                </div>
                <select name="era" className="select select-bordered select-sm" value={era} onChange={e => setEra(e.target.value)}>
                    <option value=''></option>
                    {renderEras()}
                </select>
            </label>

            <div className="w-100 text-center items-ceter">
                {mulGenLink}
            </div>
            <label className="form-control bg-inherit w-3/4 mx-auto">
                <div className="label">
                    <span className="label-text">General List</span>
                </div>
                <select className="select select-bordered select-sm" name="general" value={gen} onChange={e => setGen(e.target.value)}>
                    {renderOptions(fData.getGenerals())}
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