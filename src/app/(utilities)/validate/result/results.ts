import { currentPV, IUnit } from "@/api/unitListApi"

export const NOT_AVAILABLE_ERROR = "Not Available"


const BF_TYPE_CV = "CV"
const BF_TYPE_CI = "CI"
const BF_TYPE_BA = "BA"
const BF_TYPE_PM = "PM"

const ITN_RE = /^IT([0-9]{1,2})$/


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
    /** Indexes into the validated list for units that cause this failure. */
    offenders?: number[]
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

function invalid(msg: string, offenders?: number[]): ICheckResult {
    return {
        valid: false,
        message: msg,
        offenders,
    }
}

/*
Armies may have no more than:
- 16 units per Army
- 12 of any Mech Type (Battlemech/ Industrial/
Omnimech)
- 6 Combat Vehicles
- 5 of any Infantry Type (includes Battlearmor)
*/
function unitCountCheck(list: IResult[]) {
    return (list.length<=16) ? VALID : invalid("Too many units!", list.map((_, i) => i))
}

function typeCountCheckFactory(types: string[], maxCount: number) {
    return (list: IResult[]) => {
        const offenders = list.map((r, i) => ({ r, i })).filter(({ r }) => r.found && types.includes(r?.unit?.Type.Name || "INVALID")).map(({ i }) => i)
        const typeCount = offenders.length
        return (typeCount <= maxCount) ? VALID : invalid(`Too many units of type ${types} (${typeCount})`, offenders)
    }
}

/*
An army can only have a JMPS combined value
of 2. Either 2 units with JMPS1, or one unit with
JMPS2
*/
function jmpsValue(abilities?: string) {
    if (!abilities) return 0
    const match = /JMPS(\d+)/.exec(abilities)
    return match ? +match[1] : 0
}

function jmpsCheck(list: IResult[]) {
    const contributors = list.map((r, i) => ({ i, jmps: r.found ? jmpsValue(r.unit?.BFAbilities) : 0 })).filter(c => c.jmps > 0)
    const jmpsTotal = contributors.reduce((total, c) => total + c.jmps, 0)
    return (jmpsTotal <= 2) ? VALID : invalid(`Total JMPS too high: ${jmpsTotal}`, contributors.map(c => c.i))
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
    const skill26 = list.map((r, i) => ({ i, s: +r.skill })).filter(({ s }) => (s == 2 || s == 6))
    if (skill26.length > 2) {
        return invalid(`Too many units on skill 2 or 6: ${skill26.length}`, skill26.map(({ i }) => i))
    }
    const skill17 = list.map((r, i) => ({ i, s: +r.skill })).filter(({ s }) => (s < 2 || s > 6))
    return (skill17.length == 0) ? VALID : invalid(`Units of skill <=1 or >=7: ${skill17.length}`, skill17.map(({ i }) => i))
}

function canHaveRepeatedVariant(u?: IUnit) {
    if (!u || !u.BFType) return false
    const canHaveVariants = [BF_TYPE_BA, BF_TYPE_CI, BF_TYPE_PM].includes(u.BFType)
    if (canHaveVariants) return canHaveVariants
    if (BF_TYPE_CV === u.BFType) {
        // CVs with IT3+ can have repeated variant
        const itTotal = u.BFAbilities.split(",").map(a => ITN_RE.exec(a)).map(m => m ? +m[1] : 0).reduce((t,c)=>t+c)
        return itTotal < 3
    }
    return false;
}

function variantCheck(list: IResult[]) {
    const indexesByName = new Map<string, number[]>()
    list.forEach((r, i) => {
        if (!canHaveRepeatedVariant(r.unit) || !r.unit) return
        const indexes = indexesByName.get(r.unit.Name) ?? []
        indexes.push(i)
        indexesByName.set(r.unit.Name, indexes)
    })
    const repeatedVariants = Array.from(indexesByName.entries()).filter(([_, indexes]) => indexes.length > 1)
    const variantsText = repeatedVariants.map(([n, indexes]) => `${n}: ${indexes.length}`).join(",")
    return (repeatedVariants.length == 0) ? VALID : invalid(`More than one unit of the same variant: ${variantsText}`, repeatedVariants.flatMap(([_, indexes]) => indexes))
}

function chassisCheck(list: IResult[]) {
    const indexesByChassis = new Map<string, number[]>()
    list.forEach((r, i) => {
        if (!r.unit) return
        const indexes = indexesByChassis.get(r.unit.Class) ?? []
        indexes.push(i)
        indexesByChassis.set(r.unit.Class, indexes)
    })
    const tripleChassis = Array.from(indexesByChassis.entries()).filter(([_, indexes]) => indexes.length > 2)
    if (tripleChassis.length > 0) {
        const tripleChassisText = tripleChassis.map(([n, indexes]) => `${n}: ${indexes.length}`).join(",")
        return invalid(`Chassis repeated more than twice: ${tripleChassisText}`, tripleChassis.flatMap(([_, indexes]) => indexes))
    }
    return VALID
}

function maxOneUnique(list: IResult[]) {
    const uniques = list.map((res, i) => ({ res, i })).filter(({ res }) => res.error === 'unique')
    if (uniques.length > 1) {
        const uniquesText = uniques.map(v => v.res.unit?.Name).join(",")
        return invalid(`More than one unique unit: [${uniquesText}]`, uniques.map(({ i }) => i))
    }
    return VALID
}


export const LIST_CHECKS: Check[] = [
    check("Unit Count <=16", unitCountCheck),
    check("Max 12 Mechs", typeCountCheckFactory(["BattleMech", "IndustrialMech"], 12)),
    check("Max 6 Combat Vehicles", typeCountCheckFactory(["Combat Vehicle"], 6)),
    check("Max 5 Infantry", typeCountCheckFactory(["Infantry"], 5)),
    check("JMPS total <= 2", jmpsCheck),
    check("Unit Variant check", variantCheck),
    check("Chassis Rule of 2", chassisCheck),
    check("Pilot Skills (at most 2 of skill 2/6)", pilotSkillCheck),
    check("Max one Unique", maxOneUnique),
]

export function judge(mu: ValidateUnit, valid: boolean, msg?: string, u?:IUnit) {
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
---
TODO: Outstanding checks
* Any unit that is Unique in the chosen Era.
* Any unit that is Extinct in the chosen Era.

*/
export function testUnit(v: ValidateUnit, u?: IUnit) {
    if (!u) {
        return judge(v, false, "Not Found")
    }
    if (u.BFAbilities?.includes("DRO")) {
        return judge(v, false, "Unit with DRO ability", u)
    }
    if (["Advanced Aerospace", "Aerospace", "Support Vehicle", "Advanced Support"].includes(u.Type.Name)) {
        return judge(v, false, `Forbidden Unit Type: ${u.Type.Name}`, u)
    }
    if (+v.skill < 2) {
        return judge(v, false, "Units with skill 1 or less not allowed", u)
    }
    if (+v.skill > 6) {
        return judge(v, false, "Units with skill 7 or more not allowed", u)
    }
    if (currentPV({...u, skill: +v.skill}) < 7) {
        return judge(v, false, "Units with adjusted PV less than 7 are not allowed", u)
    }
    return judge(v, true, undefined, u)
}

