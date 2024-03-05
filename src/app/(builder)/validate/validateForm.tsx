'use client'
import { useRouter, useSearchParams } from "next/navigation"
import { Faction, Factions as Factions, eraMap, eras } from "@/app/(builder)/data"
import SearchInputPanel from "@/app/(builder)/searchInputPanel"
import { useState } from 'react';
import Link from "next/link";

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
    const [listText, setListText] = useState("")

    const mulGenLink = (era && spec) ? (
            <Link href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${spec}&EraId=${era}`} target="_blank">-&gt; Use this link to find the General List for {fData.getFactionName(spec)} in {eraMap.get(era)} era &lt;-</Link>
        ) : (<></>)

    function parseList(text:string) {
        const lines = text.split("\n")
        const param = lines.map(
            (l) => {
                const items = l.split(/\s+/)
                if (items.length < 4) {
                    return "0:invalid"
                } else {
                    const skill = items[items.length - 3]
                    const unit = items.slice(0, -4).join(" ")
                    return `${skill}:${unit}`
                }
            } 
        ).join(";")
        setListText(param)
    }

    function validate() {
        const params = new URLSearchParams()
        params.append("era", `${era}`)
        params.append("specific", `${spec}`)
        if (gen) {
            params.append("general", `${gen}`)
        }
        params.append("list", `${listText}`)
        router.push(`/validate/result?${params.toString()}`)
    }

    return (
        <form className="my-1 border border-solid border-gray-800 dark:border-gray-300 p-1 items-center" method='GET' action="/builder">
            <SearchInputPanel title="Faction" className="text-center items-center bg-inherit w-3/4 mx-auto">
                    <select className="flex w-full" name="specific" value={spec} onChange={e => setSpec(e.target.value)}>
                        <option value=''></option>
                        {renderOptions(fData.getFactions())}
                    </select>
            </SearchInputPanel>
            <SearchInputPanel title="Availability Era" className="text-center items-center bg-inherit w-3/4 mx-auto">
                <select name="era" className="flex w-full" value={era} onChange={e => setEra(e.target.value)}>
                    <option value=''></option>
                    {renderEras()}
                </select>
            </SearchInputPanel>
            <div className="w-100 text-center items-ceter">
                {mulGenLink}
            </div>
            <SearchInputPanel title="General List" className="text-center items-center bg-inherit w-3/4 mx-auto">
                    <select className="flex w-full" name="general" value={gen} onChange={e => setGen(e.target.value)}>
                        {renderOptions(fData.getGenerals())}
                    </select>
            </SearchInputPanel>
            <div className="items-center bg-inherit w-3/4 mx-auto ">
                <textarea className="textarea textarea-bordered w-full h-64" placeholder="List" onChange={e => parseList(e.target.value)}></textarea>
            </div>
            <div className="flex-1 text-center mt-1">
                <button className="btn w-3/4" onClick={e => validate()} disabled={!(era && spec && listText)}>Validate</button>
            </div>
        </form>
    )
}