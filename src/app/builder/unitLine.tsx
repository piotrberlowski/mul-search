import { SearchResultsController, useSearchResultsContext } from "./searchResultsController"


export const EMPTY_UNIT = {
    Id: 0,
    Name: "",
    Role: {
        Name: "None"
    },
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
    BFType: "Empty"
}

type comparator = (a: IUnit, b: IUnit) => number

function normalizeMove(move: string) {
    // For jmpw or jmps there will be 2 components, we'll consider normal move first
    const components = move.split('/')[0].split('"')
    const normalizedSpeed = components[0].padStart(3, "0")
    const normalizedType = (components.length > 1) ? components[1] : "0"
    return normalizedSpeed + normalizedType
}

export const UnitComparators: Record<string, comparator> = {
    Name: (a, b) => a.Name.localeCompare(b.Name),
    BFPointValue: (a, b) => a.BFPointValue - b.BFPointValue,
    BFMove: (a, b) => {
        const movA = a.BFMove
        const movB = b.BFMove
        const order = normalizeMove(movA).localeCompare(normalizeMove(movB))
        return (order != 0) ? order : movA.length - movB.length
    },
    SyntHP: (a, b) => a.BFStructure + a.BFArmor - b.BFStructure - b.BFArmor
}

export interface IRole {
    Name: string,
}

export interface IUnit {
    Id: number,
    Name: string,
    Role: IRole,
    ImageUrl: string,
    BFDamageShort: number,
    BFDamageMedium: number,
    BFDamageLong: number,
    BFMove: string,
    BFPointValue: number,
    BFArmor: number,
    BFStructure: number,
    BFAbilities: string,
    BFTMM: number,
    BFOverheat: number,
    BFSize: number,
    BFThreshold: number,
    BFType: string,
}


export function UnitHeader() {
    return (
        <div className="font-bold grid grid-cols-8 md:grid-cols-12 my-0 text-xs md:text-sm text-center items-center w-full">
            <div className="md:col-span-3 text-left">
                Name
            </div>
            <div className="md:col-start-4">PV</div>
            <div>Role</div>
            <div>Move</div>
            <div>Damage<br />(S/M/L)</div>
            <div>HP<br />(A + S)</div>
            <div className="md:col-span-3 text-left">Abilities...</div>
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
            <div className="grid grid-cols-8 md:grid-cols-12 my-0 border border-solid border-gray-400 dark:border-gray-800 text-xs md:text-sm text-center items-center w-full">
                <div className="md:col-span-3 text-left">
                    <a href={"http://www.masterunitlist.info/Unit/Details/" + unit.Id} target="_blank">{unit.Name}</a>
                </div>
                <div className="md:col-start-4">{unit.BFPointValue}</div>
                <div className="truncate">{unit.Role.Name}</div>
                <div>{unit.BFMove}</div>
                <div>{unit.BFDamageShort}/{unit.BFDamageMedium}/{unit.BFDamageLong}</div>
                <div>{unit.BFArmor} + {unit.BFStructure}</div>
                <div className="text-xs truncate md:col-span-3 text-left">{unit.BFAbilities}</div>
                <button className="block text-center font-bold text-xs" onClick={onAddClick}>
                    +
                </button>
            </div>
        </>
    )
}