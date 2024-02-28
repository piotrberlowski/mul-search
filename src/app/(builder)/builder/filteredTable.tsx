'use client';
import { processMoves } from '@/api/card';
import { IUnit } from '@/api/unitListApi';
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useReducer, useState } from "react";
import UnitLine, { UnitComparators, UnitHeader } from './unitLine';

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
        const contains = abilities.toLowerCase().includes(cleanQ);
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

function matchMove(filter: string, move: string) {
    const f = filter.trim();
    let consumer = (v: number, t?: string) => `${v}${t}`.includes(filter);
    if (f.startsWith('>')) {
        consumer = (v, _) => v > (parseInt(filter.substring(1)) || 0);
    } else if (f.startsWith('<')) {
        consumer = (v, _) => v < (parseInt(filter.substring(1)) || 100);
    }
    return processMoves(move, consumer).find(x => x) ?? false;
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
    move?: string;
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
            && matchesIfFilter(this.fields.move, (f) => matchMove(f, unit.BFMove))
            && matchesIfFilter(this.fields.minPV, (f) => unit.BFPointValue >= f)
            && matchesIfFilter(this.fields.maxPV, (f) => unit.BFPointValue <= f)
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
            <div className={`flex flex-1 ${className} text-xs md:text-base relative`}>
                <input type="text" placeholder={label} value={value} className="input input-bordered w-full input-xs" onChange={e => filter(e.target.value)} title={tooltip} alt={tooltip} />
                <button className="btn btn-square btn-outline absolute right-0 btn-xs" onClick={e => filter(undefined)}><XMarkIcon className='min-h-4 min-w-4 h-4 w-4 shrink-0 resize-none' /></button>
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
        case 'min-pv':
            return filter.withOverrides({ minPV: (action.filter) ? parseInt(action.filter) : undefined })
        case 'max-pv':
            return filter.withOverrides({ maxPV: (action.filter) ? parseInt(action.filter) : undefined })
        case 'move':
            return filter.withOverrides({ move: action.filter })
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
                    <QuickFilter label="Move" className="basis-1/5 md:basis-2/12" action="move" filterCallback={setFilter} />
                    <QuickFilter label="MinPV" className="basis-1/5 md:basis-2/12" action="min-pv" filterCallback={setFilter} />
                    <QuickFilter label="MaxPV" className="basis-1/5 md:basis-2/12" action="max-pv" filterCallback={setFilter} />
                </div>
                <div className="mx-0.5 md:mx-5 text-sm">
                    <UnitHeader initial={sort} onSort={setSort} />
                </div>
            </div>
            <div className="mx-0.5 md:mx-5 text-sm mb-2">
                {
                    sortAndFilter(units).map(
                        entry => <UnitLine key={entry.Id} unit={entry} />
                    )
                }
            </div>
        </div>
    )
}