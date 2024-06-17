import { ISelectedUnit, currentPV, groupByLance } from "@/api/unitListApi"
import Image from "next/image"
import React, { useMemo } from "react"
import { MASTER_UNIT_LIST } from "@/app/data"

const CARD_WIDTH = 1050
const CARD_HEIGHT = 750

function MemoImage({ ordinal, unit }: { ordinal: number, unit: ISelectedUnit }) {
    const memoTarget = useMemo(() => {
        const target = new URL(`/Unit/Card/${unit.Id}`, MASTER_UNIT_LIST)
        target.searchParams.set("skill", `${unit.skill}`)
        return target
    }, [unit])

    return useMemo(() => (
        <Image
            key={ordinal}
            src={memoTarget.toString()}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            alt={`${unit.Id}: ${unit.Name} @ ${unit.skill}`}
            style={{
                objectFit: 'contain'
            }}
        />
    ), [ordinal, unit, memoTarget])
}


function MulListTable({ units }: { units: ISelectedUnit[] }) {
    return (
        <>
            <div className='grid grid-cols-8 bg-neutral-400 font-bold w-full items-left border border-0.5 border-solid border-black'>
                <div className='col-span-3 px-0.5 border border-0.5 bborder-solid border-black'>Unit</div>
                <div className='col-span-2 px-0.5 border border-0.5 bborder-solid border-black'>Type</div>
                <div className='px-0.5 border border-0.5 border-solid border-black'>Skill</div>
                <div className='px-0.5 border border-0.5 border-solid border-black'>PV</div>
                <div className='px-0.5 border border-0.5 border-solid border-black'>Tonnage</div>
            </div>
            <div className='grid grid-cols-8 w-full'>
                {
                    units && units.map((u, idx) => (
                        <React.Fragment key={idx}>
                            <div className='col-span-3 px-0.5 border border-0.5 border-solid border-black text-xs'>{u.Name}</div>
                            <div className='col-span-2 px-0.5 border border-0.5 border-solid border-black'>{u.Type.Name}</div>
                            <div className='px-0.5 border border-0.5 bborder-solid border-black text-right'>{u.skill}</div>
                            <div className='px-0.5 border border-0.5 bborder-solid border-black text-right'>{currentPV(u)}</div>
                            <div className='px-0.5 border border-0.5 bborder-solid border-black text-right'>{u.Tonnage}</div>
                        </React.Fragment>
                    ))
                }
            </div>
            <div className='grid grid-cols-8 w-full items-left border border-0.5 border-solid border-black'>
                <div className='col-span-3 px-0.5 font-bold border border-0.5 border-solid border-black bg-neutral-400'>{units.length} unit{units.length != 1 ? 's' : ''}</div>
                <div className='col-span-2 px-0.5 border border-0.5 border-solid border-black bg-neutral-400' />
                <div className='px-0.5 border border-0.5 border-solid border-black bg-neutral-400' />
                <div className='px-0.5 border border-0.5 border-solid border-black text-right'>{units && units.reduce((v, u) => v + currentPV(u), 0)}</div>
                <div className='px-0.5 border border-0.5 border-solid border-black text-right'>{units && units.reduce((v, u) => v + u.Tonnage, 0)}</div>
            </div>
        </>
    )
}


export default function CardGallery({ units }: { units: ISelectedUnit[] }) {
    const byLance = groupByLance(units)
    const showHeading = byLance.size > 1

    const items = Array.from(byLance).flatMap(([lanceId, lanceUnits]) => {
        const heading = (showHeading) ? <div className='divider text-lg font-bold divider-accent'>Lance: {lanceId || 'default'}</div> : <></>
        return (
            <React.Fragment key={lanceId}>
                {heading}
                <div className='hidden print:block print:mx-3' style={{ pageBreakAfter: "always" }}>
                    <MulListTable units={lanceUnits} />
                </div>
                <div className='grid grid-cols-2 gap-0.5 max-w-fit mx-auto'>
                    {
                        lanceUnits.map((u, idx) => (
                            <div key={idx} className="max-w-fit print:w-[437px] print:[h-313]">
                                <MemoImage unit={u} ordinal={idx} />
                            </div>
                        ))
                    }
                </div>
                <div style={{ pageBreakAfter: "always" }} />
            </React.Fragment>
        )
    });
    return (
        <>
            {items}
        </>
    )
}
