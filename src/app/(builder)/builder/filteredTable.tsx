'use client';
import { processMoves } from '@/api/card';
import { IUnit } from '@/api/unitListApi';
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useReducer, useState } from "react";
import UnitLine, { UnitComparators, UnitHeader } from './unitLine';

const moveRex = /^(\d+)?(:)?(\d+)?([fwhvjt])?$/
const rangeRex = /^(\d+)?(:)?(\d+)?$/
const noFilter = [undefined, undefined]

type MoveFilter = {
    min?: number,
    max?: number,
    type?: string,
}

function parseMoveRange(filter: string | undefined): MoveFilter | undefined {
    if (filter) {
        const match = moveRex.exec(filter)
        if (!match) {
            return undefined
        }
        const [_, min, colon, max, type] = match
        const nMin = min ? parseInt(min) : undefined, nMax=max ? parseInt(max) : undefined
        if (colon) {
            return {
                min: nMin,
                max: nMax,
                type: type,
            }
        } else {
            return {
                min: nMin,
                max: nMin,
                type: type,
            }
        }
    }
    return undefined
}

function parseRange(filter: string | undefined): (number | undefined)[] {
    if (filter) {
        const match = rangeRex.exec(filter)
        if (!match) {
            return noFilter
        }
        const [_, min, colon, max] = match
        const nMin = min ? parseInt(min) : undefined, nMax=max ? parseInt(max) : undefined
        if (colon) {
            return [nMin, nMax]
        } else {
            return [nMin, nMin]
        }
    }
    return noFilter
}

function matchesIfFilter<T>(filter: T | undefined, predicate: (filter: T) => boolean) {
    if (filter) {
        return predicate(filter);
    }
    return true;
}

function includesIfFilter(filter: string | undefined, value: string) {
    return matchesIfFilter(filter, (f) => (value) ? value.toLowerCase().includes(f.toLowerCase()) : false);
}

function matchAbilities(filter: string, abilities: string) {
    const queries = filter.split(new RegExp("[, ]+"));
        const matches = queries.reduce((res, query) => {
        query = query.toLowerCase().trim();
        const cleanQ = query.replace(/^!/, '');
        const neg = query != cleanQ;
        const contains = (abilities ?? "").toLowerCase().includes(cleanQ);
        return res && (neg !== contains);
    }, true);
    return matches;
}

function matchDmg(filter: string, unit: IUnit) {
    if (filter?.includes('/')) {
        const queries = filter.split('/');
        const dmgs = [unit.BFDamageShort, unit.BFDamageMedium, unit.BFDamageLong];
        return queries.reduce((res, q, idx) => {
            return (!q) ? res : res && dmgs[idx] == parseInt(q);
        }, true);
    } else {
        return `${unit.BFDamageShort}:${unit.BFDamageMedium}:${unit.BFDamageLong}`.includes(filter);
    }

}

function matchMove(filter: MoveFilter, move: string) {
    function moveMatcher(v: number, t?: string) {
        if (!(filter.min || filter.max || filter.type)) {
            // No filters set, any move matches
            return true
        }
        if (!(filter.min || filter.max) && filter.type) {
            // Only type set, do exact match
            return `${v}${t}`.includes(filter.type)
        }
        let matches = true
        if (filter.min) {
            matches = matches && (filter.min <= v)
        }
        if (filter.max) {
            matches = matches && (filter.max >= v)
        }
        if (filter.type) {
            matches = matches && (t != undefined) && (t.includes(filter.type))
        }
        return matches
    }
    return processMoves(move, moveMatcher).find(x => x) ?? false;
}

export type Sort = {
    column: string;
    order: number;
};

type FilterFields = {
    name?: string;
    abilities?: string;
    minPV?: number;
    maxPV?: number;
    dmg?: string;
    moveFilter?: MoveFilter;
    minSz?: number;
    maxSz?: number;
};



class Filter {

    fields: FilterFields;

    constructor(
        overrides?: FilterFields
    ) {
        this.fields = {};
        if (overrides) {
            this.fields = { ...overrides };
        }
    }

    public matches(unit: IUnit) {
        return includesIfFilter(this.fields.name, unit.Name)
            && matchesIfFilter(this.fields.abilities, (f) => matchAbilities(f, unit.BFAbilities))
            && matchesIfFilter(this.fields.moveFilter, (f) => matchMove(f, unit.BFMove))
            && matchesIfFilter(this.fields.minPV, (f) => unit.BFPointValue >= f)
            && matchesIfFilter(this.fields.maxPV, (f) => unit.BFPointValue <= f)
            && matchesIfFilter(this.fields.minSz, (f) => unit.BFSize >= f)
            && matchesIfFilter(this.fields.maxSz, (f) => unit.BFSize <= f)
            && matchesIfFilter(this.fields.dmg, (f) => matchDmg(f, unit));

    }

    public withOverrides(overrides: FilterFields) {
        return new Filter({
            ...this.fields,
            ...overrides
        });
    }
}

type FilterAction = {
    type: string;
    filter: string | undefined;
};

function QuickFilter({ label, action, className, filterCallback, tooltip }: { label: string; action: string; className?: string; filterCallback: (act: FilterAction) => void; tooltip?: string} ) {
    const [value, setValue] = useState<string | undefined>('')

    function filter(v: string | undefined) {
        setValue((v == undefined) ? '' : v)
        filterCallback({
            type: action,
            filter: v,
        })
    }

    return (
        <>
            <div className={`flex flex-1 ${className} text-xs relative`}>
                <div className="tooltip w-full h-full text-xs" data-tip={tooltip}>
                    <input type="text" placeholder={label} value={value} className="input input-bordered w-full input-xs" onChange={e => filter(e.target.value)} title={tooltip} alt={tooltip} />
                    <button className="btn btn-square btn-outline absolute right-0 btn-xs" onClick={e => filter(undefined)}><XMarkIcon className='min-h-4 min-w-4 h-4 w-4 shrink-0 resize-none' /></button>
                </div>
            </div>
        </>
    )
}

function reduceFilter(filter: Filter, action: FilterAction) {
    switch (action.type) {
        case 'name':
            return filter.withOverrides({ name: action.filter })
        case 'abilities':
            return filter.withOverrides({ abilities: action.filter })
        case 'pv-range':
            const [minPV,maxPV] = parseRange(action.filter)
            return filter.withOverrides({ minPV: minPV, maxPV: maxPV })
        case 'sz-range':
            const [minS, maxS] = parseRange(action.filter)
            return filter.withOverrides({ minSz: minS, maxSz: maxS})
        case 'move':
            const move = parseMoveRange(action.filter)
            return filter.withOverrides({ moveFilter: move })
        case 'dmg':
            return filter.withOverrides({ dmg: action.filter })
        default:
            return filter
    }
}

export default function FilteredTable({ data }: { data: IUnit[]} ) {

    const [units, setUnits] = useState(data)
    const [filter, setFilter] = useReducer(reduceFilter, new Filter())
    const [sort, setSort] = useState({
        column: 'Name',
        order: 1
    })

    function sortAndFilter(data: IUnit[]) {
        return data
            .filter((unit) => filter.matches(unit))
            .sort((a, b) => UnitComparators[sort.column](a, b) * sort.order)
    }

    return (
        <div className="bg-inherit">
            <div className="sticky z-0 top-0 mt-2 items-center text-center bg-inherit border-b border-b-solid border-b-1 border-b-black dark:border-b-white text-sm">
                <div className="w-full flex flex-wrap gap-x-2 gap-y-1">
                    <QuickFilter label="Unit Name" className="basis-full md:basis-5/12" action="name" filterCallback={setFilter} />
                    <QuickFilter label="Abilities" className="basis-full md:basis-5/12" action="abilities" filterCallback={setFilter} tooltip='Use comma to search for multiple abilities: "AM, MEC"' />
                    <QuickFilter label="Dmg" className="basis-1/5 md:basis-2/12" action="dmg" filterCallback={setFilter} tooltip='"//N" => N at long range, "/5" => 5 at medium, "5/" => 5 at short' />
                    <QuickFilter label="Move (min:max)" className="basis-1/5 md:basis-2/12" action="move" filterCallback={setFilter} tooltip='"8:14j" for 8<=move<=14 jumping or 12 for exactly 12 any mode'/>
                    <QuickFilter label="PV (min:max)" className="basis-1/5 md:basis-2/12" action="pv-range" filterCallback={setFilter} tooltip='":42" for less than 42 or "10:22" for 10 to 22 PV' />
                    <QuickFilter label="Size (min:max)" className="basis-1/5 md:basis-2/12" action="sz-range" filterCallback={setFilter} tooltip='"4" for exactly 4, "3:" for 3 or larger'/>
                </div>
                <div className="mx-0.5 md:mx-5 text-sm">
                    <UnitHeader initial={sort} onSort={setSort} />
                </div>
            </div>
            <div className="mx-0.5 md:mx-5 text-sm mb-2 striped">
                {
                    sortAndFilter(units).map(
                        (entry,idx) => <UnitLine key={entry.Id} unit={entry} idx={idx}/>
                    )
                }
            </div>
        </div>
    )
}


