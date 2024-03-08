import { IUnit } from "@/api/unitListApi"

export interface ValidateUnit {
    skill: string
    name: string
}

export interface IResult extends ValidateUnit {
    found: boolean
    error?: string
    unit?: IUnit
}

export interface ICheckResult {
    valid: boolean
    message?: string
}

export interface IListCheck {
    (list: IResult[]): ICheckResult 
}

export type Check = {
    name: string
    check: IListCheck
}

function check(name: string, check: IListCheck) {
    return {
        name: name,
        check: check,
    }
}

const VALID: ICheckResult = {
    valid: true    
}

function invalid(msg: string): ICheckResult {
    return {
        valid: false,
        message: msg,
    }
}

/*
Armies may have no more than:
- 16 units per Army
- 12 of any Mech Type (Battlemech/ Industrial/
Omnimech)
- 8 Combat Vehicles
- 5 of any Infantry Type (includes Battlearmor)
*/
function unitCountCheck(list: IResult[]) {
    return (list.length<=16) ? VALID : invalid("Too many units!")
}

function typeCountCheckFactory(types: string[], maxCount: number) {
    return (list: IResult[]) => {
        const typeCount = list.filter(r => r.found).filter(r => types.includes(r?.unit?.Type.Name || "INVALID")).length
        return (typeCount <= maxCount) ? VALID : invalid(`Too many units of type ${types} (${typeCount})`)
    }
}

/*
An army can only have a JMPS combined value
of 2. Either 2 units with JMPS1, or one unit with
JMPS2
*/
function jmpsCheck(list: IResult[]) {
    const re = /JMPS(\d+)/
    const jmpsTotal = list.filter(r => r.found).map(r => r.unit?.BFAbilities).map(ab => {
        if (!ab) {
            return 0
        }
        const match = re.exec(ab)
        if (!match) {
            return 0
        }
        return +match[1]
    }).reduce((total, jmps) => total + jmps)
    return (jmpsTotal <= 2) ? VALID : invalid(`Total JMPS too high: ${jmpsTotal}`)
}

/*
Skill levels may only go as low as 2, and as high
as 6
Players are allowed 2 units at the extremes of
skill adjustment.
Examples:
1. Two Units at Skill 2, none at Skill 6
2. Two Units at Skill 6, none at Skill 2
3. One Unit at Skill 2 and One Unit at Skill 6
*/
function pilotSkillCheck(list: IResult[]) {
    const totalSkill26 = list.map(r => +r.skill).filter(s => (s == 2 || s == 6)).length
    if (totalSkill26 > 2) {
        return invalid(`Too many units on skill 2 or 6: ${totalSkill26}`)
    }
    const totalSkill17 = list.map(r => +r.skill).filter(s => (s < 2 || s > 6)).length
    return (totalSkill17 == 0) ? VALID : invalid(`Units of skill <=1 or >=7: ${totalSkill17}`)
}


function variantCheck(list: IResult[]) {
    const repeatedVariants = Array.from((list.filter(r => (r?.unit?.Type) && (["BattleMech", "IndustrialMech"].includes(r.unit.Type.Name)))).reduce( (acc, r) => {
        if (r.unit) {
            acc.set(r.unit.Name, (acc.get(r.unit.Name)||0)+1)
        }
        return acc
    }, new Map<String, number>())).filter(([_, c]) => c>1)
    const variantsText = repeatedVariants.map(([n,c]) => `${n}: ${c}`).join(",")
    return (repeatedVariants.length == 0) ? VALID : invalid(`More than one mech of the same variant: ${variantsText}`)
}

function chassisCheck(list: IResult[]) {
    const chassisCount = Array.from(list.reduce( (acc, r) => {
        if (r.unit) {
            acc.set(r.unit.Class, (acc.get(r.unit.Class)||0)+1)
        }
        return acc
    }, new Map<String, number>()))
    const tripleChassis = chassisCount.filter(([_,c]) => c>2)
    if (tripleChassis.length > 0) {
        const tripleChassisText = tripleChassis.map(([n,c]) => `${n}: ${c}`).join(",")
        return invalid(`Chassis repeated more than twice: ${tripleChassisText}}`)
    }
    const doubleChassis = chassisCount.filter(([_,c]) => c==2)
    const doubleChassisText = tripleChassis.map(([n,c]) => `${n}: ${c}`).join(",")
    return (doubleChassis.length <= 2) ? VALID : invalid(`More than 2 chassis repeated twice: ${doubleChassisText}`)
}

export const LIST_CHECKS: Check[] = [
    check("Unit Count <=16", unitCountCheck),
    check("Max 12 Mechs", typeCountCheckFactory(["BattleMech", "IndustrialMech"], 12)),
    check("Max 8 Combat Vehicles", typeCountCheckFactory(["Combat Vehicle"], 8)),
    check("Max 5 Infantry", typeCountCheckFactory(["Infantry"], 5)),
    check("JMPS total <= 2", jmpsCheck),
    check("Mech Variant check", variantCheck),
    check("Chassis Rule of 2", chassisCheck),
    check("Pilot Skills (at most 2 of skill 2/6)", pilotSkillCheck),
]

function judge(mu: ValidateUnit, valid: boolean, msg?: string, u?:IUnit) {
    return {
        ...mu,
        found: valid,
        error: msg,
        unit: u
    }
}


/*
Units and Abilities Not Allowed
Units with the DRO ability
Aerospace
Advanced Aerospace
Support Vehicles
Advanced Support Vehicles
Any unit that is Experimental Tech Level.
---
TODO: Outstanding checks
* Any unit that is Unique in the chosen Era.
* Any unit that is Extinct in the chosen Era.

*/
export function testUnit(v:ValidateUnit, u: IUnit) {
    if (!u) {
        return judge(v, false, "Not Found")
    }
    if (u.BFAbilities?.includes("DRO")) {
        return judge(v, false, "Unit with DRO ability", u)
    }
    if (["Advanced Aerospace", "Aerospace", "Support Vehicle", "Advanced Support"].includes(u.Type.Name)) {
        return judge(v, false, `Forbidden Unit Type: ${u.Type.Name}`, u)
    }
    if (u.Rules == "Experimental") {
        return judge(v, false, "Experimental rules level not allowed", u)
    }
    if (+v.skill < 2) {
        return judge(v, false, "Units with skill 1 or less not allowed", u)
    }
    if (+v.skill > 6) {
        return judge(v, false, "Units with skill 7 or more not allowed", u)
    }
    return judge(v, true, undefined, u)
}

