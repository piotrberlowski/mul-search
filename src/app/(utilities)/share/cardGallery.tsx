import { ISelectedUnit, currentPV, groupByLance } from "@/api/unitListApi"
import React, { useMemo } from "react"

const CARD_WIDTH = 1008
const CARD_HEIGHT = 720
const CARD_INK = '#231f20'
const SKILL_FILL = '#d1d3d4'

const cardInk = {
    color: CARD_INK,
    printColorAdjust: 'exact' as const,
    WebkitPrintColorAdjust: 'exact' as const,
}

function CardFace({ unit }: { unit: ISelectedUnit }) {
    if (!unit.cardUrl) {
        return <div className="flex aspect-[1008/720] w-full items-center justify-center border border-black text-xs">No card</div>
    }
    return (
        <div className="relative w-full" style={{ containerType: 'inline-size' }}>
            <img src={unit.cardUrl} alt={`${unit.Name} @ ${unit.skill}`} width={CARD_WIDTH} height={CARD_HEIGHT} className="block h-auto w-full" />
            <div className="absolute flex items-center justify-center font-bold" style={{ ...cardInk, left: '47.2%', top: '27.5%', width: '3.6%', height: '5.6%', background: SKILL_FILL, fontSize: '4cqw' }}>{unit.skill}</div>
            <div className="absolute flex items-center justify-center font-bold" style={{ ...cardInk, left: '75.6%', top: '2.4%', width: '22.2%', height: '11.4%', background: '#fff', border: '0.4cqw solid #231f20', fontSize: '3.4cqw', lineHeight: 1 }}>PV: {currentPV(unit)}</div>
        </div>
    )
}

function MemoImage({ ordinal, unit }: { ordinal: number, unit: ISelectedUnit }) {
    return useMemo(() => (
        <CardFace key={ordinal} unit={unit} />
    ), [ordinal, unit])
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
                <div className='mx-auto grid w-full max-w-[880px] grid-cols-2 gap-0.5'>
                    {
                        lanceUnits.map((u, idx) => (
                            <div key={idx} className="min-w-0">
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
