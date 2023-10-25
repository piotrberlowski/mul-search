import { IUnit } from "../unitLine";

export const LOCAL_STORAGE_NAME_AUTOSAVE = 'autosave'
const LOCAL_STORAGE_KEY = 'alphaStrikeLists'
const LOCAL_STORAGE_LIST_KEY_PREFIX = 'alphaStrikeList_'

export type AddUnitCallback = (unit: IUnit) => void

export interface ISelectedUnit extends IUnit {
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

export function currentPV(unit: PvEntity) {
    var multiplier = 0;
    if (unit.skill < 4) {
        if (unit.BFPointValue < 8)
            multiplier = (4 - unit.skill);
        else
            multiplier = (4 - unit.skill) * Math.ceil((Math.max((unit.BFPointValue - 7), 1) / 5) + 1);
    } else {
        if (unit.BFPointValue < 15)
            multiplier = -(unit.skill - 4);
        else
            multiplier = -((unit.skill - 4) * Math.ceil(((unit.BFPointValue - 14) / 10.0) + 1));
    }
    return (Math.max(unit.BFPointValue + multiplier, 1))
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

export function loadByName(name: string): ISelectedUnit[] {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const result = localStorage.getItem(listKey)
    const units = JSON.parse(result || "[]")
    compactOrdinals(units)
    console.log("Loaded list %s (%d units)", listKey, units.length)
    return units
}

export function saveByName(units: ISelectedUnit[], name: string) {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const unitList = JSON.stringify(units)
    localStorage.setItem(listKey, unitList)
    console.log("Saved list %s (%d units)", listKey, units.length)
}

export function removeByName(name: string) {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    localStorage.removeItem(listKey)
}