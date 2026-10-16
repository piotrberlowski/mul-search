import { MUL_ORIGIN } from "../../../../lib/mul/types"
import { asCardRequest, buildForceFile, forceFileName } from "./forceFile"

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadForceFile(units: { Id: string, skill: number }[], name: string) {
    const file = buildForceFile(units, name)
    downloadBlob(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }), forceFileName(name))
}

export async function downloadAsCards(units: { Id: string, skill: number }[], name: string) {
    const file = buildForceFile(units, name)
    const tokenResponse = await fetch(`${MUL_ORIGIN}/api/forces/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: "{}",
    })
    if (!tokenResponse.ok) {
        throw new Error("Master Unit List did not allow a card export.")
    }
    const tokenBody = await tokenResponse.json() as { token?: unknown }
    if (typeof tokenBody.token !== "string") {
        throw new Error("Master Unit List did not allow a card export.")
    }
    const pdfResponse = await fetch(`${MUL_ORIGIN}/api/forces/pdf`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
            "X-Export-Token": tokenBody.token,
        },
        body: JSON.stringify(asCardRequest(file)),
    })
    if (!pdfResponse.ok) {
        throw new Error(`Card export failed (${pdfResponse.status}).`)
    }
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    downloadBlob(await pdfResponse.blob(), slug ? `mul-as-cards-${slug}-${date}.pdf` : `mul-as-cards-${date}.pdf`)
}
