'use client'
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { Faction, Factions, MASTER_UNIT_LIST, MULSearchParams } from '@/app/data'
import React, { useEffect, useState } from "react";
import { IUnit } from "@/api/unitListApi";
import { IResult, LIST_CHECKS, ValidateUnit, testUnit } from "./results";

export const LIST_PARAMETER = "list";

async function fetchUnit(mu: ValidateUnit, era: string, specific: string, general?: string) {
    const url = new URL("/Unit/QuickList", MASTER_UNIT_LIST)
    url.searchParams.append('Name', mu.name)
    url.searchParams.append('AvailabilityEras', era)
    url.searchParams.append('Factions', specific)
    if (general) {
        url.searchParams.append('Factions', general)
        console.log(general)
    }
    return fetch(url.href).then(r => r.json()).then(({ Units }) => {
        const filtered = Units.filter((u: IUnit) => u.Name.trim().toLowerCase() == mu.name.trim().toLowerCase())
        if (filtered.length == 0) {
            return { ...mu, error: "Not Available", found: false }
        } else if (filtered.length > 1) {
            return { ...mu, error: "Ambiguous", found: true, unit: filtered[0] }
        }
        return testUnit(mu, filtered[0])
    }).catch(e => {
        return { ...mu, error: e, found: false }
    })
}

async function fetchFromMul(params: ReadonlyURLSearchParams) {
    const list = params.get(LIST_PARAMETER)
    const items = (list ?? "").split(';').map(p => {
        const [skill, unit] = p.split(":")
        return {
            skill: skill,
            name: unit,
        }
    })
    const era = params.get("era")
    const specific = params.get("specific")
    const general = params.get("general") ?? undefined

    if (!(era && specific && items)) {
        return Promise.resolve<IResult[]>([
            {
                skill: "",
                name: "invalid",
                error: "Invalid parameters for validation",
                found: false
            }
        ])
    }

    return Promise.all(
        items.map(mu => fetchUnit(mu, era, specific, general))
    )

}

function Results({ results }: { results: IResult[] }) {
    return (
        <div>
            <h1>Unit Check</h1>
            <div className="grid grid-cols-6 w-full gap-1 align-middle justify-center items-center">
                {results.map((r, idx) => (
                    <React.Fragment key={idx}>
                        <div className="text-center align-middle"><span>{r.skill}</span></div>
                        <div className="col-span-3">{r.name}</div>
                        <div role="alert" className={`alert alert-sm col-span-2 ${(r.found) ? "alert-success" : "alert-error"}`}><span>{(r.found) ? "Valid" : `${r.error}`}</span></div>
                    </React.Fragment>
                ))}
            </div>
            <h1>List Checks</h1>
            <div className="grid grid-cols-6 w-full gap-1 align-middle justify-center items-center">
                {
                    LIST_CHECKS.map(({name, check}) => {
                        return {
                            name: name,
                            result: check(results),
                        }
                    }).map(({name,result}, idx) => (
                        <React.Fragment key={idx}>
                            <div className="text-center align-middle col-span-3"><span>{name}</span></div>
                            <div role="alert" className={`alert text-center col-span-3 ${(result.valid) ? "alert-success" : "alert-error"}`}><span className="text-center h-full">{(result.valid) ? "Valid" : result.message}</span></div>
                        </React.Fragment>
                    ))
                }
            </div>
            
        </div>

    )
}


export default function Validation({factions}:{factions: Faction[]}) {
    const [results, setResults] = useState<IResult[]>(new Array<IResult>())

    const params = useSearchParams()
    const mulParams = new MULSearchParams(params)
    const fData = new Factions(factions)

    useEffect(
        () => { fetchFromMul(params).then(setResults).catch(err => console.log(err)) }
        , [params])


    let visualisation = <div className="w-full h-full text-center items-center justify-items-center"><span className="loading loading-dots loading-lg"></span></div>

    if (results.length > 0) {
        visualisation = <Results results={results} />
    }


    return (
        <div>
            <div className="w-full text-center items-center">
                Validating: {mulParams.describe(fData)}
            </div>
            {visualisation}
        </div>
    )
}