'use client'
import { ISelectedUnit, currentPV } from "@/api/unitListApi";


export function UnitLine({ unit }: { unit: ISelectedUnit }) {
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