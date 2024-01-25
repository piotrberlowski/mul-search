import React from 'react';
import { UnitCardController } from './MyUnitCardController';

const ranges: string[] = ["S", "M", "L"]

export default function AttackDamageTable ({ controller }: {controller: UnitCardController}) {
    const weaponHits = controller.value("cr_wp");
    const fcHits = controller.value("cr_fc");
    const dmg = [controller.getCard().BFDamageShort, controller.getCard().BFDamageMedium, controller.getCard().BFDamageLong]
    const heat = controller.value("heat") ?? 0;

    return (
        <div className="grid grid-cols-3 w-full text-center border border-2">
            {ranges.map((r) => (
                <div key={r} className='text-white bg-black text-xs p-1'>{`${r}(+${ranges.indexOf(r) * 2 + fcHits * 2 + heat})`}</div>
            ))}
            {dmg.map((d) => (
                <div key={d} className="bg-neutral-300 text-red-800 font-bold">{Math.max(0, d-weaponHits)}</div>
            ))}
        </div>
    );
};
