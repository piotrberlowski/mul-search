`use client`

import { useState } from "react"
import { ListBuilderController, useBuilderContext } from "./listBuilderController"
import { LIST_DRAWER_ID } from "./constants"

export default function BuilderLabel() {
    const controller: ListBuilderController = useBuilderContext()
    const [listSummary, setListSummary] = useState(controller.getCurrentListSummary())
    controller.registerSummaryObserver(setListSummary)
    return (
        <label htmlFor={LIST_DRAWER_ID} className="btn btn-sm btn-error ml-2 xl:hidden">Open Builder<br />{listSummary}</label>
    )
}
