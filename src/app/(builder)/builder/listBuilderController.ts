import { compareSelectedUnits } from "../../../api/shareApi";
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, exportTTSString, loadByName, removeByName, saveByName, saveLists, toJeffsUnits, totalPV } from "../../../api/unitListApi"
import { IUnit } from "../../../api/unitListApi";

export type ChangeListener<T> = (newState: T) => void

export class ListBuilderController {

    private save: Save;
    private constraints: string;
    private storedLists: string[]
    private setSave: ChangeListener<Save>;
    private setTotal: ChangeListener<number>;
    private setStoredLists: ChangeListener<string[]>;
    private selectedSet: Set<number> = new Set()
    private notifySelectionChanged?: ChangeListener<ISelectedUnit[]>

    constructor(
        initialSave: Save,
        searchConstraints: string,
        storedLists: string[],
        selected: ISelectedUnit[],
        setSave: ChangeListener<Save>, 
        setTotal: ChangeListener<number>,
        setStoredLists: ChangeListener<string[]>,
        ) {
        this.save = initialSave
        this.constraints = searchConstraints
        this.storedLists = storedLists
        this.setSave = setSave
        this.setTotal = setTotal
        this.setStoredLists = setStoredLists
    }

    public getConstraints() {
        return this.constraints
    }

    public getUnits() {
        return this.save.units
    }

    public setSelectionHandler(handler: ChangeListener<ISelectedUnit[]>) {
        this.notifySelectionChanged = handler
    }

    public addUnit(unit: IUnit) {
        const isEmpty = this.save.units.length == 0
        const ord = (isEmpty) ? 0 : Math.max(...this.save.units.map(u => u.ordinal)) + 1
        const selected = {
            ordinal: ord,
            skill: 4,
            ...unit
        }
        this.save  = {
            units: [...this.save.units, selected].sort(compareSelectedUnits),
            constraints: this.constraints,
        }
        this.setSave(this.save)
        this.updateTotal()
    }

    public removeUnit(ord: number) {
        this.save = {
            units: this.save.units.filter(u => u.ordinal != ord),
            constraints: this.save.constraints,
        }
        this.setSave(this.save)
        this.updateTotal()
    }

    public updateTotal() {
        this.setTotal(totalPV(this.save.units))
        saveByName(this.save, LOCAL_STORAGE_NAME_AUTOSAVE)
    }

    public clear() {
        this.save = {
            units: [],
            constraints: this.constraints,
        }
        this.setSave(this.save)
        this.updateTotal()
    }

    public store(name: string) {
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

    public setSelected(unit: ISelectedUnit, selected: boolean) {
        if (selected) {
            this.selectedSet.add(unit.ordinal)
            console.log(`Selected unit ${unit.ordinal} - selected values ${[...this.selectedSet.values()].join(',')}`)
        } else {
            this.selectedSet.delete(unit.ordinal)
            console.log(`Removed unit ${unit.ordinal} - selected values ${this.selectedSet}`)
        }
        this.notifySelectionChanged && this.notifySelectionChanged(this.save.units.filter(u => this.selectedSet.has(u.ordinal)))
    }

    public load(loadName: string) {
        const load = loadByName(loadName)
        if (load.units.length > 0) {
            this.save = load
            this.setSave(load)
            this.updateTotal()
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

}
