import React, { useState } from "react";

const colorOptions = ["red-500", "yellow-500", "blue-500", "green-500", "orange-500", "black", "white"]

interface CardEditProps {
    name: string,
    borderColor: string,
    onSave: (name: string, borderColor: string) => void
}

const CardEditModal = React.forwardRef<HTMLDialogElement, CardEditProps>((props, ref) => {
    const [unitName, setUnitName] = useState(props.name)
    const [borderColor, setBorderColor] = useState(props.borderColor)
    return (
        <dialog id="dlg_card_edit" ref={ref} className="modal">
            <div className="modal-box w-full max-w-sm">
                <label className="form-control w-full min-w-full">
                    <div className="label">
                        <span className="label-text">Unit Name</span>
                    </div>
                    <input type="text" className="input input-bordered w-full" value={unitName} onChange={(evt) => setUnitName(evt.target.value)} />
                </label>
                <div className="flex flex-wrap justify-between w-full my-2">
                    {colorOptions.map(color => (
                        <div
                            key={color}
                            className={`w-8 h-4 mx-2 my-1 cursor-pointer bg-${color} border border-solid border-2 border-${(borderColor === color) ? "black" : "transparent"} box-border`}
                            onClick={() => setBorderColor(color)}
                        />
                    ))}
                </div>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn" onClick={() => props.onSave(unitName, borderColor)}>Save</button>
                        <button className="btn">Cancel</button>
                    </form>
                </div>
            </div>
        </dialog>
    )
});
CardEditModal.displayName = "Card Edit"

export default CardEditModal