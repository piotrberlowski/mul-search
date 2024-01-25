'use client'
import React, { useState, useEffect } from 'react';
import { DefaultButton} from '@fluentui/react';
import MyUnitCard from './MyUnitCard';
import { Card } from '@/api/card';
import { LOCAL_STORAGE_PLAY_PREFIX, UNITS_KEY } from '@/api/playApi';
import './Styles-UnitDetailsPanel.css';
import { UnitCardController } from './MyUnitCardController';

const USE_HEXES_KEY: string = LOCAL_STORAGE_PLAY_PREFIX + "use_hexes";
const OP_KEY: string = LOCAL_STORAGE_PLAY_PREFIX + "op";
const SP_KEY: string = LOCAL_STORAGE_PLAY_PREFIX + "sp";

function loadIfAvailable<T>(key: string, defaultValue: T): T {
    let data: T =  defaultValue
    if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem(key);
        data = storedValue ? JSON.parse(storedValue) : defaultValue;
    }
    return data
}

export default function MyUnits() {
    const [op, setOp] = useState<number>(() => {
        return loadIfAvailable(OP_KEY, 0)
    });
    const [sp, setSp] = useState<number>(() => {
        return loadIfAvailable(SP_KEY, 0)
    });
    const [units, setUnits] = useState<Card[]>([]);
    const [useHexes, setUseHexes] = useState<boolean>(() => {
        return loadIfAvailable(USE_HEXES_KEY, false)
    });
    const [complete, setComplete] = useState(false)
    // On component mount, retrieve the units from local storage
    useEffect(() => {
        const storedUnits = localStorage.getItem(UNITS_KEY);
        if (storedUnits) {
            const parsedUnits: Card[] = JSON.parse(storedUnits);
            setUnits(parsedUnits)
            setComplete(true)
        }

        const storedHexSetting = localStorage.getItem(USE_HEXES_KEY);
        if (storedHexSetting) {
            const parsedHexes: boolean = JSON.parse(storedHexSetting);
            setUseHexes(parsedHexes);
        }
    }, []);

    const totalPoints = units.reduce((sum, unit) => sum + (unit.MyCalculatedPointValue || unit.BFPointValue), 0);
    const incrementOp = () => setOp(prev => prev + 1);
    const decrementOp = () => setOp(prev => Math.max(prev - 1, 0));
    const incrementSp = () => setSp(prev => prev + 1);
    const decrementSp = () => setSp(prev => Math.max(prev - 1, 0));

    useEffect(() => {
        if (complete) {
            localStorage.setItem(UNITS_KEY, JSON.stringify(units));
        }
        localStorage.setItem(USE_HEXES_KEY, JSON.stringify(useHexes));
        localStorage.setItem(OP_KEY, JSON.stringify(op));
        localStorage.setItem(SP_KEY, JSON.stringify(sp));
    }, [units, useHexes, op, sp]);

    const toggleUseHexes = (_: any) => {
        setUseHexes(!useHexes);
    };

    const sortedUnits = [...units].sort((a, b) => {
        const colorA = a.MyBorderColor || 'black';
        const colorB = b.MyBorderColor || 'black';

        if (colorA < colorB) return -1;
        if (colorA > colorB) return 1;
        return 0;
    });

    const updateUnit = (updatedUnit: Card) => {
        setUnits(prevUnits => prevUnits.map(unit => unit.MyId === updatedUnit.MyId ? updatedUnit : unit));
    };


    return (
        <div className='w-full'>
            <h1 className='text-center text-3xl mb-1'>
                Alpha Strike PV:&nbsp;
                <span className='font-bold text-red-600'>
                    {totalPoints}
                </span>
            </h1>
            
            <div className='flex justify-center items-center my-2'>

                <div className='w-auto text-center items-center flex flex-col mr-5'>
                    <span className='font-bold'>Objective Points</span>
                    <div className='flex text-center items-center justify-center mt-1'>
                        <DefaultButton
                            onClick={decrementOp}
                            text="-"
                            className='flex-0 min-w-max w-8 h-8 p-0'
                        />
                        <span className='text-3xl font-bold mx-2'>{op}</span>
                        <DefaultButton
                            onClick={incrementOp}
                            text="+"
                            className='flex-0 min-w-max w-8 h-8 p-0'
                        />
                    </div>
                </div>


                <div className='w-auto text-center items-center flex flex-col'>
                    <span className='font-bold'>Secondary Points</span>
                    <div className='flex text-center items-center justify-center mt-1'>
                        <DefaultButton
                            onClick={decrementSp}
                            text="-"
                            className='flex-0 min-w-max w-8 h-8 p-0'
                        />
                        <span className='text-3xl font-bold mx-2'>{sp}</span>
                        <DefaultButton
                            onClick={incrementSp}
                            text="+"
                            className='flex-0 min-w-max w-8 h-8 p-0'
                        />
                    </div>
                </div>
            </div>

            <div className="w-full h-8">
                <div className='mx-auto w-24 text-center border border-black dark:border-white rounded-md align-bottom h-full'>
                    <label className="swap swap-flip h-full min-h-full">
                        <input type="checkbox" checked={useHexes} onChange={toggleUseHexes}/>
                        <div className="swap-on">HEXES</div>
                        <div className="swap-off">INCHES</div>
                    </label>
                </div>
            </div>

            <div className='flex flex-wrap justify-center'>
                {sortedUnits.map((card) => (
                    <div className='cardContainer' key={card.MyId}>
                        <MyUnitCard
                            controller={new UnitCardController(card, updateUnit)}
                            useHexes={useHexes}
                        />
                    </div>
                ))}

            </div>
            <div className='invisible text-yellow-500 bg-yellow-500 pattern-bg-yellow-500 text-orange-500 bg-orange-500 pattern-bg-orange-500 text-orange-700 bg-orange-700 pattern-bg-orange-700 text-red-800 bg-red-800 pattern-bg-red-800'> Invisible TailwindCSS pallette for dynamic heat colors</div>
        </div>
    );
};
