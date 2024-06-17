`use server-only`

import { arrayFromPdf } from "./pdf2array"

export interface IParseResult {
    serializedList?: string
    success: boolean
    error?: string
}

function zipLineBreaks(content: string[][]) {
    const output = new Array<string[]>()
    for (var row of content) {
        if (row.length > 1) {
            output.push(row)
        } else if (row.length == 1) {
            //we have a line-broken unit, need to append it to previous line
            const lastIndex = output.length-1
            if (output[lastIndex]) {
                output[lastIndex][0] = `${output[lastIndex][0]} ${row[0]}`
            }
        }
    }
    return output
}

export function serializeContent(content: string[][]): IParseResult {
    if (content.length < 1 || content[0].length < 1) {
        return {
            success: false,
            error: "Empty content!",
        }
    }
    const header = content[0].join()
    if (!header.includes("Master Unit List")) {
        return {
            success: false,
            error: `Header doesn't appear to be MUL: ${header}`
        }
    }
    const table = zipLineBreaks(content.slice(2, -1))
    const unitString = table.map(row => `${row[2]}:${row[0]}`).join(";")
    return {
        success: true,
        serializedList: unitString,
    }
}

export async function parsePdf(pdf: File): Promise<IParseResult> {
    return pdf.arrayBuffer()
        .then( b => arrayFromPdf(b, {pages: [1]}))
        .then(serializeContent)
        .catch(e => {
            return{
                success: false,
                error: `${e}`,
            }
        })
}