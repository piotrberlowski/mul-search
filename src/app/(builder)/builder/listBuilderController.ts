import { compareSelectedUnits } from "@/api/shareApi";
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, exportTTSString, formatDamageBrackets, loadByName, loadLists, removeByName, saveByName, saveLists, toJeffsUnits, totalPV } from "@/api/unitListApi"
import { IUnit } from "@/api/unitListApi";
import { searchParamsFromIds } from "@/app/data";
import { LIST_PARAMETER } from "@/app/(utilities)/validate/result/validation";
import { resolveListIds } from "@/app/api/dao/listContext";
import { ChangeListener } from "@/api/commons";
import { createContext, useContext } from "react";

function numberOrNull(value: string | null): number | null {
    if (value == null || value === '') return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

export class ListBuilderController {
    private save: Save;
    private constraints: string;
    private eraId: number | null;
    private factionId: number | null;
    private storedLists: string[];
    private setSave?: ChangeListener<Save>;
    private setName?: ChangeListener<string>;
    private setTotal?: ChangeListener<number>;
    private setStoredLists?: ChangeListener<string[]>;
    private summaryObserver?: ChangeListener<string>;
    public constraintsObserver?: ChangeListener<Save>;

    constructor(
        searchConstraints: string,
        autosaveName: string,
        eraId: string | null,
        factionId: string | null,
    ) {
        this.constraints = searchConstraints
        this.eraId = numberOrNull(eraId)
        this.factionId = numberOrNull(factionId)
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

    private searchSave(units: ISelectedUnit[]): Save {
        return {
            units,
            constraints: this.constraints,
            eraId: this.eraId,
            factionId: this.factionId,
        }
    }

    private matchesSearch() {
        if (this.save.units.length === 0) return true
        if (this.save.eraId != null && this.save.factionId != null && this.eraId != null && this.factionId != null) {
            return this.save.eraId === this.eraId && this.save.factionId === this.factionId
        }
        return this.save.constraints === this.constraints
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

    public getConstraints() {
        return this.constraints
    }

    public getUnits() {
        return this.save.units
    }

    public guardedAddUnit(unit: IUnit) {
        if (!this.setSave) 
            return
        if (!this.matchesSearch()) {
            alert(`Cannot add unit. Please clear the list or set your search to: \n ${this.save.constraints} `)
            return
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
        this.save = this.searchSave([...this.save.units, selected].sort(compareSelectedUnits))
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

    public clear() {
        if (!this.setSave) 
            return 
        this.save = this.searchSave([])
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
        if (load.eraId != null && load.factionId != null) {
            apply(load)
            return
        }
        resolveListIds(load.constraints).then((matched) => {
            const save: Save = {
                ...load,
                eraId: matched.eraId,
                factionId: matched.factionId,
                constraints: matched.label ?? load.constraints,
            }
            if (matched.eraId != null && matched.factionId != null) {
                saveByName(save, loadName)
            }
            apply(save)
        }).catch((error) => {
            console.log(error)
            apply(load)
        })
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

    public toValidateParams(): URLSearchParams {
        const params = searchParamsFromIds(this.eraId, this.factionId)
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
    new ListBuilderController('none', LOCAL_STORAGE_NAME_AUTOSAVE, null, null)
)

export function useBuilderContext() {
    return useContext(ListBuilderContext)
}

export function formatDamageString(unit: IUnit, mech: boolean) {
    const brackets = formatDamageBrackets(unit)
    return mech ? `${brackets} | ${unit.BFOverheat}` : brackets
}