import { generateSubsets } from "@/api/subsets";
import { ISelectedUnit, currentPV, totalPV } from "@/api/unitListApi";
import React, { useState, useRef, useImperativeHandle, Ref } from "react";
import PlayLink from "./playLink";
import { PlayCircleIcon } from "@heroicons/react/20/solid";

function CombinationLine({ units }: { units: ISelectedUnit[] }) {
    return (
        <PlayLink units={units} className="flex my-0 dark:border-gray-800 font-small text-center items-center">
            <PlayCircleIcon className="min-h-5 min-w-5 h-5 w-5 stroke-red-600 rounded-none" />
            <div className="flex-none p-2">{totalPV(units)}PV: </div>
            {
                units.map(unit => (<div key={unit.ordinal} className="flex-initial p-2">{unit.ordinal}:{unit.Name}</div>))
            }
        </PlayLink>
    )
}

export type CombinationModal = {
    showModal: () => void
}

type CombinationProps = {
    units: ISelectedUnit[]
}

const RefCombinationsPanel = React.forwardRef<CombinationModal, CombinationProps>((props, ref) => {
    const [minPV, setMinPv] = useState(249)
    const [maxPV, setMaxPv] = useState(250)
    const inputRef = useRef<HTMLDialogElement>(null);

    const handle = {
        showModal: () => {
            if (inputRef?.current) {
                inputRef.current.showModal();
            }
        },
    }

    useImperativeHandle(ref, () => handle);

    return (
        //items-center text-center overflow-scroll 
        <dialog id="dlg_combinations" className="modal fixed z-10 text-xs" ref={inputRef}>
            <div className="modal-box w-full max-w-full lg:w-3/4 lg:max-w-3/4 h-full p-2">
                <div className="modal-action my-0 flex text-center items-center">
                    <span className="flex-1 text-center items-center">From: <input type="number" className="flex-1 w-1/8" value={minPV} onChange={(e) => setMinPv(e.target.valueAsNumber)} /></span>
                    <span className="flex-1 text-center items-center">To: <input type="number" className="flex-1 w-1/8" value={maxPV} onChange={(e) => setMaxPv(e.target.valueAsNumber)} /></span>
                    <form method="dialog">
                        <button className="border border-solid px-1 border-red-500 rounded-md h-5 w-5">X</button>
                    </form>
                </div>

                {
                    generateSubsets(props.units, minPV, maxPV).map((line, idx) => (<CombinationLine key={idx} units={line} />))
                }

            </div>
        </dialog>
    )
}
)
RefCombinationsPanel.displayName = "CombinationsPanel"

export default function Combinations(props: CombinationProps) {
    const panelRef = useRef<CombinationModal>(null)
    return (
        <>
            <button className="text-center" onClick={() => panelRef?.current && panelRef.current.showModal()}>Generate Possible Sublists</button>
            <RefCombinationsPanel units={props.units} ref={panelRef} />
        </>
    )
}