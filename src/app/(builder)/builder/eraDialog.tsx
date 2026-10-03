import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import React, { ReactNode, useRef, useState } from "react";
import { useEraCatalog } from "@/app/factionsContext";

interface EraParams {}

const RefEraPanel = React.forwardRef<HTMLDialogElement, EraParams>(({}, ref) => {
    const router = useRouter()
    const params = useSearchParams()
    const { eras, factionsByEra } = useEraCatalog()
    const factionId = params.get("specific")
    const erasForFaction = eras.filter((era) =>
        factionsByEra.some((entry) =>
            `${entry.eraId}` === `${era.value}` &&
            entry.factions.some((faction) => `${faction.value}` === factionId)
        )
    )
    const [era, setEra] = useState(params.get("era")||"")

    function navigate() {
        const newParams = new URLSearchParams(params)
        newParams.set('era', era)
        router.push(
            '/builder?' + newParams.toString(),
        )
    }

    return (
        <dialog id="dlg_era" className="modal text-xs z-100 modal-middle" ref={ref}>
            <div className="modal-box w-full rounded-md">
                <div className="relative">
                    <div className="label">
                        <span className="label-text">Go to:</span>
                    </div>
                </div>
                <select className="select select-bordered select-xs w-full max-w-xs" value={era} onChange={
                        e => {
                            setEra(e.target.value)
                        }
                    }>
                    <option key="" value=""></option>
                    {
                        erasForFaction.map((eraOption) => (
                            <option key={eraOption.value} value={eraOption.value}>{eraOption.label}</option>
                        ))
                    }
                </select>
                <div className="modal-action my-0 flex text-center items-center p-1">
                    <form method="dialog">
                        <button className="absolute btn btn-square btn-xs top-0 right-0"><XMarkIcon className="h-3 w-3" /></button>
                        <button className="btn btn-outline btn-sm" onClick={navigate}>Change Era</button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}
)
RefEraPanel.displayName = "EraPanel"

export default function useEraDialog(children?: ReactNode, className?: string) {
    const [isOpen, setOpen] = useState(false)
    const panelRef = useRef<HTMLDialogElement>(null)
    function onOpen() {
        panelRef?.current && panelRef.current.showModal()
        setOpen(true)
    }
    return [
        <button className={className || "btn btn-sm"} onClick={() => onOpen()} key="eraBtn">{children}</button>,
        <RefEraPanel ref={panelRef} key="eraDlg"/>,
    ]
}


