'use client'
import { Suspense, useState } from 'react'
import { AddUnitCallback } from '../api/unitListApi';
import ResultContainer from './resultContainer';
import { Faction, Factions } from '../data';
import { IUnit } from '../unitLine';
import dynamic from "next/dynamic";
import { useSearchParams } from 'next/navigation';
import { MULSearchParams } from './resultGrid';

function Loading({ name }: { name: string }) {
    return (<div>{name} loading...</div>)
}

const ListBuilder = dynamic(
    () => {
        return import('./listContainer')
    },
    {
        ssr: false
    }
)

export default function CsrPage({ factions }: { factions: Faction[] }) {
    let [onAdd, setOnAdd] = useState<AddUnitCallback>((u) => { })
    const params = useSearchParams()
    const mulSP = new MULSearchParams(params)

    const listConstraints = mulSP.describe(new Factions(factions))

    function onAddProxy(unit: IUnit) {

        onAdd(unit)
    }

    return <>
        <div className="bg-inherit">
            <Suspense fallback={<Loading name="Search Results" />}>
                <ResultContainer onAdd={onAddProxy} search={mulSP} constraints={listConstraints} />
            </Suspense>
            <ListBuilder defaultVisible={Boolean(params.get("builder"))} onCreate={cb => onAdd = cb} constraints={listConstraints} />
        </div>
    </>

}