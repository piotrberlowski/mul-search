'use client';
import { useState } from 'react';
import { ISelectedUnit, currentPV } from '../../../api/unitListApi';
import { ListBuilderController } from './listBuilderController';
import { MinusIcon } from '@heroicons/react/24/outline';

const LANCES = [...Array(20).keys()].map((n) => `${n}`.padStart(2, "0")).map((l) => <option key={`${l}`} value={l}>{l}</option>);

export function ListLine({ unit, controller }: { unit: ISelectedUnit; controller: ListBuilderController; }) {
    const [skill, setSkill] = useState(unit.skill);
    const [lance, setLance] = useState(unit.lance || '');

    function skillOnSelect(newSkill: string) {
        const nSkill = parseInt(newSkill);
        unit.skill = (nSkill);
        setSkill(nSkill);
        controller.updateTotal();
    }

    function lanceOnSelect(newLance: string) {
        unit.lance = newLance;
        setLance(newLance);
        controller.updateTotal();
    }

    return (
        <div className="flex flex-nowrap w-full border border-solid border-gray-400 dark:border-gray-800 text-center items-center">
            <select className="grow-0 hidden md:block bg-base-200 select-bordered select-xs min-h-[1rem] h-3 leading-3 text-xs rounded-sm px-1 mr-2" value={unit.lance || ''} onChange={(e) => lanceOnSelect(e.target.value)}>
                <option value={''}></option>
                {LANCES}
            </select>
            <div className="flex-1 grid grid-cols-8 md:grid-cols-12 my-0 text-xs lg:text-sm  text-center items-center">
                <div className="col-span-2 md:col-span-3 text-left">
                    <a href={"http://www.masterunitlist.info/Unit/Details/" + unit.Id} target="_blank">{unit.Name}</a>
                </div>
                <div className='items-right text-right'>
                    <select value={unit.skill} onChange={e => skillOnSelect(e.target.value)} className="bg-base-200 select-bordered select-xs  min-h-[1rem] h-3 leading-3 text-xs rounded-sm px-1">
                        {[...Array(8).keys()].map(
                            num => {
                                return (
                                    <option key={num} value={num}>{num}</option>
                                );
                            }
                        )}
                    </select>
                </div>
                <div>{currentPV(unit)}</div>
                <div>{unit.Role.Name}</div>
                <div>{unit.BFMove}</div>
                <div>{unit.BFDamageShort}/{unit.BFDamageMedium}/{unit.BFDamageLong}</div>
                <div>{unit.BFArmor} + {unit.BFStructure}</div>
                <div className="hidden md:block text-xs truncate col-span-2 md:col-span-3 text-left">{unit.BFAbilities}</div>
            </div>
            <button className="grow-0 btn btn-xs btn-square" onClick={e => { controller.removeUnit(unit.ordinal); }}>
                <MinusIcon className='h-3 w-3' />
            </button>
        </div>
    );
}
