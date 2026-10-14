'use client'

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

export function ValidationWarning({ messages }: { messages: string[] }) {
    if (messages.length === 0) return null

    return (
        <div className="dropdown dropdown-hover dropdown-bottom dropdown-end flex-none">
            <div tabIndex={0} role="button" aria-label="List validation failed" className="inline-flex cursor-pointer !text-warning">
                <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div tabIndex={0} className="dropdown-content z-50 mt-1 w-72 max-h-64 overflow-auto rounded-box border border-warning bg-base-100 p-2 text-left shadow">
                <ul className="list-disc space-y-1 pl-4 text-xs text-error">
                    {messages.map((message, index) => (
                        <li key={index} className="whitespace-normal">{message}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
