import { resolveUnits } from "@/app/api/dao/units"
import { MulUnit } from "@/api/shareApi"
import { ISelectedUnit, IUnit } from "@/api/unitListApi"
import { EMPTY_UNIT } from "@/app/(builder)/builder/unitLine"

function selectUnit(mulUnit: MulUnit, units: IUnit[]): ISelectedUnit {
    const data = units.find(u => u.Id == mulUnit.id || u.Name.trim().toLowerCase() === mulUnit.name.trim().toLowerCase()) || EMPTY_UNIT
    return {
        ordinal: mulUnit.ordinal,
        skill: mulUnit.skill,
        lance: mulUnit.lance,
        ...data,
    }
}

export async function materializeUnits(queries: MulUnit[]): Promise<ISelectedUnit[]> {
    if (!queries.length) return []
    const resolved = await resolveUnits(queries.flatMap((unit) => [unit.id, unit.name]))
    const units = Object.values(resolved)
    return queries.map((unit) => selectUnit(unit, units))
}
