import React from 'react';
import { UnitCardController } from './MyUnitCardController';
import { Counter } from '@/api/card';

const calculateAdjustedDamage = (baseDamage: number, weaponHits: number) => {
    return Math.max(0, baseDamage - weaponHits);
};
const calculateAdjustedRangeLabel = (baseRangeLabel: string, fcHits: number, heat: number) => {
    let adjustment = heat;
    console.log(heat);
    if(baseRangeLabel === "S") adjustment += 0 + (2 * fcHits);
    if(baseRangeLabel === "M") adjustment += 2 + (2 * fcHits);
    if(baseRangeLabel === "L") adjustment += 4 + (2 * fcHits);

    return `${baseRangeLabel} (+${adjustment})`;
};

function AttackDamageTable ({ controller }: {controller: UnitCardController}) {
    const weaponHits = controller.value("cr_wp");
    const fcHits = controller.value("cr_fc");

    const adjustedShort = calculateAdjustedDamage(controller.getCard().BFDamageShort, weaponHits);
    const adjustedMedium = calculateAdjustedDamage(controller.getCard().BFDamageMedium, weaponHits);
    const adjustedLong = calculateAdjustedDamage(controller.getCard().BFDamageLong, weaponHits);
    const heat = controller.value("heat") ?? 0;

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: 'solid black', marginBottom: 5 }}>
            <thead style={{ backgroundColor: 'black', color: 'white', borderRadius: 10 }}>
                <tr>
                    <th style={{ minWidth: 50, maxWidth: 100 }}>{calculateAdjustedRangeLabel("S", fcHits, heat)}</th>
                    <th style={{ minWidth: 50, maxWidth: 100 }}>{calculateAdjustedRangeLabel("M", fcHits, heat)}</th>
                    <th style={{ minWidth: 50, maxWidth: 100 }}>{calculateAdjustedRangeLabel("L", fcHits, heat)}</th>
                </tr>
            </thead>
            <tbody style={{ backgroundColor: 'lightgray' }}>
                <tr>
                    <td style={{ minWidth: 50, maxWidth: 100, color: 'darkred', fontWeight: 'bold', fontSize: 20 }}>{adjustedShort}</td>
                    <td style={{ minWidth: 50, maxWidth: 100, color: 'darkred', fontWeight: 'bold', fontSize: 20 }}>{adjustedMedium}</td>
                    <td style={{ minWidth: 50, maxWidth: 100, color: 'darkred', fontWeight: 'bold', fontSize: 20 }}>{adjustedLong}</td>
                </tr>
            </tbody>
        </table>
    );
};



export default AttackDamageTable;
