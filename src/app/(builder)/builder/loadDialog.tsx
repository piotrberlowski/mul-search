import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { ReactNode, useRef, useState } from "react";
import { ListBuilderController } from "./listBuilderController";
import Link from "next/link";

type LoadProps = {
    name: string
    controller: ListBuilderController
    loggedIn: boolean
}

/*
<button className="h-1/2 w-full" onClick={e => controller.load(listName)}>Load</button>
*/

const RefLoadPanel = React.forwardRef<HTMLDialogElement, LoadProps>(({ name, controller, loggedIn }, ref) => {
    const [currentName, setCurrentName] = useState(name)

    const loggedInLists = (loggedIn) ? (<Link href="/user" className="btn btn-sm btn-outline text-xs">Click here for server saves</Link>) : ""

    function loadList() {
        controller.load(currentName)
    }

    return (
        //items-center text-center overflow-scroll 
        <dialog id="dlg_load" className="modal text-xs z-100 modal-middle" ref={ref}>
            <div className="modal-box w-full rounded-md">
                <div className="relative">
                    {loggedInLists}
                    <div className="label">
                        <span className="label-text">Pick list to load:</span>
                    </div>
                    <select className="select select-bordered select-xs w-full max-w-xs" value={currentName} onChange={
                        e => {
                            setCurrentName(e.target.value)
                        }
                    }>
                        <option key="" value=""></option>
                        {
                            controller.getStoredLists().map(name => (<option key={name} value={name}>{name}</option>))
                        }
                    </select>
                </div>
                <div className="modal-action my-0 flex text-center items-center p-1">
                    <form method="dialog">
                        <button className="absolute btn btn-square btn-xs top-0 right-0"><XMarkIcon className="h-3 w-3" /></button>
                        <button className="btn btn-sm" onClick={() => loadList()}>Load</button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}
)
RefLoadPanel.displayName = "LoadPanel"

export default function useLoadDialog(props: LoadProps, children?: ReactNode, className?: string) {
    const [isOpen, setOpen] = useState(false)
    const panelRef = useRef<HTMLDialogElement>(null)
    function onOpen() {
        panelRef?.current && panelRef.current.showModal()
        setOpen(true)
    }
    return [
        <button className="btn btx-xs" onClick={() => onOpen()} key="ldBtn">{children}</button>,
        <RefLoadPanel ref={panelRef} {...props} key="ldDlg"/>,
    ]
}


