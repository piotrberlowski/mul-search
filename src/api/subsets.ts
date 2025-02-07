import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { compareSelectedUnits } from "./shareApi";
import { ISelectedUnit, currentPV, totalPV } from "./unitListApi";
import { UNITS_KEY } from "./playApi";
import { appendFile } from "fs";

interface IUnitWithPV extends ISelectedUnit {
    pv: number
}

export function generateSubsets(units: ISelectedUnit[], minPV: number, maxPV: number): ISelectedUnit[][] {
    var res = new Array<ISelectedUnit[]>()
    let candidates = units.map(u => {
        return {
            pv: currentPV(u),
            ...u
        }
    })
    selectUnits(candidates, [], res, minPV, maxPV)
    return deDuplicate(res)
}

function represent(units: ISelectedUnit[]): string {
    return units.map(u => `${u.Id}:${u.skill}`).join()
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

function selectUnits(candidates: IUnitWithPV[], selected: ISelectedUnit[], results: ISelectedUnit[][], minPV: number, maxPV: number) {
    const pickedWeight = totalPV(selected)
    if (pickedWeight > maxPV) {
        console.log(`Picked Weight: ${pickedWeight} -> solution overweight, bounding`)
        return     
    }
    let solution = [...candidates, ...selected]
    const weight = totalPV(solution)
    if (weight > maxPV) {
        if (candidates.length == 0) {
            return
        }
        console.log(`Weight: ${weight} -> overweight, branching`)
        // Solve 2 sub-problems
        // A: first element is not part of the solution
        let next = candidates.slice(1)
        selectUnits(next, selected, results, minPV, maxPV)
        // B: first element is part of the solution
        let newSelection = candidates[0]
        selectUnits(next, [...selected, newSelection], results, minPV, maxPV)
        return
    }
    if (weight < minPV) {
        console.log(`Weight: ${weight} -> underweight, cutting`)
        return
    }
    console.log(`Weight: ${weight} -> accepted`)
    results.push(solution.sort(compareSelectedUnits))
}

