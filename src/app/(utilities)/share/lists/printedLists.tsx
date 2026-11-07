'use client'
import { PrintLists, loadPrintLists } from '@/api/unitListApi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GroupedCardGallery } from '../cardGallery'

type Loaded = { kind: 'ready', printLists: PrintLists } | { kind: 'error', message: string }

export default function PrintedLists() {
    const router = useRouter()
    const [loaded, setLoaded] = useState<Loaded | null>(null)

    useEffect(() => {
        const load = () => {
            try {
                setLoaded({ kind: 'ready', printLists: loadPrintLists() })
            } catch (error) {
                console.error(error)
                setLoaded({ kind: 'error', message: 'Could not read the lists on this device.' })
            }
        }
        load()
        window.addEventListener('pageshow', load)
        return () => window.removeEventListener('pageshow', load)
    }, [])

    const title = loaded?.kind === 'ready' ? loaded.printLists.title : ''
    useEffect(() => {
        document.title = title ? `AS Lists: ${title}` : 'AS Lists'
    }, [title])

    if (loaded == null) {
        return <div className="w-full h-full text-center items-center justify-items-center"><span className="loading loading-dots loading-lg"></span></div>
    }
    if (loaded.kind === 'error') {
        return <p className="text-center my-6">{loaded.message}</p>
    }

    const { lists } = loaded.printLists
    if (!lists.length) {
        return (
            <div className="text-center my-6">
                <p>No lists to print yet. Generate sub-lists, select some, then choose Print Lists.</p>
                <button type="button" className="mt-3 print:hidden" onClick={() => router.back()}>Back</button>
            </div>
        )
    }

    return (
        <>
            {title ? (
                <div className="text-center w-full">
                    <div>{title}</div>
                </div>
            ) : null}
            <div className="w-full mx-auto flex print:hidden">
                <button type="button" className="flex-1 w-1/2" onClick={() => router.back()}>Back</button>
                <button type="button" className="flex-1 w-1/2" onClick={() => window.print()}>Print</button>
            </div>
            <GroupedCardGallery groups={lists.map(list => ({ heading: list.header, units: list.units }))} showHeading />
        </>
    )
}
