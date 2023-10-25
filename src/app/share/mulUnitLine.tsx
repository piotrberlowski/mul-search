'use client'
import { ISelectedUnit, currentPV } from "../api/unitListApi";
import useSWR from "swr"
import { MulUnit } from "../api/shareApi";
import { EMPTY_UNIT, IUnit } from "../unitLine";

async function fetchFromMul(search: string) {
    const url = new URL("http://masterunitlist.info/Unit/QuickList")
    url.searchParams.append('Name', search)
    return fetch(url.href).then(r => r.json())
}

function TempUnit({mulUnit, description}:{mulUnit: MulUnit, description: string}) {
    return (
        <div className="grid grid-cols-11 my-0 border border-solid border-gray-400 dark:border-gray-800 font-small text-center items-center">
            <div className="col-span-3 text-left">{mulUnit.name}</div>
            <div>{mulUnit.skill}</div>
            <div className="col-span-7">{description}</div>
        </div>
    )
}

function FetchedUnit({unit}:{unit: ISelectedUnit}) {
    return (
        <div className="grid grid-cols-11 my-0 border border-solid border-gray-400 dark:border-gray-800 font-small text-center items-center w-full">
            <div className="col-span-3 text-left">
                <a href={"http://www.masterunitlist.info/Unit/Details/" + unit.Id} target="_blank">{unit.Name}</a>
            </div>
            <div>{unit.skill}</div>
            <div>{currentPV(unit)}</div>
            <div>{unit.Role.Name}</div>
            <div>{unit.BFMove}</div>
            <div>{unit.BFDamageShort}/{unit.BFDamageMedium}/{unit.BFDamageLong}</div>
            <div>{unit.BFArmor} + {unit.BFStructure}</div>
            <div className="text-xs truncate col-span-2 text-left">{unit.BFAbilities}</div>
        </div>
    )
}

function selectUnit(ordinal: number, mulUnit: MulUnit, units:IUnit[]): ISelectedUnit {
    const data = units.find(u => u.Id == mulUnit.id) || EMPTY_UNIT 
    return {
        ordinal: ordinal, 
        skill: mulUnit.skill,
        ...data
    }
}

export function MulUnitLine({ordinal, mulUnit, onFetch}:{ordinal: number, mulUnit:MulUnit, onFetch: ((u: ISelectedUnit) => void)|null}) {

    const { data, error } = useSWR(
        mulUnit.name,
        fetchFromMul
    )

    if (error) {
        console.log(error)
        return (
            <TempUnit mulUnit={mulUnit} description="Loading Error."/>
        )
    }

    if (!data) {
        return (
            <TempUnit mulUnit={mulUnit} description="Loading..."/>
        )
    }

    const unit = selectUnit(ordinal, mulUnit, data.Units)

    if (onFetch) onFetch(unit)

    return (
        <FetchedUnit unit={unit}/>
    )
}