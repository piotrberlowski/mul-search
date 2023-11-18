import { createContext, useContext } from "react"
import { IUnit } from "./unitLine"

export type UnitReceiver = (u: IUnit) => void

export class SearchResultsController {

    private listConstraints: string
    private addEventListener: UnitReceiver = (u: IUnit) => { console.log("Empty unit dispatcher") }


    constructor(constraints: string) {
        this.listConstraints = constraints
    }

    public register(r: UnitReceiver) {
        this.addEventListener = r
    }

    public notify(unit: IUnit) {
        this.addEventListener(unit)
    }

    public getListConstraints(): string {
        return this.listConstraints
    }

}

export const SearchResultsContext = createContext<SearchResultsController>(
    new SearchResultsController('none')
)

export function useSearchResultsContext() {
    return useContext(SearchResultsContext)
}
