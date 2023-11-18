import { compareSelectedUnits } from "./shareApi";
import { ISelectedUnit, currentPV, totalPV } from "./unitListApi";

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
    return res
}

function selectUnits(candidates: IUnitWithPV[], selected: ISelectedUnit[], results: ISelectedUnit[][], minPV: number, maxPV: number) {
    const pickedWeight = totalPV(candidates)
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

