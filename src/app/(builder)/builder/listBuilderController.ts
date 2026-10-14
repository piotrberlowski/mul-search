import { compareSelectedUnits } from "@/api/shareApi";
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, exportTTSString, formatDamageBrackets, loadByName, loadLists, removeByName, saveByName, saveLists, totalPV } from "@/api/unitListApi"
import { IUnit } from "@/api/unitListApi";
import { searchParamsFromIds } from "@/app/data";
import { LIST_PARAMETER } from "@/app/(utilities)/validate/result/validation";
import { ChangeListener } from "@/api/commons";
import { createContext, useContext } from "react";
import type { ListSearch } from "./searchQuery";

export class ListBuilderController {
    private save: Save;
    private storedLists: string[];
    private setSave?: ChangeListener<Save>;
    private setName?: ChangeListener<string>;
    private setTotal?: ChangeListener<number>;
    private setStoredLists?: ChangeListener<string[]>;
    private summaryObserver?: ChangeListener<string>;
    public constraintsObserver?: ChangeListener<Save>;

    constructor(
        autosaveName: string,
    ) {
        if (typeof window !== 'undefined') {
            this.save = loadByName(autosaveName)
            this.storedLists = loadLists()
        } else {
            this.save = {
                units: [],
                constraints: "",
                eraId: null,
                factionId: null,
            }
            this.storedLists = []
        }
    }

    private withSearch(units: ISelectedUnit[], search: ListSearch): Save {
        return {
            units,
            constraints: search.constraints,
            eraId: search.eraId,
            factionId: search.factionId,
        }
    }

    public registerBuilder(
        setSave: ChangeListener<Save>,
        setName: ChangeListener<string>,
        setTotal: ChangeListener<number>,
        setStoredLists: ChangeListener<string[]>,

    ) {
        this.setSave = setSave
        this.setName = setName
        this.setTotal = setTotal
        this.setStoredLists = setStoredLists
    }

    public registerSummaryObserver(
        observer: ChangeListener<string>
    ) {
        this.summaryObserver = observer
    }

    public registerConstraintsObserver(setConstraints: ChangeListener<Save>) {
        this.constraintsObserver = setConstraints
    }

    public getUnits() {
        return this.save.units
    }

    public addUnit(unit: IUnit, search: ListSearch) {
        if (!this.setSave) 
            return 
        const isEmpty = this.save.units.length == 0
        const ord = (isEmpty) ? 0 : Math.max(...this.save.units.map(u => u.ordinal)) + 1
        const selected = {
            ordinal: ord,
            skill: 4,
            lance: '',
            ...unit
        }
        this.save = this.withSearch([...this.save.units, selected].sort(compareSelectedUnits), search)
        this.setSave(this.save)
        this.updateTotal()
    }

    public removeUnit(ord: number) {
        if (!this.setSave) 
            return 
        this.save = {
            ...this.save,
            units: this.save.units.filter(u => u.ordinal != ord),
        }
        this.setSave(this.save)
        this.updateTotal()
    }


    public updateTotal() {
        if (!this.setSave || !this.setTotal) 
            return 
        this.save = {
            ...this.save,
            units: this.save.units.sort(compareSelectedUnits),
        }
        this.setSave(this.save)
        const total = totalPV(this.save.units)
        this.setTotal(total)
        saveByName(this.save, LOCAL_STORAGE_NAME_AUTOSAVE)
        if (this.summaryObserver)
            this.summaryObserver(formatListSummary(this.save.units.length, total))
    }

    public clear(search: ListSearch) {
        if (!this.setSave) 
            return 
        this.save = this.withSearch([], search)
        this.setSave(this.save)
        this.updateTotal()
    }

    public store(name: string) {
        if (!this.setStoredLists) 
            return
        const listPosition = this.storedLists.indexOf(name)
        if (this.save.units.length > 0) {
            saveByName(this.save, name)
            if (listPosition == -1) {
                this.storedLists = [...this.storedLists, name]
            }
        } else {
            if (listPosition != -1) {
                this.storedLists = this.storedLists.filter(item => item != name)
            }
            removeByName(name)
        }
        this.setStoredLists(this.storedLists)
        saveLists(this.storedLists)
    }

    public load(loadName: string) {
        if (!this.setName || !this.setSave)
            return
        const load = loadByName(loadName)
        if (load.units.length === 0) {
            console.log("Loaded empty list... " + loadName)
            return
        }
        const apply = (save: Save) => {
            this.save = save
            this.setSave?.(save)
            this.setName?.(loadName)
            this.updateTotal()
            this.constraintsObserver?.(save)
        }
        apply(load)
    }

    public exportExternal(name: string, format: string) {
        if (format === "tts") {
            exportTTSString(name, this.save.units)
        }
    }

    public getStoredLists() {
        return this.storedLists
    }

    public toValidateParams(eraId: number | null, factionId: number | null): URLSearchParams {
        const params = searchParamsFromIds(eraId, factionId)
        const unitString = this.save.units.map(su => `${su.skill}:${su.Id}`).join(";")
        params.append(LIST_PARAMETER, unitString)
        return params
    }

    public getSave() {
        return this.save
    }

    public getCurrentListSummary(): string {
        return formatListSummary(this.save.units.length, totalPV(this.save.units))
    }


}

function formatListSummary(count: number, totalPV: number) {
    return `Units: ${count} | PV: ${totalPV}`
}

export const ListBuilderContext = createContext<ListBuilderController>(
    new ListBuilderController(LOCAL_STORAGE_NAME_AUTOSAVE)
)

export function useBuilderContext() {
    return useContext(ListBuilderContext)
}

export function formatDamageString(unit: IUnit, mech: boolean) {
    const brackets = formatDamageBrackets(unit)
    return mech ? `${brackets} | ${unit.BFOverheat}` : brackets
}