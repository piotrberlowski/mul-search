export interface ForceListEntry {
    id: string
    skill: number
}

export interface ForceFileResult {
    entries?: ForceListEntry[]
    success: boolean
    error?: string
}

const FORMAT = "mul-force"
const VERSION = 1
const MAX_VERSION = VERSION
export const MUL_DEFAULT_PILOTING = 5

export interface ForceUnit {
    Id: string
    skill: number
}

export function buildForceFile(units: ForceUnit[], name: string) {
    return {
        format: FORMAT,
        v: VERSION,
        savedAt: new Date().toISOString(),
        state: {
            name,
            units: units.map((unit, index) => ({
                iid: index + 1,
                uid: unit.Id,
                gunnery: unit.skill,
                piloting: MUL_DEFAULT_PILOTING,
                customName: null,
                c3net: null,
            })),
            networks: [] as [],
            customCards: [] as [],
        },
    }
}

export function forceFileName(name: string) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    return slug ? `mul-force-${slug}-${date}.json` : `mul-force-${date}.json`
}

export function parseForceFile(text: string): ForceFileResult {
    let data: unknown
    try {
        data = JSON.parse(text)
    } catch {
        return { success: false, error: "That file is not valid JSON, so it cannot be read as a force." }
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return { success: false, error: "That is not a Master Unit List force file." }
    }
    const file = data as { format?: unknown, v?: unknown, state?: { units?: unknown } }
    if (file.format !== FORMAT) {
        return { success: false, error: "That is not a Master Unit List force file." }
    }
    const version = Number(file.v)
    if (!Number.isFinite(version)) {
        return { success: false, error: "That force file has no version number, so it cannot be read safely." }
    }
    if (version > MAX_VERSION) {
        return { success: false, error: "This force was saved by a newer version of the Master Unit List." }
    }
    if (!file.state || !Array.isArray(file.state.units)) {
        return { success: false, error: "That force file does not contain a force." }
    }
    const entries: ForceListEntry[] = []
    for (const unit of file.state.units) {
        if (!unit || typeof unit !== "object") {
            return { success: false, error: "That force file contains a unit that cannot be read." }
        }
        const row = unit as { uid?: unknown, gunnery?: unknown }
        const id = typeof row.uid === "string" ? row.uid.trim() : ""
        const skill = Number(row.gunnery)
        if (!id || !Number.isInteger(skill)) {
            return { success: false, error: "That force file contains a unit without an id or gunnery skill." }
        }
        entries.push({ id, skill })
    }
    if (!entries.length) {
        return { success: false, error: "That force file has no units." }
    }
    return { success: true, entries }
}
