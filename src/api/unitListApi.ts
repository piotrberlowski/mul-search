export const LOCAL_STORAGE_NAME_AUTOSAVE = 'autosave'
const LOCAL_STORAGE_KEY = 'alphaStrikeLists'
const LOCAL_STORAGE_LIST_KEY_PREFIX = 'alphaStrikeList_'
const LOCAL_STORAGE_CONSTRAINT_KEY_PREFIX = 'alphaStrikeList_constraint_'
const LOCAL_STORAGE_ERA_KEY_PREFIX = 'alphaStrikeList_era_'
const LOCAL_STORAGE_FACTION_KEY_PREFIX = 'alphaStrikeList_faction_'
const LOCAL_STORAGE_TTS = 'alphaStrikeTTS'

export interface ILanced {
    lance?: string
}

export interface IRole {
    Name: string,
}

export interface IType {
    Id: number,
    Name: string,
}

export interface IUnit {
    Id: string,
    Name: string,
    Type: IType,
    Role: IRole,
    Rules: string,
    Class: string,
    Variant: string,
    ImageUrl: string,
    slug?: string | null,
    cardUrl?: string | null,
    BFDamageShort: number,
    BFDamageMedium: number,
    BFDamageLong: number,
    dmgS?: string | null,
    dmgM?: string | null,
    dmgL?: string | null,
    BFMove: string,
    BFPointValue: number,
    BFArmor: number,
    BFStructure: number,
    BFAbilities: string,
    BFTMM: number,
    BFOverheat: number,
    BFSize: number,
    BFThreshold: number,
    BFType: string,
    Tonnage: number,
}

export type AddUnitCallback = (unit: IUnit) => void

export type Save = {
    units: ISelectedUnit[],
    constraints: string,
    eraId: number | null,
    factionId: number | null,
}

export function damageBracket(text: string | null | undefined, value: number) {
    return text != null && text !== '' ? text : String(value)
}

export function formatDamageBrackets(unit: IUnit) {
    return [
        damageBracket(unit.dmgS, unit.BFDamageShort),
        damageBracket(unit.dmgM, unit.BFDamageMedium),
        damageBracket(unit.dmgL, unit.BFDamageLong),
    ].join('/')
}

export interface ISelectedUnit extends IUnit, ILanced {
    ordinal: number,
    skill: number,
}

export interface PvEntity {
    skill: number,
    BFPointValue: number,
}

export function currentPV(unit: PvEntity) {
    const levels = 4 - unit.skill
    const multiplier = (levels > 0) ? 0.2 : 0.1
    const adjustment = (Math.round(unit.BFPointValue * multiplier) || 1) * levels
    return Math.max(unit.BFPointValue + adjustment, 1)
}

export function totalPV(units: PvEntity[]): number {
    return units.map(u => currentPV(u)).reduce((p, n) => p + n, 0)
}

export function loadLists(): string[] {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]")
}

export function saveLists(lists: string[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists))
}

export function compactOrdinals(units: ISelectedUnit[]) {
    units.forEach((u, idx) => u.ordinal = idx)
}

export function groupByLance<T extends ILanced>(units: T[]) {
    return units.reduce((acc, value) => {
        acc.get(value.lance || '')?.push(value) || acc.set(value.lance, [value]);
        return acc;
    }, new Map<string | undefined, T[]>());
}

function updateDefaultLance(units: ISelectedUnit[]) {
    units.forEach(u => u.lance ||= '')
}

function readStoredId(key: string): number | null {
    const raw = localStorage.getItem(key)
    if (raw == null || raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
}

function writeStoredId(key: string, id: number | null) {
    if (id == null) {
        localStorage.removeItem(key)
        return
    }
    localStorage.setItem(key, String(id))
}

export function loadByName(name: string): Save {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const result = localStorage.getItem(listKey)
    const units = JSON.parse(result || "[]")
    compactOrdinals(units)
    updateDefaultLance(units)
    const constraintKey = LOCAL_STORAGE_CONSTRAINT_KEY_PREFIX + name
    const constraints = localStorage.getItem(constraintKey) ?? "legacy"

    return {
        units: units,
        constraints: constraints,
        eraId: readStoredId(LOCAL_STORAGE_ERA_KEY_PREFIX + name),
        factionId: readStoredId(LOCAL_STORAGE_FACTION_KEY_PREFIX + name),
    }
}

export function saveByName(save: Save, name: string) {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const constraintKey = LOCAL_STORAGE_CONSTRAINT_KEY_PREFIX + name
    const unitList = JSON.stringify(save.units)
    localStorage.setItem(listKey, unitList)
    localStorage.setItem(constraintKey, save.constraints)
    writeStoredId(LOCAL_STORAGE_ERA_KEY_PREFIX + name, save.eraId)
    writeStoredId(LOCAL_STORAGE_FACTION_KEY_PREFIX + name, save.factionId)
}

export function removeByName(name: string) {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const constraintKey = LOCAL_STORAGE_CONSTRAINT_KEY_PREFIX + name
    localStorage.removeItem(listKey)
    localStorage.removeItem(constraintKey)
    localStorage.removeItem(LOCAL_STORAGE_ERA_KEY_PREFIX + name)
    localStorage.removeItem(LOCAL_STORAGE_FACTION_KEY_PREFIX + name)
}

function storeTTSString(tts: string) {
    localStorage.setItem(LOCAL_STORAGE_TTS, tts)
}

export function loadTTSString(): string {
    const data = localStorage.getItem(LOCAL_STORAGE_TTS)
    if (!data) {
        return ''
    }
    return data
}

export function exportTTSString(name: string, units: ISelectedUnit[]) {
    const ttsUnits = units.map(u => `{${u.Id},${u.skill}}`).join(',')
    storeTTSString(`{${ttsUnits}}`)
}
