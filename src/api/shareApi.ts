import { ISelectedUnit, currentPV } from "./unitListApi";

export type MulUnit = {
    name: string,
    id: string | number,
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
    eraId?: number | null,
    factionId?: number | null,
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

function shareParams(name: string, total: number, body: string, constraints: string, eraId?: number | null, factionId?: number | null) {
    const params = new URLSearchParams()
    params.set('list', `${name};${total};${body}`)
    params.set('constraints', constraints)
    if (eraId != null) params.set('era', String(eraId))
    if (factionId != null) params.set('specific', String(factionId))
    return params
}

function unitBody(units: { id: string | number, skill: number, name: string, lance?: string | null }[]) {
    return units.map(unit => [unit.id, unit.skill, unit.name, unit.lance || ''].join(':')).join(',')
}

export function shareQuery({ name, total, units, constraints, eraId, factionId }: {
    name: string,
    total: number,
    units: ISelectedUnit[],
    constraints: string,
    eraId?: number | null,
    factionId?: number | null,
}) {
    const body = unitBody([...units].sort(compareSelectedUnits).map(unit => ({
        id: unit.Id,
        skill: unit.skill,
        name: unit.Name,
        lance: unit.lance,
    })))
    return shareParams(name, total, body, constraints, eraId, factionId)
}

export function shareHref(input: {
    name: string,
    total: number,
    units: ISelectedUnit[],
    constraints: string,
    eraId?: number | null,
    factionId?: number | null,
}) {
    return `/share?${shareQuery(input).toString()}`
}

export function shareHrefFromMul(list: ConstrainedList) {
    return `/share?${shareParams(list.name, list.total, unitBody(list.units), list.constraints, list.eraId, list.factionId).toString()}`
}

export function savedListHref(key: string) {
    return `/share?key=${encodeURIComponent(key)}`
}

export function copyShareLink(href: string): Promise<string | null> {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        return Promise.resolve('Could not copy the link.')
    }
    const url = typeof window === 'undefined' ? href : new URL(href, window.location.origin).toString()
    return navigator.clipboard.writeText(url).then(
        () => null,
        () => 'Could not copy the link.',
    )
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
                id: id,
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