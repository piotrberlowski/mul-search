'use client'

import { copyShareLink, shareUrl } from '@/api/shareApi'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { createPortal } from 'react-dom'

type CopyResult = {
    url: string
    error: string | null
}

export default function useCopiedLinkDialog() {
    const [result, setResult] = useState<CopyResult | null>(null)

    function showCopiedLink(href: string) {
        const url = shareUrl(href)
        return copyShareLink(href).then(error => setResult({ url, error }))
    }

    const panel = result ? (
        <div
            className="fixed z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(32rem,calc(100%-1.5rem))] p-2 pr-7 text-left text-xs print:hidden border border-[var(--input-border-color)] bg-[rgb(var(--background-start-rgb))] text-[rgb(var(--foreground-rgb))]"
            role={result.error ? 'alert' : 'status'}
        >
            <button type="button" className="absolute top-1 right-1 !m-0 !w-auto !p-0.5" onClick={() => setResult(null)} aria-label="Close">
                <XMarkIcon className="h-3 w-3" />
            </button>
            <p className={result.error ? 'text-error' : ''}>{result.error ?? 'Link copied.'}</p>
            <p className="mt-1 break-all px-1.5 py-1 text-left border border-[var(--input-border-color)] bg-[rgb(var(--input-background-rgb))] text-[rgb(var(--input-foreground-rgb))]">{result.url}</p>
        </div>
    ) : null
    const dialog = panel && typeof document !== 'undefined' ? createPortal(panel, document.body) : null

    return [showCopiedLink, dialog] as const
}
