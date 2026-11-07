'use client'
import { ReactNode, useEffect } from 'react'

export function useLoadOnPageShow(load: (isCurrent: () => boolean) => void) {
    useEffect(() => {
        let current = true
        const run = () => load(() => current)
        run()
        window.addEventListener('pageshow', run)
        return () => {
            current = false
            window.removeEventListener('pageshow', run)
        }
    }, [load])
}

export function LoadingDots() {
    return <div className="w-full h-full text-center items-center justify-items-center"><span className="loading loading-dots loading-lg"></span></div>
}

export function PrintNotice({ children, action }: { children: ReactNode, action?: { label: string, onClick: () => void } }) {
    if (!action) return <p className="text-center my-6">{children}</p>
    return (
        <div className="text-center my-6">
            <p>{children}</p>
            <button type="button" className="mt-3 print:hidden" onClick={action.onClick}>{action.label}</button>
        </div>
    )
}

export function PrintTitle({ children }: { children: ReactNode }) {
    return (
        <div className="text-center w-full">
            <div>{children}</div>
        </div>
    )
}

export function PrintActions({ children }: { children: ReactNode }) {
    return <div className="w-full mx-auto flex print:hidden">{children}</div>
}
