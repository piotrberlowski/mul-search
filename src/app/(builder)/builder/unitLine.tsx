import { IUnit } from "@/api/unitListApi"
import { BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/16/solid"
import { PlusIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { Sort } from "./filteredTable"
import { ListBuilderController, formatDamageString, useBuilderContext } from "./listBuilderController"

export const EMPTY_UNIT = {
    Id: "",
    Name: "",
    Role: {
        Name: "None",
    },
    Type: {
        Id: 0,
        Name: "None",
    },
    Rules: "Unknown",
    Class: "",
    Variant: "",
    ImageUrl: "",
    BFDamageShort: 0,
    BFDamageMedium: 0,
    BFDamageLong: 0,
    BFMove: "0",
    BFPointValue: 0,
    BFArmor: 0,
    BFStructure: 0,
    BFAbilities: "",
    BFTMM: 0,
    BFOverheat: 0,
    BFSize: 0,
    BFThreshold: 0,
    BFType: "Empty",
    Tonnage: 0,
}

type comparator = (a: IUnit, b: IUnit) => number

function normalizeMove(move: string) {
    // For jmpw or jmps there will be 2 components, we'll consider normal move first
    const components = move.split('/')[0].split('"')
    const normalizedSpeed = components[0].padStart(3, "0")
    const normalizedType = (components.length > 1) ? components[1] : "0"
    return normalizedSpeed + normalizedType
}

function compareDamage(a: IUnit, b: IUnit) {
    const aDmg = a.BFDamageShort + a.BFDamageMedium + a.BFDamageLong
    const bDmg = b.BFDamageShort + b.BFDamageMedium + b.BFDamageLong
    let comparison = aDmg - bDmg
    return (comparison == 0) ? a.BFDamageMedium - b.BFDamageMedium : comparison
}

export const UnitComparators: Record<string, comparator> = {
    Name: (a, b) => a.Name.localeCompare(b.Name),
    BFPointValue: (a, b) => a.BFPointValue - b.BFPointValue,
    BFRole: (a: IUnit, b: IUnit) => a.Role.Name.localeCompare(b.Role.Name),
    BFMove: (a, b) => {
        const movA = a.BFMove
        const movB = b.BFMove
        const order = normalizeMove(movA).localeCompare(normalizeMove(movB))
        return (order != 0) ? order : movA.length - movB.length
    },
    SynthDmg: (a: IUnit, b: IUnit) => compareDamage(a, b),
    SynthOV: (a, b) => a.BFOverheat - b.BFOverheat,
    SynthHP: (a, b) => a.BFStructure + a.BFArmor - b.BFStructure - b.BFArmor,
}

function SortHeader({ sortId, currentSort, onSort, children, className }: { sortId: string, currentSort: Sort, onSort: (newSort: Sort) => void, children: React.ReactNode, className?: string }) {
    const isSelected = currentSort.column == sortId
    const strokeClass = isSelected ? 'stroke-red-600' : ''
    const asc = !isSelected || currentSort.order > 0
    return (
        <div className={className}>
            <div className="flex w-full max-w-full truncate">
                <div className="flex-none max-w-fit">{children}</div>
                <button className="bg-inherit border-none flex-none max-w-fit" onClick={() => onSort({ column: sortId, order: (isSelected) ? currentSort.order * -1 : 1 })}>
                    <BarsArrowUpIcon className={`h-4 w-4 max-w-4 max-h-4 noresize ${strokeClass} ${asc ? '' : 'hidden'}`} />
                    <BarsArrowDownIcon className={`h-4 w-4 noresize ${strokeClass} ${asc ? 'hidden' : ''}`} />
                </button>
            </div>
        </div>
    )
}

export function UnitHeader({ initial, onSort, mech }: { initial: Sort, onSort: (newSort: Sort) => void, mech: boolean }) {
    const [sortState, setSortState] = useState(initial)

    function handleSort(sort: Sort) {
        setSortState(sort)
        onSort(sort)
    }

    const overheat = mech ? " | OV)" : ")"
    return (
        <div className="font-bold grid grid-cols-9 md:grid-cols-12 my-0 text-[0.6rem] sm:text-xs lg:text-sm text-center items-center w-full justify-center justify-items-center">
            <SortHeader sortId="Name" currentSort={sortState} onSort={handleSort} className="col-span-3 md:col-span-3 text-left">
                Name
            </SortHeader>
            <SortHeader sortId="BFPointValue" currentSort={sortState} onSort={handleSort}>PV</SortHeader>
            <SortHeader sortId="BFMove" currentSort={sortState} onSort={handleSort}>Move</SortHeader>

            <SortHeader sortId="SynthDmg" currentSort={sortState} onSort={handleSort} className="col-span-2 md:col-span-1">Dmg<span className="hidden lg:inline"><br />(S/M/L{overheat}</span></SortHeader>
            <SortHeader sortId="SynthHP" currentSort={sortState} onSort={handleSort} className="col-span-2 md:col-span-1">HP<br />(A/S)</SortHeader>
            <div className="hidden md:block md:col-span-1 text-left">Abilities...</div>
            <div className="col-start-12">Add</div>
        </div>
    )
}

export default function UnitLine({ unit, idx, mech }: { unit: IUnit, idx: number, mech: boolean }) {

    const controller: ListBuilderController = useBuilderContext()

    const onAddClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        controller.guardedAddUnit(unit)
    }
    const dmgString = formatDamageString(unit, mech)
    return (
        <>
            <div className="grid grid-cols-9 md:grid-cols-12 my-0 border border-solid border-gray-400 dark:border-gray-800 text-[0.6rem] sm:text-xs lg:text-sm text-center items-center w-full bg-inherit">
                <button className="btn btn-square btn-xs" onClick={onAddClick}>
                    <PlusIcon className="h-3 w-3" />
                </button>
                <div className="col-span-2 text-left">
                    <a href={unit.slug ? `https://masterunitlist.battletech.com/units/${unit.slug}` : "https://masterunitlist.battletech.com/"} target="_blank">{unit.Name}</a>
                </div>
                <div>{unit.BFPointValue}</div>
                <div>{unit.BFMove}</div>

                <div className="col-span-2 md:col-span-1">{dmgString}</div>
                <div className="text-right md:text-center">{unit.BFArmor} + {unit.BFStructure}</div>

                <div className="text-xs truncate hidden md:block md:col-span-2 text-left">{unit.BFAbilities}</div>

                <button className="btn btn-square btn-xs col-start-12" onClick={onAddClick}>
                    <PlusIcon className="h-3 w-3" />
                </button>
            </div>
        </>
    )
}