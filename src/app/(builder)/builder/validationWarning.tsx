'use client'

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { useRef, useState } from "react"
import { createPortal } from "react-dom"

function ErrorList({ messages }: { messages: string[] }) {
    return (
        <ul className="list-disc space-y-1 pl-4 text-xs text-error">
            {messages.map((message, index) => (
                <li key={index} className="whitespace-normal">{message}</li>
            ))}
        </ul>
    )
}

export function ValidationWarning({ messages }: { messages: string[] }) {
    const anchor = useRef<HTMLDivElement>(null)
    const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null)

    if (messages.length === 0) return null

    function open() {
        clearTimeout(closeTimer.current)
        const rect = anchor.current?.getBoundingClientRect()
        if (!rect) return
        const width = 288
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
        setPosition({ top: rect.bottom + 6, left })
    }

    function scheduleClose() {
        closeTimer.current = setTimeout(() => setPosition(null), 120)
    }

    return (
        <>
            <div
                ref={anchor}
                tabIndex={0}
                role="button"
                aria-label="List validation failed"
                className="inline-flex flex-none cursor-pointer text-warning"
                onMouseEnter={open}
                onMouseLeave={scheduleClose}
                onFocus={open}
                onBlur={scheduleClose}
            >
                <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            {position && createPortal(
                <div
                    className="fixed z-[80] w-72 max-h-64 overflow-auto rounded-md border border-warning bg-base-100 p-2 text-left shadow-lg"
                    style={{ top: position.top, left: position.left }}
                    onMouseEnter={open}
                    onMouseLeave={scheduleClose}
                >
                    <ErrorList messages={messages} />
                </div>,
                document.body,
            )}
        </>
    )
}
