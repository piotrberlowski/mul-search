import React, { useState } from 'react';
import { UnitCardController } from './MyUnitCardController';

const HeatDisplay: string[] = ['1', '2', '3', 'S']
const HeatBG: string[] = ['yellow-500', 'orange-500', 'orange-700', 'red-800']

function HeatPanel({ controller } : {controller: UnitCardController}) {
    const [heat, setHeat] = useState(controller.value("heat"))
    const unit = controller.getCard();

    function handleButtonClick(idx: number) {
        const clickedHeat = idx + 1;
        const newHeat = (clickedHeat == heat) ? 0 : clickedHeat;
        setHeat(controller.set("heat", newHeat))
    }

    const stripeButtons = (idx: number) => {
        return (idx < heat) 
            ? `border border-solid border-red-600 border-2 ${(idx==3) ? "text-black" : "text-white"} bg-${HeatBG[idx]}`
            : `border border-solid border-black border-2 text-${HeatBG[idx]}`
        
    };

    const getHeatScaleColor = () => {
        if (heat == 0) return 'bg-neutral-300';
        return `bg-${HeatBG[heat - 1]}`
    };

    const heatScaleText = heat > 3 ? 'SHUT DOWN' : 'HEAT SCALE';

    const getHeatScaleTextColor = (h: number) => {
        return (h >= 1) ? 'text-white' : 'text-black';
    };

    return (
        <div className='flex border border-black dark:border-white rounded-lg p-1 mt-1 bg-neutral-350 items-center justify-between'>
                <div className="flex-none font-bold">OV: <span className="text-red-800">{unit.BFOverheat}</span></div>
                <div className={`font-bold ${getHeatScaleColor()} ${getHeatScaleTextColor(heat)} p-1 rounded-lg`}>
                    {heatScaleText}
                </div>
                <span className='flex font-bold justify-between items-center'>
                    {HeatDisplay.map((key, idx) => (
                        <button
                            key={idx}
                            className={`w-7 h-7 font-bold rounded-sm mx-px ${stripeButtons(idx)}`}
                            onClick={() => handleButtonClick(idx)}
                        >
                            {key}
                        </button>

                    ))}
                </span>
        </div>
    );
};

export default HeatPanel;
