import { generateSubsets, represent } from "@/api/subsets";
import { ISelectedUnit, defaultPrintedListHeader, stagePrintLists, totalPV } from "@/api/unitListApi";
import { PlayCircleIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import PlayLink from "./playLink";

function CombinationLine({ units }: { units: ISelectedUnit[] }) {
    return (
        <PlayLink units={units} className="flex flex-1 min-w-0 my-0 dark:border-gray-800 font-small text-center items-center">
            <PlayCircleIcon className="min-h-5 min-w-5 h-5 w-5 stroke-red-600 shrink-0 resize-none" />
            <div className="flex-none p-2">{totalPV(units)}PV: </div>
            {
                units.map(unit => (<div key={unit.ordinal} className="flex-initial p-2">{unit.ordinal}:{unit.Name}</div>))
            }
        </PlayLink>
    )
}

function SelectableLine({ units, checked, onToggle, children }: { units: ISelectedUnit[], checked: boolean, onToggle: () => void, children?: ReactNode }) {
    return (
        <div className="flex items-center">
            <input type="checkbox" className="h-4 w-4 mx-1 shrink-0 cursor-pointer accent-red-600" checked={checked} onChange={onToggle} aria-label="Select sub-list" />
            {children}
            <CombinationLine units={units} />
        </div>
    )
}

type SelectedSubList = {
    key: string,
    units: ISelectedUnit[],
    header: string,
}

type CombinationProps = {
    open: boolean,
    units: ISelectedUnit[]
    title: string,
    onClose: () => void
}

const RefCombinationsPanel = React.forwardRef<HTMLDialogElement, CombinationProps>(({ open, units, title, onClose }, ref) => {
    const router = useRouter()
    const [minPV, setMinPv] = useState(249)
    const [maxPV, setMaxPv] = useState(250)
    const [combinations, setCombinations] = useState<ISelectedUnit[][]|null>(null)
    const [selected, setSelected] = useState<SelectedSubList[]>([])

    useEffect(
        () => {
            if (open) {
                setCombinations(generateSubsets(units, minPV, maxPV))
            }
        },
        [ref, units, open, minPV, maxPV]
    )

    useEffect(() => setSelected([]), [units])

    const selectedKeys = new Set(selected.map(s => s.key))

    function select(line: ISelectedUnit[]) {
        setSelected(prev => [...prev, { key: represent(line), units: line, header: '' }])
    }

    function unselect(key: string) {
        setSelected(prev => prev.filter(s => s.key !== key))
    }

    function setHeader(key: string, header: string) {
        setSelected(prev => prev.map(s => s.key === key ? { ...s, header } : s))
    }

    function onPrintLists() {
        stagePrintLists({ title, lists: selected })
        router.push('/share/lists')
    }

    return (
        //items-center text-center overflow-scroll 
        <dialog id="dlg_combinations" className="modal fixed z-10 text-xs" ref={ref} onClose={()=>onClose()}>
            <div className="modal-box w-full max-w-full lg:w-3/4 lg:max-w-3/4 h-full p-2">
                <div className="modal-action my-0 flex text-center items-center">
                    <span className="flex-1 text-center items-center">From: <input type="number" className="flex-1 w-1/8" value={minPV} onChange={(e) => setMinPv(e.target.valueAsNumber)} /></span>
                    <span className="flex-1 text-center items-center">To: <input type="number" className="flex-1 w-1/8" value={maxPV} onChange={(e) => setMaxPv(e.target.valueAsNumber)} /></span>
                    <button type="button" className="btn btn-xs w-auto shrink-0 mx-1" disabled={selected.length === 0} onClick={onPrintLists}>
                        Print Lists{selected.length > 0 ? ` (${selected.length})` : ''}
                    </button>
                    <form method="dialog">
                        <button className="border border-solid px-1 border-red-500 rounded-md h-5 w-5">X</button>
                    </form>
                </div>
                {
                    selected.map((s, idx) => (
                        <SelectableLine key={s.key} units={s.units} checked onToggle={() => unselect(s.key)}>
                            <input
                                type="text"
                                className="input input-xs input-bordered w-32 md:w-48 shrink-0"
                                placeholder={defaultPrintedListHeader(idx)}
                                aria-label="List header"
                                value={s.header}
                                onChange={e => setHeader(s.key, e.target.value)}
                            />
                        </SelectableLine>
                    ))
                }
                {selected.length > 0 ? <div className="divider my-1">Generated sub-lists</div> : null}
                {
                    combinations
                        ?.filter(line => !selectedKeys.has(represent(line)))
                        .map(line => (<SelectableLine key={represent(line)} units={line} checked={false} onToggle={() => select(line)} />))
                    || <div className="w-full h-full items-center"><div>Generating...</div></div>
                }
            </div>
        </dialog>
    )
}
)
RefCombinationsPanel.displayName = "CombinationsPanel"

export function useCombinations(units: ISelectedUnit[], children?: ReactNode, className?: string, title: string = '') {
    const [isOpen, setOpen] = useState(false)
    const panelRef = useRef<HTMLDialogElement>(null)
    function onOpen() {
        panelRef?.current && panelRef.current.showModal()
        setOpen(true)
    }
    return [
            <button className={`text-center ${className}`} onClick={() => onOpen()} key="cmbBtn">{children}</button>,
            <RefCombinationsPanel open={isOpen} units={units} title={title} ref={panelRef} onClose={() => setOpen(false)} key="cmbDlg"/>,
    ]
}


export default function Combinations({ units, title, children, className }: {units: ISelectedUnit[], title?: string, children: ReactNode, className?: string}) {
    const [cmbBtn, cmbDlg] = useCombinations(units, children, className, title)
    return (
        <>
            {cmbBtn}
            {cmbDlg}
        </>
    )
}
