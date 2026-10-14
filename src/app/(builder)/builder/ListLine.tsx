'use client';
import { ExclamationCircleIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ISelectedUnit, currentPV } from '../../../api/unitListApi';
import { formatDamageString, ListBuilderController } from './listBuilderController';

function UnitErrorSign({ errors }: { errors: string[] }) {
    return (
        <div className="dropdown dropdown-hover dropdown-top dropdown-end flex-none">
            <div tabIndex={0} role="button" aria-label="Unit failed validation" className="inline-flex cursor-pointer">
                <ExclamationCircleIcon className="h-4 w-4" />
            </div>
            <div tabIndex={0} className="dropdown-content z-50 mb-1 w-56 max-h-48 overflow-auto rounded-box border border-error bg-base-100 p-2 text-left shadow">
                <ul className="list-disc space-y-1 pl-4 text-xs text-error">
                    {errors.map((error, index) => (
                        <li key={index} className="whitespace-normal">{error}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

const LANCES = [...Array(20).keys()].map((n) => `${n}`.padStart(2, "0")).map((l) => <option key={`${l}`} value={l}>{l}</option>);

export function ListLine({ unit, controller, errors = [] }: { unit: ISelectedUnit; controller: ListBuilderController; errors?: string[]; }) {
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
    const dmgString = formatDamageString(unit, unit.Type.Id == 1)
    const invalid = errors.length > 0
    return (
        <div className={`flex flex-nowrap w-full border border-solid text-center items-center ${invalid ? '!border-error !bg-error !text-error-content [&_a]:!text-error-content [&_a:visited]:!text-error-content' : 'border-gray-400 dark:border-gray-800'}`}>
            <select className="grow-0 hidden md:block bg-base-200 select-bordered select-xs min-h-[1rem] h-3 leading-3 text-xs rounded-sm px-1 mr-2" value={unit.lance || ''} onChange={(e) => lanceOnSelect(e.target.value)}>
                <option value={''}></option>
                {LANCES}
            </select>
            <div className="flex-1 grid grid-cols-8 md:grid-cols-12 my-0 text-xs lg:text-sm  text-center items-center">
                <div className="col-span-2 md:col-span-3 text-left">
                    <a href={unit.slug ? `https://masterunitlist.battletech.com/units/${unit.slug}` : "https://masterunitlist.battletech.com/"} target="_blank">{unit.Name}</a>
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
                <div>{dmgString}</div>
                <div>{unit.BFArmor} + {unit.BFStructure}</div>
                <div className="hidden md:block text-xs truncate col-span-2 md:col-span-3 text-left">{unit.BFAbilities}</div>
            </div>
            {invalid && <UnitErrorSign errors={errors} />}
            <button className="grow-0 btn btn-xs btn-square" onClick={e => { controller.removeUnit(unit.ordinal); }}>
                <MinusIcon className='h-3 w-3' />
            </button>
        </div>
    );
}
