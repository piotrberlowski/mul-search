'use client';
import { processMoves } from '@/api/card';
import { IUnit } from '@/api/unitListApi';

function matchesIfFilter<T>(filter: T | undefined, predicate: (filter: T) => boolean) {
    if (filter) {
        return predicate(filter);
    }
    return true;
}

function includesIfFilter(filter: string | undefined, value: string) {
    return matchesIfFilter(filter, (f) => (value) ? value.toLowerCase().includes(f.toLowerCase()) : false);
}

function matchAbilities(filter: string, value: string) {
    const queries = filter.split(new RegExp("[, ]+"));
    return queries.reduce((res, q) => {
        return value?.toLowerCase().includes(q.toLowerCase().trim());
    }, true);
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

export class Filter {

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

export type FilterAction = {
    type: string;
    filter: string | undefined;
};
