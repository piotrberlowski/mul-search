import { compareSelectedUnits } from "@/api/shareApi";
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, WORK_IN_PROGRESS_NAME, defaultBuilderIdentity, exportTTSString, formatDamageBrackets, loadBuilderIdentity, loadByName, loadLists, removeByName, saveBuilderIdentity, saveByName, saveLists, totalPV, validateStoredListName } from "@/api/unitListApi"
import { saveList, updateList } from "@/app/api/dao/lists"
import { IUnit } from "@/api/unitListApi";
import { searchParamsFromIds } from "@/app/data";
import { LIST_PARAMETER } from "@/app/(utilities)/validate/result/validation";
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
    private listName: string;
    private serverKey: string | null;
    private setSave?: ChangeListener<Save>;
    private setName?: ChangeListener<string>;
    private setServerKey?: ChangeListener<string | null>;
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
        const identity = loadBuilderIdentity()
        this.listName = identity.name
        this.serverKey = identity.serverKey
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

    private adoptIdentity(name: string, serverKey: string | null) {
        this.listName = name
        this.serverKey = serverKey
        saveBuilderIdentity(serverKey ? { name, serverKey } : defaultBuilderIdentity())
        this.setName?.(this.listName)
        this.setServerKey?.(this.serverKey)
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
        return this.save.eraId === this.eraId && this.save.factionId === this.factionId
    }

    public registerBuilder(
        setSave: ChangeListener<Save>,
        setName: ChangeListener<string>,
        setTotal: ChangeListener<number>,
        setStoredLists: ChangeListener<string[]>,
        setServerKey: ChangeListener<string | null>,
    ) {
        this.setSave = setSave
        this.setName = setName
        this.setTotal = setTotal
        this.setStoredLists = setStoredLists
        this.setServerKey = setServerKey
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

    public getEraId() {
        return this.eraId
    }

    public getFactionId() {
        return this.factionId
    }

    public getUnits() {
        return this.save.units
    }

    public guardedAddUnit(unit: IUnit) {
        if (!this.setSave) 
            return
        if (!this.matchesSearch()) {
            const target = this.save.eraId == null || this.save.factionId == null
                ? 'This list has no era or faction. Clear the list first.'
                : `Please clear the list or set your search to:\n${this.save.constraints}`
            alert(`Cannot add unit. ${target}`)
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
        this.adoptIdentity(WORK_IN_PROGRESS_NAME, null)
        this.updateTotal()
    }

    public rename(name: string) {
        if (!this.serverKey) return
        this.listName = name
        saveBuilderIdentity({ name, serverKey: this.serverKey })
        this.setName?.(name)
    }

    public getListName() {
        return this.serverKey ? this.listName : WORK_IN_PROGRESS_NAME
    }

    public getServerKey() {
        return this.serverKey
    }

    public remember(name: string): string | null {
        const nameError = validateStoredListName(name)
        if (nameError) return nameError
        if (this.save.units.length === 0) return 'Add units before remembering a list.'
        this.store(name.trim())
        return null
    }

    public async overwrite(): Promise<string | null> {
        if (!this.serverKey) return 'This list is not saved yet.'
        const nameError = validateStoredListName(this.listName)
        if (nameError) return nameError
        if (this.save.units.length === 0) return 'Add units before saving.'
        try {
            const error = await updateList(this.serverKey, this.listName.trim(), this.save)
            if (!error) this.adoptIdentity(this.listName.trim(), this.serverKey)
            return error
        } catch (e) {
            console.error(e)
            return 'Could not save the list.'
        }
    }

    public async saveAs(name: string): Promise<string | null> {
        const nameError = validateStoredListName(name)
        if (nameError) return nameError
        if (this.save.units.length === 0) return 'Add units before saving.'
        try {
            const result = await saveList(name.trim(), this.save)
            if ('error' in result) return result.error
            this.adoptIdentity(name.trim(), result.key)
            return null
        } catch (e) {
            console.error(e)
            return 'Could not save the list.'
        }
    }

    public store(name: string) {
        const trimmed = name.trim()
        const listPosition = this.storedLists.indexOf(trimmed)
        if (this.save.units.length > 0) {
            saveByName(this.save, trimmed)
            if (listPosition == -1) {
                this.storedLists = [...this.storedLists, trimmed]
            }
        } else {
            if (listPosition != -1) {
                this.storedLists = this.storedLists.filter(item => item != trimmed)
            }
            removeByName(trimmed)
        }
        this.setStoredLists?.(this.storedLists)
        saveLists(this.storedLists)
    }

    public load(loadName: string) {
        if (!this.setSave)
            return
        const load = loadByName(loadName)
        if (load.units.length === 0) {
            console.log("Loaded empty list... " + loadName)
            return
        }
        this.save = load
        this.setSave(load)
        this.adoptIdentity(WORK_IN_PROGRESS_NAME, null)
        this.updateTotal()
        this.constraintsObserver?.(load)
    }

    public exportExternal(name: string, format: string) {
        if (format === "tts") {
            exportTTSString(name, this.save.units)
        }
    }

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