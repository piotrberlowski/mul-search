'use client'
import { useSearchParams } from 'next/navigation'
import { MulUnit, compareSelectedUnits, parseShare } from '../../../api/shareApi'
import { ISelectedUnit, IUnit, LOCAL_STORAGE_NAME_AUTOSAVE, currentPV, loadLists, saveByName, saveLists } from '../../../api/unitListApi'
import Image from 'next/image'
import React, { useMemo, useState } from "react"
import { MulUnitLine } from './mulUnitLine'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import Combinations from '../../../components/combinations'
import PlayLink from '@/components/playLink'
import { MASTER_UNIT_LIST } from '../data'

const CARD_WIDTH = 1050
const CARD_HEIGHT = 750

function MemoImage({ ordinal, unit }: { ordinal: number, unit: MulUnit }) {
    const target = new URL(`/Unit/Card/${unit.id}`, MASTER_UNIT_LIST)
    target.searchParams.set("skill", `${unit.skill}`)

    return useMemo(() => (
        <Image
            key={ordinal}
            src={target.toString()}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            alt={`${unit.id}: ${unit.name} @ ${unit.skill}`}
            style={{
                objectFit: 'contain'
            }}
        />
    ), [ordinal, unit])
}

function SaveButton({ target, onClick, ready }: { target: number, onClick: (tweak: boolean) => void, ready: (callback: (len: number) => void) => void }) {
    const [count, setCount] = useState(0)

    if (count >= target) {
        return (
            <div className="w-full mx-auto flex print:hidden">
                <button className="flex-1 w-1/2" onClick={(e) => onClick(true)}>Tweak Now</button>
                <button className="flex-1 w-1/2" onClick={(e) => onClick(false)}>Save to Local Storage</button>
            </div>
        )
    }

    ready((len: number) => setCount(len))

    return (
        <div className="w-full mx-auto text-center border border-solid dark:border-white border-black">List loading...</div>
    )
}

function MulListTable({ units }: { units: ISelectedUnit[] }) {
    return (
        <>
            <div className='grid grid-cols-8 bg-neutral-400 font-bold mx-3 w-full items-left border border-0.5 border-solid border-black'>
                <div className='col-span-3 px-0.5 border border-0.5 bborder-solid border-black'>Unit</div>
                <div className='col-span-2 px-0.5 border border-0.5 bborder-solid border-black'>Type</div>
                <div className='px-0.5 border border-0.5 border-solid border-black'>Skill</div>
                <div className='px-0.5 border border-0.5 border-solid border-black'>PV</div>
                <div className='px-0.5 border border-0.5 border-solid border-black'>Tonnage</div>
            </div>
            <div className='grid grid-cols-8 mx-3 w-full'>
                {
                    units && units.map((u, idx) => (
                        <React.Fragment key={idx}>
                            <div className='col-span-3 px-0.5 border border-0.5 border-solid border-black'>{u.Name}</div>
                            <div className='col-span-2 px-0.5 border border-0.5 border-solid border-black'>{u.Type.Name}</div>
                            <div className='px-0.5 border border-0.5 bborder-solid border-black text-right'>{u.skill}</div>
                            <div className='px-0.5 border border-0.5 bborder-solid border-black text-right'>{currentPV(u)}</div>
                            <div className='px-0.5 border border-0.5 bborder-solid border-black text-right'>{u.Tonnage}</div>
                        </React.Fragment>
                    ))
                }
            </div>
            <div className='grid grid-cols-8 mx-3 w-full items-left border border-0.5 border-solid border-black'>
                <div className='col-span-3 px-0.5 font-bold border border-0.5 border-solid border-black bg-neutral-400'>{units.length} unit{units.length != 1 ? 's':''}</div>
                <div className='col-span-2 px-0.5 border border-0.5 border-solid border-black bg-neutral-400'/>
                <div className='px-0.5 border border-0.5 border-solid border-black bg-neutral-400'/>
                <div className='px-0.5 border border-0.5 border-solid border-black text-right'>{units && units.reduce((v, u) => v + currentPV(u), 0)}</div>
                <div className='px-0.5 border border-0.5 border-solid border-black text-right'>{units && units.reduce((v, u) => v + u.Tonnage, 0)}</div>
            </div>
        </>
    )
}

export default function VisualList() {
    const [ready, setReady] = useState(false)
    const router = useRouter()
    const params = useSearchParams()

    const listString = params.get('list')
    const constraints = params.get('constraints') ?? "legacy"
    const parsed = parseShare(listString || 'empty;')

    const fetchedList = new Array<ISelectedUnit>()
    let saveButtonFeed = (len: number) => { }
    let combinationsFeed = (len: number) => { }

    function onFetch(u: ISelectedUnit) {
        if (!fetchedList.find(x => x.ordinal == u.ordinal)) {
            fetchedList.push(u)
        }
        fetchedList.sort(compareSelectedUnits)
        setReady(fetchedList.length == parsed.units.length)
        saveButtonFeed(fetchedList.length)
        combinationsFeed(fetchedList.length)
    }

    function saveButtonReady(feed: (len: number) => void) {
        saveButtonFeed = feed
    }

    function saveList(tweak: boolean) {
        const save = {
            units: fetchedList,
            constraints: constraints,
        }
        if (tweak) {
            saveByName(save, LOCAL_STORAGE_NAME_AUTOSAVE)
            router.push("/?builder=_")
        } else {
            const name = `imported-${parsed.name}`
            const lists = loadLists()
            saveByName(save, name)
            if (!lists.find(item => item == name)) {
                lists.push(name)
                saveLists(lists)
            }
        }
    }

    return (
        <>
            <Head>
                <title>{`AS: ${parsed.name}`}</title>
                <meta property="og:title" content={`AS: ${parsed.name}`} key="title" />
                <meta property="og:description" content={`Alpha Strike list shared via AS Builder`} key="description" />
            </Head>
            <div className='text-center w-full'>
                <div>{constraints} : {parsed.name}</div>
            </div>
            <SaveButton target={parsed.units.length} onClick={saveList} ready={saveButtonReady} />
            <div className='text-center w-full print:hidden'>
                <button className="w-full" onClick={(e) => window.print()}>Print</button>
            </div>
            <div className='print:mx-3'>
                {
                    parsed.units.map((u, idx) => (
                        <MulUnitLine key={idx} ordinal={idx} mulUnit={u} onFetch={onFetch} />
                    ))
                }
            </div>
            <div className='w-full text-center my-2' style={{ pageBreakAfter: "always" }}>Total PV: {parsed.total}</div>
            <div className='hidden print:block print:mx-3' style={{ pageBreakAfter: "always" }}>
                <MulListTable units={fetchedList} />
            </div>
            <div className={`bg-inherit w-full grid grid-cols-2 text-center ${ready ? '' : 'hidden'} print:hidden`}>
                <div className='bg-inherit'>
                    <Combinations units={fetchedList} />
                </div>
                <div>
                    <PlayLink units={fetchedList} className='w-full h-full button-link block'>Play This!</PlayLink>
                </div>
            </div>
            <div className='grid grid-cols-2 gap-0.5 max-w-fit mx-auto'>
                {
                    parsed.units.map((u, idx) => (
                        <div key={idx} className="max-w-fit print:w-[437px] print:[h-313]">
                            <MemoImage unit={u} ordinal={idx} />
                        </div>
                    ))
                }
            </div>
        </>
    )
}
