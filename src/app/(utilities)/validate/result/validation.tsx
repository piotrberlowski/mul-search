'use client'
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { Faction, Factions, MULSearchParams } from '@/app/data'
import React, { useEffect, useState } from "react";
import { IUnit } from "@/api/unitListApi";
import { IResult, LIST_CHECKS, ValidateUnit, judge, testUnit } from "./results";
import { resolveUnits } from '@/app/api/dao/units'

export const LIST_PARAMETER = "list";
export const NOT_AVAILABLE_ERROR = "Not Available"

async function fetchUnit(mu: ValidateUnit, era: string, specific: string) {
    const resolved = await resolveUnits([mu.name])
    const unit = Object.values(resolved).find((candidate) => candidate.Name.trim().toLowerCase() === mu.name.trim().toLowerCase())
    if (!unit) {
        return { query: mu, error: NOT_AVAILABLE_ERROR, found: false, unit: undefined }
    }
    return { query: mu, error: undefined, found: true, unit }
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
        items.map(mu => fetchUnit(mu, era, specific).then(iRes => {
            // We have an error and need to return negative judgement
            if (iRes.error || !iRes.unit) {
                return { ...iRes.query, ...iRes }
            }
            return testUnit(mu, iRes.unit)
        }).then(testRes => testRes.error || !testRes.unit ? testRes : testUniqueExtinct(mu, era, testRes.unit)))
    )

}

async function testUniqueExtinct(mu: ValidateUnit, _era: string, unit: IUnit) {
    return judge(mu, true, undefined, unit)
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
                    LIST_CHECKS.map(({ name, check }) => {
                        return {
                            name: name,
                            result: check(results),
                        }
                    }).map(({ name, result }, idx) => (
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


export default function Validation({ factions }: { factions: Faction[] }) {
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
