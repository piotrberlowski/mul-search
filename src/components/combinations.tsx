import { generateSubsets } from "@/api/subsets";
import { ISelectedUnit, currentPV, totalPV } from "@/api/unitListApi";
import { useState } from "react";
import PlayLink from "./playLink";

function CombinationLine({units}:{units:ISelectedUnit[]}) {
    return (
            <PlayLink units={units} className="flex my-0 border border-solid border-gray-400 dark:border-gray-800 font-small text-center items-center"> 
                <div className="flex-none p-2">{totalPV(units)}PV: </div>
                {
                    units.map(unit => (<div key={unit.ordinal} className="flex-initial p-2">{unit.ordinal}:{unit.Name}</div>))
                }
            </PlayLink>
    )
}

function CombinationsPanel({units, hide}:{units:ISelectedUnit[], hide:()=>void}) {
    const [minPV, setMinPv] = useState(249)
    const [maxPV, setMaxPv] = useState(250)

    return (
        <div className="fixed bg-inherit inset-y-10 inset-x-[1%] z-10 border border-red-500 items-center text-center overflow-scroll text-xs">
            <div className="flex text-center items-center">
                <span className="flex-1 text-center items-center">From: <input type="number" className="flex-1 w-1/8" value={minPV} onChange={(e) => setMinPv(e.target.valueAsNumber)}/></span>
                <span className="flex-1 text-center items-center">To: <input type="number" className="flex-1 w-1/8" value={maxPV} onChange={(e) => setMaxPv(e.target.valueAsNumber)}/></span>
                <button className="absolute right-0 top-0 border border-solid px-1 border-red-500 w-5" onClick={e => hide()}>X</button>
            </div>
            {
                generateSubsets(units, minPV, maxPV).map((line,idx) => (<CombinationLine key={idx} units={line}/>))
            }
        </div>
    )
}

export default function Combinations ({target, units, ready}: {target: number, units:ISelectedUnit[], ready?: (callback: (len:number)=>void)=>void}) {
    const [count, setCount] = useState(0)
    const [visible, setVisible] = useState(false)
    var entryPanel = (
        <div className="w-full print:hidden flex">
            <button className="flex-6 w-6/8 text-center" onClick={(e)=>{setVisible(true)}}>Generate Possible Sublists</button>
        </div>
    )
    var combinationsDisplay = visible ? (<CombinationsPanel units={units} hide={()=>setVisible(false)}/>):''
    if (ready) {
        ready((len:number) => setCount(len))
    } 
    if (units && target == units.length) {
        return (
            <>
                {entryPanel}
                {combinationsDisplay}
            </>
        )
    } else {
        return (
            <>
            </>
        )
    }

}