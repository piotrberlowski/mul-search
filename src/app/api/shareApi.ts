import { ISelectedUnit, currentPV } from "./unitListApi";

export type MulUnit = {
    name: string,
    id: number,
    skill: number,
}

type ParsedMulList = {
    name: string,
    total: number,
    units: MulUnit[]
}

export function compareSelectedUnits(a: ISelectedUnit, b:ISelectedUnit):number {
    let val = currentPV(b) - currentPV(a)
    if (0 == val) {
        val = b.BFSize - a.BFSize
    }
    if (0 == val) {
        val = a.Name.localeCompare(b.Name)
    }
    return val
}

export function exportShare(name:string, total:number, units: ISelectedUnit[]) {
    const unitsString = [...units].sort(compareSelectedUnits).map(u => `${u.Id}:${u.skill}:${u.Name.trim()}`).join(',')
    return `${name};${total};${unitsString}`
}

export function parseShare(importString: string): ParsedMulList {
    if (importString.indexOf(';') < 0 || importString.indexOf(';') == importString.lastIndexOf(';')) {
        return {
            name: "Empty",
            total: 0,
            units: []
        }
    }
    const [name, total, unitsString] = importString.split(';')
    const units = unitsString.split(',')
        .filter(s=>s.indexOf(':')>0)
        .map(s=> {
            const [id, skill, name] = s.split(':')
            return {
                id: parseInt(id),
                skill: parseInt(skill) || 4,
                name: name
            }
        })
    return {
        name: name,
        total: parseInt(total),
        units: units
    }
}