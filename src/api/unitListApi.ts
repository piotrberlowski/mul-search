export const LOCAL_STORAGE_NAME_AUTOSAVE = 'autosave'
const LOCAL_STORAGE_KEY = 'alphaStrikeLists'
const LOCAL_STORAGE_LIST_KEY_PREFIX = 'alphaStrikeList_'
const LOCAL_STORAGE_CONSTRAINT_KEY_PREFIX = 'alphaStrikeList_constraint_'
const LOCAL_STORAGE_TTS = 'alphaStrikeTTS'

export interface ILanced {
    lance?: string
}

export interface IRole {
    Name: string,
}

export interface IType {
    Id: number,
    Name: string,
}

export interface IUnit {
    Id: number,
    Name: string,
    Type: IType,
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
    Tonnage: number,
}

export type AddUnitCallback = (unit: IUnit) => void

export type Save = {
    units: ISelectedUnit[],
    constraints: string
}

export interface ISelectedUnit extends IUnit, ILanced {
    ordinal: number,
    skill: number,
}

export interface PvEntity {
    skill: number,
    BFPointValue: number,
}

export type JeffsMove = {
    move: number,
    type: string
}

export type JeffsUnit = {
    mulID: number,
    damage: {
        short: number,
        medium: number,
        long: number
    },
    name: string,
    tmm: number,
    role: string,
    threshold: number,
    imageURL: string,
    move: JeffsMove[],
    jumpMove: number,
    structure: number,
    armor: number,
    type: string,
    size: number,
    showDetails: boolean,
    abilities: string[],
    overheat: number,
    basePoints: number,
    currentSkill: number
}

function toMoveArray(move: string): JeffsMove[] {
    return move.split("/").map(mv => {
        const [distance, type] = mv.split('"')
        return {
            move: parseInt(distance),
            type: type,
        }
    })

} 

export interface PvEntity {
    skill: number,
    BFPointValue: number,
}


export function currentPV(unit: PvEntity) {
    const levels = 4 - unit.skill
    const multiplier = (levels > 0) ? 0.2 : 0.1
    const adjustment = (Math.round(unit.BFPointValue * multiplier) || 1) * levels
    return Math.max(unit.BFPointValue + adjustment, 1)
}

export function totalPV(units: PvEntity[]): number {
    return units.map(u => currentPV(u)).reduce((p, n) => p + n, 0)
}

export function toJeffsUnits(units: ISelectedUnit[]): JeffsUnit[] {
    return units.map(
        unit => {
            return {
                mulID: unit.Id,
                damage: {
                    short: unit.BFDamageShort,
                    medium: unit.BFDamageMedium,
                    long: unit.BFDamageLong,
                },
                name: unit.Name,
                tmm: unit.BFTMM,
                role: unit.Role.Name,
                threshold: unit.BFThreshold,
                imageURL: unit.ImageUrl,
                move: toMoveArray(unit.BFMove),
                jumpMove: 0,
                structure: unit.BFStructure,
                armor: unit.BFArmor,
                type: unit.BFType,
                size: unit.BFSize,
                showDetails: false,
                abilities: (unit.BFAbilities) ? unit.BFAbilities.split(",") : [],
                overheat: unit.BFOverheat,
                basePoints: unit.BFPointValue,
                currentSkill: unit.skill
            }
        }
    )
}

export function loadLists(): string[] {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]")
}

export function saveLists(lists: string[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists))
}

export function compactOrdinals(units: ISelectedUnit[]) {
    units.forEach((u, idx) => u.ordinal = idx)
}

export function groupByLance<T extends ILanced>(units: T[]) {
    return units.reduce((acc, value) => {
        acc.get(value.lance || '')?.push(value) || acc.set(value.lance, [value]);
        return acc;
    }, new Map<string | undefined, T[]>());
}

function updateDefaultLance(units: ISelectedUnit[]) {
    units.forEach(u => u.lance ||= '')
}

export function loadByName(name: string): Save {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const result = localStorage.getItem(listKey)
    const units = JSON.parse(result || "[]")
    compactOrdinals(units)
    updateDefaultLance(units)
    const constraintKey = LOCAL_STORAGE_CONSTRAINT_KEY_PREFIX + name
    const constraints = localStorage.getItem(constraintKey) ?? "legacy"

    return {
        units: units,
        constraints: constraints,
    }
}

export function saveByName(save: Save, name: string) {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const constraintKey = LOCAL_STORAGE_CONSTRAINT_KEY_PREFIX + name
    const unitList = JSON.stringify(save.units)
    localStorage.setItem(listKey, unitList)
    localStorage.setItem(constraintKey, save.constraints)
}

export function removeByName(name: string) {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const constraintKey = LOCAL_STORAGE_CONSTRAINT_KEY_PREFIX + name
    localStorage.removeItem(listKey)
    localStorage.removeItem(constraintKey)
}

function storeTTSString(tts: string) {
    localStorage.setItem(LOCAL_STORAGE_TTS, tts)
}

export function loadTTSString():string {
    const data =  localStorage.getItem(LOCAL_STORAGE_TTS)
    if (!data) {
        return ''
    }
    return data
}

export function exportTTSString(name: string, units: ISelectedUnit[]) {
    const ttsUnits = units.map(u => `{${u.Id},${u.skill}}`).join(',')
    storeTTSString(`{${ttsUnits}}`)
}
export const UNIT_TYPES: IType[] = [
    {
        Id: 18,
        Name: "Battle Mech",
    },
    {
        Id: 19,
        Name: "Combat Vehicle",
    },
    {
        Id: 21,
        Name: "Infantry"
    },
    {
        Id: 20,
        Name: "Industrial Mech"
    },
    {
        Id: 24,
        Name: "Support",
    }
]
