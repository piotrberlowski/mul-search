import { compareSelectedUnits } from "@/api/shareApi";
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, currentPV, exportTTSString, loadByName, loadLists, removeByName, saveByName, saveLists, toJeffsUnits, totalPV } from "@/api/unitListApi"
import { IUnit } from "@/api/unitListApi";
import { Factions, parseConstraints } from "@/app/data";
import { LIST_PARAMETER } from "@/app/(utilities)/validate/result/validation";
import { ChangeListener } from "@/api/commons";
import { Dispatch, SetStateAction, createContext, useContext } from "react";

export class ListBuilderController {
    private save: Save;
    private constraints: string;
    private storedLists: string[];
    private setSave?: ChangeListener<Save>;
    private setName?: ChangeListener<string>;
    private setTotal?: ChangeListener<number>;
    private setStoredLists?: ChangeListener<string[]>;
    private summaryObserver?: ChangeListener<string>;
    private constraintsObserver?: ChangeListener<string>;

    constructor(
        searchConstraints: string,
        autosaveName: string,
    ) {
        this.constraints = searchConstraints
        if (typeof window !== 'undefined') {
            this.save = loadByName(autosaveName)
            this.storedLists = loadLists()
        } else {
            this.save = {
                units: [],
                constraints: ""
            }
            this.storedLists = []
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

    public registerConstraintsObserver(setConstraints: ChangeListener<string>) {
        this.constraintsObserver = setConstraints
    }


    public getConstraints() {
        return this.constraints
    }

    public getUnits() {
        return this.save.units
    }

    public guardedAddUnit(unit: IUnit) {
        if (!this.setSave) 
            return
        if (this.save.constraints != this.constraints) {
            if (this.save.units.length == 0) {
                this.setSave(
                    {
                        ...this.save,
                        constraints: this.constraints,
                    }
                )
            } else {
                alert(`Cannot add unit. Please clear the list or set your search to: \n ${this.constraints} `)
                return
            }
        }
        this.addUnit(unit)
    }

    private addUnit(unit: IUnit) {
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
        this.save = {
            units: [...this.save.units, selected].sort(compareSelectedUnits),
            constraints: this.constraints,
        }
        this.setSave(this.save)
        this.updateTotal()
    }

    public removeUnit(ord: number) {
        if (!this.setSave) 
            return 
        this.save = {
            units: this.save.units.filter(u => u.ordinal != ord),
            constraints: this.save.constraints,
        }
        this.setSave(this.save)
        this.updateTotal()
    }


    public updateTotal() {
        if (!this.setSave || !this.setTotal) 
            return 
        this.save = {
            units: this.save.units.sort(compareSelectedUnits),
            constraints: this.constraints,
        }
        this.setSave(this.save)
        const total = totalPV(this.save.units)
        this.setTotal(total)
        saveByName(this.save, LOCAL_STORAGE_NAME_AUTOSAVE)
        if (this.summaryObserver)
            this.summaryObserver(formatListSummary(this.save.units.length, total))
    }

    public clear() {
        if (!this.setSave) 
            return 
        this.save = {
            units: [],
            constraints: this.constraints,
        }
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
        if (load.units.length > 0) {
            this.save = load
            this.setSave(load)
            this.setName(loadName)
            this.updateTotal()
            if (this.constraintsObserver) {
                this.constraintsObserver(load.constraints)
            }
        } else {
            console.log("Loaded empty list... " + loadName)
        }
    }

    public exportExternal(name: string, format: string) {
        switch (format) {
            case "jeff":
                this.exportJeffsJson(`${name}`, this.save.units)
                break
            case "tts":
                exportTTSString(name, this.save.units)
                break
        }
    }

    public exportJeffsJson(name: string, units: ISelectedUnit[]) {
        const data = {
            name: name,
            members: toJeffsUnits(units),
            lastUpdated: new Date().toISOString(),
            formationBonus: "None",
            groupLabel: "Star"
        }

        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(data)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "list.json";

        link.click();
    };

    public getStoredLists() {
        return this.storedLists
    }

    public toValidateParams(factions: Factions): URLSearchParams {
        const params = parseConstraints(this.constraints, factions)
        const unitString = this.save.units.map(su => `${su.skill}:${su.Name}`).join(";")
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
    new ListBuilderController('none', LOCAL_STORAGE_NAME_AUTOSAVE)
)

export function useBuilderContext() {
    return useContext(ListBuilderContext)
}
