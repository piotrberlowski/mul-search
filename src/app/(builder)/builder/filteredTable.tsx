'use client';
import { processMoves } from '@/api/card';
import { ChangeListener } from '@/api/commons';
import { IUnit } from '@/api/unitListApi';
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import UnitLine, { UnitComparators, UnitHeader } from './unitLine';
import RulesReferences from '@/app/(itvbbjorn)/play/RulesReferences';
import { MULSearchParams } from '@/app/data';
import { useSearchParams } from 'next/navigation';

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
        const nMin = min ? parseInt(min) : undefined, nMax = max ? parseInt(max) : undefined
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
        const nMin = min ? parseInt(min) : undefined, nMax = max ? parseInt(max) : undefined
        if (colon) {
            return [nMin, nMax]
        } else {
            return [nMin, nMin]
        }
    }
    return noFilter
}

function matchesIfFilter<T>(filter: T | undefined, predicate: (filter: T) => boolean) {
    if (filter != undefined && filter != null) {
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
    experimental?: boolean;
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

    private matchesExperimental(unit: IUnit) {
        const rules = unit.Rules?.toLocaleLowerCase().trim()
        const f = this.fields.experimental
        const include = f || (rules != "unknown" && rules != "experimental")
        return include
    }

    public matches(unit: IUnit) {

        return includesIfFilter(this.fields.name, unit.Name)
            && matchesIfFilter(this.fields.abilities, (f) => matchAbilities(f, unit.BFAbilities))
            && matchesIfFilter(this.fields.moveFilter, (f) => matchMove(f, unit.BFMove))
            && matchesIfFilter(this.fields.minPV, (f) => unit.BFPointValue >= f)
            && matchesIfFilter(this.fields.maxPV, (f) => unit.BFPointValue <= f)
            && matchesIfFilter(this.fields.minSz, (f) => unit.BFSize >= f)
            && matchesIfFilter(this.fields.maxSz, (f) => unit.BFSize <= f)
            && matchesIfFilter(this.fields.dmg, (f) => matchDmg(f, unit))
            && this.matchesExperimental(unit)
    }

    public withOverrides(overrides: FilterFields) {
        return new Filter({
            ...this.fields,
            ...overrides
        });
    }
}

function FilterBox({ tooltip, children, className }: { tooltip?: string, children: React.ReactNode, className?: string }) {
    return (
        <div className={`flex ${className} text-xs relative box-border`}>
            <div className="tooltip w-full h-full text-xs" data-tip={tooltip}>
                {children}
            </div>
        </div>
    )
}

interface FilterParams<T> { label: string; className?: string; filterCallback: ChangeListener<T>; tooltip?: string }

function QuickFilter({ label, className, filterCallback, tooltip }: FilterParams<string | undefined>) {
    const [value, setValue] = useState<string | undefined>('')

    function filter(v: string | undefined) {
        setValue((v == undefined) ? '' : v)
        filterCallback(v)
    }

    return (
        <FilterBox tooltip={tooltip} className={className} >
            <input type="text" placeholder={label} value={value} className="input input-bordered w-full input-xs box-border" onChange={e => filter(e.target.value)} title={tooltip} alt={tooltip} />
            <button className="btn btn-square btn-outline absolute right-0 btn-xs" onClick={e => filter(undefined)}><XMarkIcon className='min-h-4 min-w-4 h-4 w-4 shrink-0 resize-none' /></button>
        </FilterBox>
    )
}

function QuickCheck({ label, className, filterCallback, tooltip }: FilterParams<boolean>) {

    const [value, setValue] = useState(false)

    function filter(v: boolean) {
        setValue(v)
        filterCallback(v)
    }

    return (
        <FilterBox tooltip={tooltip} className={className} >
            <label className="label cursor-pointer p-0 justify-start">
                <input type="checkbox" checked={value} className="checkbox checkbox-md" onChange={e => filter(e.target.checked)} />
                <div className="label-text text-xs ml-1 text-nowrap whitespace-nowrap text-clip overflow-hidden">{label}</div>
            </label>
        </FilterBox>
    )

}

export default function FilteredTable({ data }: { data: IUnit[] }) {
    const params = useSearchParams()
    const [units, setUnits] = useState(data)
    const [filter, setFilter] = useState(new Filter())
    const [sort, setSort] = useState({
        column: 'Name',
        order: 1
    })

    function sortAndFilter(data: IUnit[]) {
        return data
            .filter((unit) => filter.matches(unit))
            .sort((a, b) => UnitComparators[sort.column](a, b) * sort.order)
    }

    function updateFilter(fields: FilterFields) {
        setFilter(filter.withOverrides(fields))
    }

    return (
        <>
            <div className="sticky z-20 top-0 mt-2 items-center text-center bg-inherit border-b border-b-solid border-b-1 border-b-black dark:border-b-white text-sm">
                <div className="w-full grid grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-1 overflow-x-clip overflow-y-visible hover:overflow-x-visible">
                    <QuickFilter label="Unit Name" className="col-span-6 md:col-span-3" filterCallback={flt => updateFilter({ name: flt })} />
                    <QuickFilter label="Abilities" className="col-span-2 md:col-span-3" filterCallback={flt => updateFilter({ abilities: flt })} tooltip='Use comma to search for multiple abilities: "AM, MEC"' />
                    <QuickFilter label="Dmg" className="col-span-2 md:col-span-2" filterCallback={flt => updateFilter({ dmg: flt })} tooltip='"//N" => N at long range, "/5" => 5 at medium, "5/" => 5 at short' />
                    <QuickFilter label="Move (min:max)" className="col-span-2 md:col-span-2" filterCallback={flt => updateFilter({ moveFilter: parseMoveRange(flt) })} tooltip='"8:14j" for 8<=move<=14 jumping or 12 for exactly 12 any mode' />
                    <QuickFilter
                        label="PV (min:max)"
                        className="col-span-2"
                        filterCallback={
                            flt => {
                                const [minPV, maxPV] = parseRange(flt)
                                updateFilter({ minPV: minPV, maxPV: maxPV })
                            }
                        }
                        tooltip='":42" for less than 42 or "10:22" for 10 to 22 PV'
                    />
                    <QuickFilter
                        label="Size (min:max)"
                        className="col-span-2"
                        filterCallback={
                            flt => {
                                const [minSz, maxSz] = parseRange(flt)
                                updateFilter({ minSz: minSz, maxSz: maxSz })
                            }
                        }
                        tooltip='"4" for exactly 4, "3:" for 3 or larger' />
                    <QuickCheck label="Experimental Rules" className="col-span-2 overflow-hidden text-ellipsis" filterCallback={flt => updateFilter({experimental: flt})} />
                </div>
                <div className="text-sm">
                    <UnitHeader initial={sort} onSort={setSort} />
                </div>
            </div>
            <div className="text-sm mb-2 striped">
                {
                    sortAndFilter(units).map(
                        (entry, idx) => {
                            return (
                                <UnitLine key={(params.get('era')||"") +entry.Id} unit={entry} idx={idx} />
                            )
                        }
                    )
                }
            </div>
        </>
    )
}


