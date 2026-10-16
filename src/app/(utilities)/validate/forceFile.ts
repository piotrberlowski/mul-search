export const MUL_DEFAULT_PILOTING = 5

const FORMAT = "mul-force"
const VERSION = 1

export interface MulForceUnit {
    iid: number
    uid: string
    gunnery: number
    piloting: number
    customName: string | null
    c3net: number | null
}

export interface MulForceNetwork {
    id: number
    type: string
    label: string
}

export interface MulCustomCard {
    id: number
    type: string
    fields: Record<string, unknown>
    variant?: string
}

export interface MulForceState {
    name: string
    units: MulForceUnit[]
    networks: MulForceNetwork[]
    customCards: MulCustomCard[]
}

export interface MulForceFile {
    format: typeof FORMAT
    v: number
    savedAt: string
    state: MulForceState
}

export interface MulCardUnit {
    unit_id: string
    gunnery: number
    piloting: number
    custom_name: string | null
    c3net: number | null
}

export interface MulCardRequest {
    format: "as"
    units: MulCardUnit[]
    networks: MulForceNetwork[]
    custom_cards: MulCustomCard[]
}

export interface ForceFileResult {
    file?: MulForceFile
    success: boolean
    error?: string
}

export function buildForceFile(units: { Id: string, skill: number }[], name: string): MulForceFile {
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
            networks: [],
            customCards: [],
        },
    }
}

export function asCardRequest(file: MulForceFile): MulCardRequest {
    return {
        format: "as",
        units: file.state.units.map((unit) => ({
            unit_id: unit.uid,
            gunnery: unit.gunnery,
            piloting: unit.piloting,
            custom_name: unit.customName,
            c3net: unit.c3net,
        })),
        networks: file.state.networks,
        custom_cards: file.state.customCards,
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
    if (!isRecord(data) || data.format !== FORMAT) {
        return { success: false, error: "That is not a Master Unit List force file." }
    }
    const version = Number(data.v)
    if (!Number.isFinite(version)) {
        return { success: false, error: "That force file has no version number, so it cannot be read safely." }
    }
    if (version > VERSION) {
        return { success: false, error: "This force was saved by a newer version of the Master Unit List." }
    }
    if (!isRecord(data.state) || !Array.isArray(data.state.units)) {
        return { success: false, error: "That force file does not contain a force." }
    }
    const units: MulForceUnit[] = []
    for (const [index, unit] of data.state.units.entries()) {
        const parsed = parseUnit(unit, index)
        if (!parsed) {
            return { success: false, error: "That force file contains a unit without an id or gunnery skill." }
        }
        units.push(parsed)
    }
    if (!units.length) {
        return { success: false, error: "That force file has no units." }
    }
    return {
        success: true,
        file: {
            format: FORMAT,
            v: version,
            savedAt: typeof data.savedAt === "string" ? data.savedAt : "",
            state: {
                name: typeof data.state.name === "string" ? data.state.name : "",
                units,
                networks: parseNetworks(data.state.networks),
                customCards: parseCustomCards(data.state.customCards),
            },
        },
    }
}

function parseUnit(value: unknown, index: number): MulForceUnit | null {
    if (!isRecord(value)) return null
    const uid = typeof value.uid === "string" ? value.uid.trim() : ""
    const gunnery = Number(value.gunnery)
    if (!uid || !Number.isInteger(gunnery)) return null
    const iid = Number(value.iid)
    const piloting = Number(value.piloting)
    const c3net = Number(value.c3net)
    return {
        iid: Number.isInteger(iid) && iid > 0 ? iid : index + 1,
        uid,
        gunnery,
        piloting: Number.isInteger(piloting) ? piloting : MUL_DEFAULT_PILOTING,
        customName: typeof value.customName === "string" ? value.customName : null,
        c3net: Number.isInteger(c3net) ? c3net : null,
    }
}

function parseNetworks(value: unknown): MulForceNetwork[] {
    if (!Array.isArray(value)) return []
    return value.flatMap((network) => {
        if (!isRecord(network) || typeof network.type !== "string" || typeof network.label !== "string") return []
        const id = Number(network.id)
        return Number.isInteger(id) ? [{ id, type: network.type, label: network.label }] : []
    })
}

function parseCustomCards(value: unknown): MulCustomCard[] {
    if (!Array.isArray(value)) return []
    return value.flatMap((card) => {
        if (!isRecord(card) || typeof card.type !== "string" || !isRecord(card.fields)) return []
        const id = Number(card.id)
        if (!Number.isInteger(id)) return []
        const parsed: MulCustomCard = { id, type: card.type, fields: card.fields }
        if (typeof card.variant === "string") parsed.variant = card.variant
        return [parsed]
    })
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === "object" && !Array.isArray(value)
}
