import { ISelectedUnit, currentPV } from "./unitListApi";

export type MulUnit = {
    name: string,
    id: number,
    skill: number,
    lance: string,
    ordinal: number,
}

export interface MulList {
    name: string,
    total: number,
    units: MulUnit[]
}

export interface ConstrainedList extends MulList {
    constraints: string,
}

export function toMulUnits(units: ISelectedUnit[]): MulUnit[] {
    return units.map((u)=> { return {
        name: u.Name,
        id: u.Id,
        skill: u.skill,
        ordinal: u.ordinal,
        lance: u.lance || ""
    }})
}

function safeLocaleCompare(a?: string, b?: string) {
    const safeA = a || ''
    const safeB = b || ''
    return safeA.localeCompare(safeB)
}

export function compareSelectedUnits(a: ISelectedUnit, b: ISelectedUnit): number {
    let val = safeLocaleCompare(a.lance, b.lance)
    if (0 == val) {
        val = currentPV(b) - currentPV(a)
    }
    if (0 == val) {
        val = b.BFSize - a.BFSize
    }
    if (0 == val) {
        val = a.Name.localeCompare(b.Name)
    }
    return val
}

export function exportShare(name: string, total: number, units: ISelectedUnit[]) {
    const unitsString = [...units].sort(compareSelectedUnits).map(u => [u.Id, u.skill, u.Name, u.lance || ''].join(':')).join(',')
    return `${name};${total};${unitsString}`
}

export function parseShare(importString: string): MulList {
    if (importString.indexOf(';') < 0 || importString.indexOf(';') == importString.lastIndexOf(';')) {
        return {
            name: "Empty",
            total: 0,
            units: []
        }
    }
    const [name, total, unitsString] = importString.split(';')
    const units = unitsString.split(',')
        .filter(s => s.indexOf(':') > 0)
        .map((s, idx) => {
            const [id, skill, name, lance] = s.split(':')
            return {
                id: parseInt(id),
                skill: parseInt(skill) || 4,
                name: name,
                lance: lance || '',
                ordinal: idx,
            }
        })
    return {
        name: name,
        total: parseInt(total),
        units: units
    }
}