import { saveList } from "@/app/api/dao/lists";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { ReactNode, useRef, useState } from "react";
import { ListBuilderController } from "./listBuilderController";

type SaveProps = {
    name: string
    controller: ListBuilderController
    loggedIn: boolean
}


function SaveForm({ name, controller, loggedIn }: SaveProps) {

    const saveOnServer = (loggedIn) ? (<button className="btn btn-sm flex-1" onClick={() => saveList(name, controller.getSave())}>Save on Server</button>) : ""

    return (
        <form method="dialog" className="w-full">
            <button className="absolute btn btn-square btn-xs top-0 right-0"><XMarkIcon className="h-3 w-3" /></button>
            <div className="flex flex-row-reverse gap-1">
                {saveOnServer}
                <button className="btn btn-sm flex-1" onClick={() => controller.store(name)}>Save in Browser</button>
            </div>
        </form>
    )
}

const RefSavePanel = React.forwardRef<HTMLDialogElement, SaveProps>(({ name, controller, loggedIn }, ref) => {
    const [currentName, setCurrentName] = useState(name)
    return (
        //items-center text-center overflow-scroll 
        <dialog id="dlg_Save" className="modal text-xs z-100 modal-middle" ref={ref}>
            <div className="modal-box w-full rounded-md">
                <div className="relative w-full">
                    <div className="label">
                        <span className="label-text">Enter name:</span>
                    </div>
                    <div className="w-full flex">
                        <input type="text" placeholder="list name" className="input input-bordered input-sm mb-1 w-full mx-2" onChange={(e) => setCurrentName(e.target.value)} />
                    </div>
                    <div className="modal-action my-0 flex text-center items-center p-1">
                        <SaveForm name={currentName} controller={controller} loggedIn={loggedIn} />
                    </div>
                </div>
            </div>
        </dialog>
    )
}
)
RefSavePanel.displayName = "SavePanel"

export default function useSaveDialog(props: SaveProps, children?: ReactNode, className?: string) {
    const [isOpen, setOpen] = useState(false)
    const panelRef = useRef<HTMLDialogElement>(null)
    function onOpen() {
        panelRef?.current && panelRef.current.showModal()
        setOpen(true)
    }
    return [
        <button className="btn btx-xs" onClick={() => onOpen()} key="svBtn">{children}</button>,
        <RefSavePanel ref={panelRef} {...props} key="svDlg" />,
    ]
}


