import { isFailure } from "@/api/result";
import { compareSelectedUnits } from "@/api/shareApi";
import { ISelectedUnit, IUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, WORK_IN_PROGRESS_NAME, defaultBuilderIdentity, exportTTSString, formatDamageBrackets, loadBuilderIdentity, loadByName, parseId, rememberSave, saveBuilderIdentity, saveByName, totalPV, validateStoredListName } from "@/api/unitListApi"
import { saveList, updateList } from "@/app/api/dao/lists"
import { searchParamsFromIds } from "@/app/data";
import { LIST_PARAMETER } from "@/app/(utilities)/validate/result/validation";
import { ChangeListener } from "@/api/commons";
import { createContext, useContext } from "react";

export class ListBuilderController {
    private save: Save;
    private constraints: string;
    private eraId: number | null;
    private factionId: number | null;
    private listName: string;
    private serverKey: string | null;
    private setSave?: ChangeListener<Save>;
    private setName?: ChangeListener<string>;
    private setServerKey?: ChangeListener<string | null>;
    private setTotal?: ChangeListener<number>;
    private summaryObserver?: ChangeListener<string>;
    public constraintsObserver?: ChangeListener<Save>;

    constructor(
        searchConstraints: string,
        autosaveName: string,
        eraId: string | null,
        factionId: string | null,
    ) {
        this.constraints = searchConstraints
        this.eraId = parseId(eraId)
        this.factionId = parseId(factionId)
        const identity = loadBuilderIdentity()
        this.listName = identity.name
        this.serverKey = identity.serverKey
        if (typeof window !== 'undefined') {
            this.save = loadByName(autosaveName)
        } else {
            this.save = {
                units: [],
                constraints: "",
                eraId: null,
                factionId: null,
            }
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
        setServerKey: ChangeListener<string | null>,
    ) {
        this.setSave = setSave
        this.setName = setName
        this.setTotal = setTotal
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
        return rememberSave(this.save, name)
    }

    public overwrite(): Promise<string | null> {
        if (!this.serverKey) return Promise.resolve('This list is not saved yet.')
        const nameError = validateStoredListName(this.listName)
        if (nameError) return Promise.resolve(nameError)
        if (this.save.units.length === 0) return Promise.resolve('Add units before saving.')
        const name = this.listName.trim()
        return updateList(this.serverKey, name, this.save).then(
            result => {
                if (isFailure(result)) return result.error
                this.adoptIdentity(name, this.serverKey)
                return null
            },
            error => {
                console.error(error)
                return 'Could not save the list.'
            },
        )
    }

    public saveAs(name: string): Promise<string | null> {
        const nameError = validateStoredListName(name)
        if (nameError) return Promise.resolve(nameError)
        if (this.save.units.length === 0) return Promise.resolve('Add units before saving.')
        const trimmed = name.trim()
        return saveList(trimmed, this.save).then(
            result => {
                if (isFailure(result)) return result.error
                this.adoptIdentity(trimmed, result.value)
                return null
            },
            error => {
                console.error(error)
                return 'Could not save the list.'
            },
        )
    }

    public exportExternal(name: string, format: string) {
        if (format === "tts") {
            exportTTSString(name, this.save.units)
        }
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