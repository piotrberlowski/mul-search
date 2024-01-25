import React, { useState } from 'react';
import { UnitCardController } from './MyUnitCardController';

const HeatDisplay: string[] = ['1', '2', '3', 'S']

export const HeatBG: string[] = ['yellow-500', 'orange-500', 'orange-700', 'red-800']

function heatscaleTextStyle(h: number) {
    return (h >= 1) ? 'text-white' : 'text-black';
};

function heatscaleBgStyle(h: number) {
    if (h == 0) return 'bg-neutral-300';
    return `bg-${HeatBG[h - 1]}`
};

function heatscaleButtonStyle(h: number, heatIdx: number) {
    const textColor = (heatIdx == 3) ? "text-black" : "text-white"
    // heatIdx is the index of the heat button not actual heat number, it's shifted by one
    return (heatIdx >= h)
        ? `${textColor} bg-${HeatBG[heatIdx]}`
        : `${textColor} pattern-diagonal-lines pattern-black pattern-size-2 pattern-opacity-100 pattern-bg-${HeatBG[heatIdx]}`

};

export default function HeatPanel({ controller }: { controller: UnitCardController }) {
    const [heat, setHeat] = useState(controller.value("heat"))
    const unit = controller.getCard();

    function handleButtonClick(idx: number) {
        const clickedHeat = idx + 1;
        const newHeat = (clickedHeat == heat) ? 0 : clickedHeat;
        setHeat(controller.set("heat", newHeat))
    }

    const heatScaleText = heat > 3 ? 'SHUT DOWN' : 'HEAT SCALE';

    return (
        <div className='flex border border-black dark:border-white rounded-lg p-1 mt-1 bg-neutral-350 items-center justify-between'>
            <div className="flex-none font-bold">OV: <span className="text-red-800">{unit.BFOverheat}</span></div>
            <div className={`font-bold ${heatscaleBgStyle(heat)} ${heatscaleTextStyle(heat)} p-1 rounded-lg`}>
                {heatScaleText}
            </div>
            <span className='flex font-bold justify-between items-center'>
                {
                    HeatDisplay.map((key, idx) => {
                        return (
                            <button key={idx} className={`w-7 h-7 font-bold rounded-sm mx-px border border-solid border-2 border-black ${heatscaleButtonStyle(heat, idx)}`} onClick={() => handleButtonClick(idx)}>
                                {key}
                            </button>
                        )
                    })
                }
            </span>
        </div>
    );
};

