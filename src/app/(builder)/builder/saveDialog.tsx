import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormEvent, useRef, useState } from "react";
import { ListBuilderController } from "./listBuilderController";

type NameDialogProps = {
    label: string
    confirmLabel: string
    initialName: string
    onConfirm: (name: string) => Promise<string | null> | string | null
}

export default function useNameDialog({ label, confirmLabel, initialName, onConfirm }: NameDialogProps) {
    const panelRef = useRef<HTMLDialogElement>(null)
    const [currentName, setCurrentName] = useState(initialName)
    const [error, setError] = useState<string | null>(null)

    function onOpen() {
        setCurrentName(initialName)
        setError(null)
        panelRef.current?.showModal()
    }

    async function onSubmit(event: FormEvent) {
        event.preventDefault()
        const message = await Promise.resolve(onConfirm(currentName))
        if (message) {
            setError(message)
            return
        }
        setError(null)
        panelRef.current?.close()
    }

    return [
        <button className="btn text-center w-full btn-sm" onClick={() => onOpen()} key="svBtn" type="button">{label}</button>,
        <dialog id="dlg_Save" className="modal text-xs z-100 modal-middle" ref={panelRef} key="svDlg" onClose={() => setError(null)}>
            <div className="modal-box w-full rounded-md">
                <form onSubmit={onSubmit} className="w-full">
                    <button type="button" className="absolute btn btn-square btn-xs top-0 right-0" onClick={() => panelRef.current?.close()}><XMarkIcon className="h-3 w-3" /></button>
                    <label className="label" htmlFor="stored-list-name">
                        <span className="label-text">Enter name:</span>
                    </label>
                    <input
                        id="stored-list-name"
                        type="text"
                        placeholder="list name"
                        className="input input-bordered input-sm mb-1 w-full"
                        value={currentName}
                        onChange={(e) => setCurrentName(e.target.value)}
                    />
                    {error ? <p className="text-error px-1 mb-1">{error}</p> : null}
                    <div className="modal-action my-0 flex text-center items-center p-1">
                        <button type="submit" className="btn btn-sm flex-1">{confirmLabel}</button>
                    </div>
                </form>
            </div>
        </dialog>,
    ]
}

export function rememberOrSaveAs(controller: ListBuilderController, loggedIn: boolean) {
    return (name: string) => loggedIn ? controller.saveAs(name) : controller.remember(name)
}
