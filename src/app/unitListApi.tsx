import { IUnit } from "./unitLine";


export type AddUnitCallback = (unit: IUnit) => void

export interface ISelectedUnit extends IUnit {
    ordinal: number,
    skill: number,
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
                abilities: unit.BFAbilities.split(","),
                overheat: unit.BFOverheat,
                basePoints: unit.BFPointValue,
                currentSkill: unit.skill
            }
        }
    )
}
