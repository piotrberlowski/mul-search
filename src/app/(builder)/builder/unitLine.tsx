import { IUnit } from "@/api/unitListApi"
import { SearchResultsController, useSearchResultsContext } from "./searchResultsController"
import { Sort } from "./filteredTable"
import { useState } from "react"
import { BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/16/solid"
import { PlusIcon } from "@heroicons/react/24/outline"

export const EMPTY_UNIT = {
    Id: 0,
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
    BFRole: (a:IUnit, b:IUnit) => a.Role.Name.localeCompare(b.Role.Name),
    BFMove: (a, b) => {
        const movA = a.BFMove
        const movB = b.BFMove
        const order = normalizeMove(movA).localeCompare(normalizeMove(movB))
        return (order != 0) ? order : movA.length - movB.length
    },
    SynthDmg: (a:IUnit, b:IUnit) => compareDamage(a, b),
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

export function UnitHeader({ initial, onSort }: { initial: Sort, onSort: (newSort: Sort) => void }) {
    const [sortState, setSortState] = useState(initial)

    function handleSort(sort: Sort) {
        setSortState(sort)
        onSort(sort)
    }

    return (
        <div className="font-bold grid grid-cols-9 md:grid-cols-11 my-0 text-xs md:text-sm text-center items-center w-full justify-center justify-items-center">
            <SortHeader sortId="Name" currentSort={sortState} onSort={handleSort} className="col-span-2 md:col-span-3 text-left">
                Name
            </SortHeader>
            <SortHeader sortId="BFPointValue" currentSort={sortState} onSort={handleSort} className="col-start-3 md:col-start-4">PV</SortHeader>
            <SortHeader sortId="BFRole" currentSort={sortState} onSort={handleSort} className="hidden md:inline-flex">Role</SortHeader>
            <SortHeader sortId="BFMove" currentSort={sortState} onSort={handleSort} className="col-span-2 md:col-span-1">Move</SortHeader>
            <SortHeader sortId="SynthDmg" currentSort={sortState} onSort={handleSort}> Dmg</SortHeader>
            <SortHeader sortId="SynthHP" currentSort={sortState} onSort={handleSort} className="col-span-2 md:col-span-1">HP<br />(A/S)</SortHeader>
            <div className="hidden md:block md:col-span-2 text-left">Abilities...</div>
            <div>Add</div>
        </div>
    )
}

export default function UnitLine({ unit }: { unit: IUnit }) {

    const controller: SearchResultsController = useSearchResultsContext()

    const onAddClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        controller.notify(unit)
    }

    return (
        <>
            <div className="grid grid-cols-9 md:grid-cols-11 my-0 border border-solid border-gray-400 dark:border-gray-800 text-xs md:text-sm text-center items-center w-full">
                <div className="col-span-2 md:col-span-3 text-left">
                    <a href={"http://www.masterunitlist.info/Unit/Details/" + unit.Id} target="_blank">{unit.Name}</a>
                </div>
                <div className="col-start-3 md:col-start-4">{unit.BFPointValue}</div>
                <div className="truncate hidden md:block">{unit.Role.Name}</div>
                <div className="col-span-2 md:col-span-1">{unit.BFMove}</div>
                <div>{unit.BFDamageShort}/{unit.BFDamageMedium}/{unit.BFDamageLong}</div>
                <div className="col-span-2 md:col-span-1">{unit.BFArmor} + {unit.BFStructure}</div>
                <div className="text-xs truncate hidden md:block md:col-span-2 text-left">{unit.BFAbilities}</div>
                <button className="btn btn-square btn-xs" onClick={onAddClick}>
                    <PlusIcon className="h-3 w-3"/>
                </button>
            </div>
        </>
    )
}