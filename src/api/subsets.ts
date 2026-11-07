import { compareSelectedUnits } from "./shareApi";
import { ISelectedUnit, currentPV } from "./unitListApi";

interface IUnitWithPV extends ISelectedUnit {
    pv: number
}

export function generateSubsets(units: ISelectedUnit[], minPV: number, maxPV: number): ISelectedUnit[][] {
    if (!Number.isFinite(minPV) || !Number.isFinite(maxPV)) return []
    const res = new Array<ISelectedUnit[]>()
    const candidates = units.map(u => ({ ...u, pv: currentPV(u) }))
    selectUnits(candidates, [], res, minPV, maxPV)
    return deDuplicate(res)
}

function unitToken(unit: ISelectedUnit): string {
    return `${unit.Id}:${unit.skill}`
}

export function represent(units: ISelectedUnit[]): string {
    return units.map(unitToken).sort().join()
}

export function restoreSubset(key: string, units: ISelectedUnit[]): ISelectedUnit[] | null {
    const pool = [...units]
    const picked: ISelectedUnit[] = []
    for (const token of key.split(',')) {
        const idx = pool.findIndex(u => unitToken(u) === token)
        if (idx < 0) return null
        picked.push(...pool.splice(idx, 1))
    }
    return picked.sort(compareSelectedUnits)
}

function deDuplicate(lists: ISelectedUnit[][]): ISelectedUnit[][] {
    let uniques = new Set<string>()
    let res = new Array<ISelectedUnit[]>()
    
    lists.forEach(l => {
        let repr = represent(l)
        if (!uniques.has(repr)) {
            uniques.add(repr)
            res.push(l)
        }
    })

    return res
}

function weightOf(units: IUnitWithPV[]): number {
    return units.reduce((sum, u) => sum + u.pv, 0)
}

function selectUnits(candidates: IUnitWithPV[], selected: IUnitWithPV[], results: ISelectedUnit[][], minPV: number, maxPV: number) {
    if (weightOf(selected) > maxPV) {
        return
    }
    const solution = [...candidates, ...selected]
    const weight = weightOf(solution)
    if (weight > maxPV) {
        if (candidates.length == 0) {
            return
        }
        // Solve 2 sub-problems
        // A: first element is not part of the solution
        const next = candidates.slice(1)
        selectUnits(next, selected, results, minPV, maxPV)
        // B: first element is part of the solution
        selectUnits(next, [...selected, candidates[0]], results, minPV, maxPV)
        return
    }
    if (weight < minPV) {
        return
    }
    results.push(solution.sort(compareSelectedUnits))
}
