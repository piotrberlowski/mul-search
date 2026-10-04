'use client'
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { Faction, Factions, MULSearchParams } from '@/app/data'
import React, { useEffect, useState } from "react";
import { IUnit } from "@/api/unitListApi";
import { IResult, LIST_CHECKS, ValidateUnit, judge, testUnit } from "./results";
import { resolveUnits, unitIsAvailable } from '@/app/api/dao/units'

export const LIST_PARAMETER = "list";
export const NOT_AVAILABLE_ERROR = "Not Available"

function looksLikeUnitId(value: string) {
    return /^\d+$/.test(value) || (/^[A-Za-z0-9]+$/.test(value) && /\d/.test(value))
}

function parseListItem(entry: string): ValidateUnit & { id?: string } {
    const colon = entry.indexOf(':')
    const skill = colon < 0 ? entry : entry.slice(0, colon)
    const rest = colon < 0 ? '' : entry.slice(colon + 1)
    if (looksLikeUnitId(rest)) {
        return { skill, id: rest, name: rest }
    }
    return { skill, name: rest }
}

async function fetchUnit(mu: ValidateUnit & { id?: string }, era: string, specific: string) {
    const key = mu.id ?? mu.name
    const resolved = await resolveUnits([key])
    const unit = resolved[key]
    if (!unit) {
        return { query: mu, error: undefined, found: false, unit: undefined }
    }
    const available = await unitIsAvailable(unit.Id, Number(era), Number(specific))
    if (!available) {
        return { query: { ...mu, name: unit.Name }, error: NOT_AVAILABLE_ERROR, found: false, unit }
    }
    return { query: { ...mu, name: unit.Name }, error: undefined, found: true, unit }
}

async function fetchFromMul(params: ReadonlyURLSearchParams) {
    const list = params.get(LIST_PARAMETER)
    const items = (list ?? "").split(';').filter(p => p.length > 0).map(parseListItem)
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
            if (iRes.error) {
                return { ...iRes.query, found: false, error: iRes.error, unit: iRes.unit }
            }
            return testUnit(mu, iRes.unit as IUnit)
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


export default function Validation({ factions, eras }: { factions: Faction[], eras: Faction[] }) {
    const [results, setResults] = useState<IResult[]>(new Array<IResult>())

    const params = useSearchParams()
    const mulParams = new MULSearchParams(params)
    const fData = new Factions(factions)
    const eraName = eras.find((era) => `${era.value}` === (mulParams.era ?? ''))?.label
    const factionName = fData.getFactionName(mulParams.specific ?? '')
    const contextLabel = (factionName && eraName) ? `[${factionName} during ${eraName}]` : "[Unknown]"

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
                Validating: {contextLabel}
            </div>
            {visualisation}
        </div>
    )
}
