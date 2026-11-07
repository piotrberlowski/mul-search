'use client'
import { PrintLists, loadPrintLists } from '@/api/unitListApi'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { GroupedCardGallery } from '../cardGallery'
import { LoadingDots, PrintActions, PrintNotice, PrintTitle, useLoadOnPageShow } from '../printPage'

export default function PrintedLists() {
    const router = useRouter()
    const [printLists, setPrintLists] = useState<PrintLists | null>(null)

    useLoadOnPageShow(useCallback(() => setPrintLists(loadPrintLists()), []))

    const title = printLists?.title ?? ''
    useEffect(() => {
        document.title = title ? `AS Lists: ${title}` : 'AS Lists'
    }, [title])

    if (printLists == null) {
        return <LoadingDots />
    }

    if (!printLists.lists.length) {
        return (
            <PrintNotice action={{ label: 'Back', onClick: () => router.back() }}>
                No lists to print yet. Generate sub-lists, select some, then choose Print Lists.
            </PrintNotice>
        )
    }

    return (
        <>
            {title ? <PrintTitle>{title}</PrintTitle> : null}
            <PrintActions>
                <button type="button" className="flex-1 w-1/2" onClick={() => router.back()}>Back</button>
                <button type="button" className="flex-1 w-1/2" onClick={() => window.print()}>Print</button>
            </PrintActions>
            <GroupedCardGallery groups={printLists.lists.map(list => ({ heading: list.header, units: list.units }))} showHeading />
        </>
    )
}
