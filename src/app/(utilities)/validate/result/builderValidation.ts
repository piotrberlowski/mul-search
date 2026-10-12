import { ISelectedUnit } from "@/api/unitListApi"
import { resolveUnitsAvailability } from "@/app/api/dao/units"
import { IResult, LIST_CHECKS, NOT_AVAILABLE_ERROR, testUnit } from "./results"

const LOOKUP_ERROR = "Could not verify availability"

export type BuilderValidation = {
    valid: boolean
    messages: string[]
    errorsByOrdinal: Record<number, string[]>
}

export const EMPTY_VALIDATION: BuilderValidation = {
    valid: true,
    messages: [],
    errorsByOrdinal: {},
}

type Availability = {
    available: boolean
    lookupError?: string
}

const PENDING: Availability = { available: true, lookupError: "pending" }

const availabilityCache = new Map<string, Availability>()

function cacheKey(unitId: string, era: string, specific: string) {
    return [era, specific, unitId].join("|")
}

async function lookupAvailability(units: ISelectedUnit[], era: string, specific: string): Promise<Availability[]> {
    const missing = units.filter(unit => !availabilityCache.has(cacheKey(unit.Id, era, specific)))
    if (missing.length > 0) {
        try {
            const resolved = await resolveUnitsAvailability(missing.map(unit => unit.Id), Number(era), Number(specific))
            missing.forEach(unit => {
                const row = resolved[unit.Id]
                availabilityCache.set(cacheKey(unit.Id, era, specific), {
                    available: row?.available === true,
                })
            })
        } catch {
            return units.map(unit => availabilityCache.get(cacheKey(unit.Id, era, specific)) ?? {
                available: false,
                lookupError: LOOKUP_ERROR,
            })
        }
    }
    return units.map(unit => availabilityCache.get(cacheKey(unit.Id, era, specific)) ?? { available: false, lookupError: LOOKUP_ERROR })
}

function unitMessages(unit: ISelectedUnit, availability?: Availability) {
    const messages: string[] = []
    const judged = testUnit({ skill: String(unit.skill), name: unit.Name }, unit)
    if (!judged.found && judged.error) {
        messages.push(judged.error)
    }
    if (!availability) {
        messages.push(NOT_AVAILABLE_ERROR)
        return messages
    }
    if (availability.lookupError === "pending") {
        return messages
    }
    if (availability.lookupError) {
        messages.push(availability.lookupError)
        return messages
    }
    if (!availability.available) {
        messages.push(NOT_AVAILABLE_ERROR)
    }
    return messages
}

function assemble(units: ISelectedUnit[], availability?: Availability[]): BuilderValidation {
    if (units.length === 0) return EMPTY_VALIDATION

    const perUnit = units.map((unit, index) => unitMessages(unit, availability?.[index]))
    const results: IResult[] = units.map((unit) => ({
        skill: String(unit.skill),
        name: unit.Name,
        found: true,
        unit,
    }))

    const errorsByOrdinal: Record<number, string[]> = {}
    units.forEach((unit, index) => {
        errorsByOrdinal[unit.ordinal] = [...perUnit[index]]
    })

    const messages: string[] = []
    if (!availability) {
        messages.push("Select a faction and era to validate availability")
    }

    LIST_CHECKS.forEach(({ check }) => {
        const outcome = check(results)
        if (outcome.valid || !outcome.message) return
        messages.push(outcome.message)
        outcome.offenders?.forEach(index => {
            const ordinal = units[index].ordinal
            errorsByOrdinal[ordinal].push(outcome.message as string)
        })
    })

    units.forEach((unit, index) => {
        perUnit[index].forEach(message => messages.push(`${unit.Name}: ${message}`))
        errorsByOrdinal[unit.ordinal] = Array.from(new Set(errorsByOrdinal[unit.ordinal]))
    })

    return {
        valid: messages.length === 0,
        messages,
        errorsByOrdinal,
    }
}

export function validateLocal(units: ISelectedUnit[], era: string | null, specific: string | null): BuilderValidation {
    if (!era || !specific) return assemble(units)
    const known = units.map(unit => availabilityCache.get(cacheKey(unit.Id, era, specific)) ?? PENDING)
    return assemble(units, known)
}

export async function validateAgainstAvailability(
    units: ISelectedUnit[],
    era: string | null,
    specific: string | null,
    signal: AbortSignal,
): Promise<BuilderValidation> {
    if (units.length === 0 || !era || !specific) {
        return validateLocal(units, era, specific)
    }
    const availability = await lookupAvailability(units, era, specific)
    if (signal.aborted) {
        return validateLocal(units, era, specific)
    }
    return assemble(units, availability)
}
