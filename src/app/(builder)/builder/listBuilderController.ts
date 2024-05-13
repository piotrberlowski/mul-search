import { compareSelectedUnits } from "@/api/shareApi";
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, currentPV, exportTTSString, loadByName, removeByName, saveByName, saveLists, toJeffsUnits, totalPV } from "@/api/unitListApi"
import { IUnit } from "@/api/unitListApi";
import { Factions, parseConstraints } from "../data";
import { LIST_PARAMETER } from "../validate/result/validation";
import { ChangeListener } from "@/api/commons";

export class ListBuilderController {
    
    private save: Save;
    private constraints: string;
    private storedLists: string[]
    private setSave: ChangeListener<Save>;
    private setName: ChangeListener<string>;
    private setTotal: ChangeListener<number>;
    private setStoredLists: ChangeListener<string[]>;
    
    constructor(
        initialSave: Save,
        searchConstraints: string,
        storedLists: string[],
        setSave: ChangeListener<Save>, 
        setName: ChangeListener<string>,
        setTotal: ChangeListener<number>,
        setStoredLists: ChangeListener<string[]>,
        ) {
            this.save = initialSave
            this.constraints = searchConstraints
            this.storedLists = storedLists
            this.setSave = setSave
            this.setName = setName
            this.setTotal = setTotal
            this.setStoredLists = setStoredLists
        }
        
        public getConstraints() {
            return this.constraints
        }
        
        public getUnits() {
            return this.save.units
        }
        
        public addUnit(unit: IUnit) {
            const isEmpty = this.save.units.length == 0
            const ord = (isEmpty) ? 0 : Math.max(...this.save.units.map(u => u.ordinal)) + 1
            const selected = {
                ordinal: ord,
                skill: 4,
                lance: '',
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
        this.save  = {
            units: this.save.units.sort(compareSelectedUnits),
            constraints: this.constraints,
        }
        this.setSave(this.save)
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

    public load(loadName: string) {
        const load = loadByName(loadName)
        if (load.units.length > 0) {
            this.save = load
            this.setSave(load)
            this.setName(loadName)
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

    public toValidateParams(factions: Factions): URLSearchParams {
        const params = parseConstraints(this.constraints, factions)
        const unitString = this.save.units.map(su => `${su.skill}:${su.Name}`).join(";")
        params.append(LIST_PARAMETER, unitString)
        return params
    }
    

}
