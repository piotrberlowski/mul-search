import { Stack } from '@fluentui/react';
import React from 'react';
import CriticalHitsCircles from './CriticalHitsCircles';
import { Card, Counter } from '@/api/card';
import { UnitCardController } from './MyUnitCardController';

function CriticalHitsPanel ({controller}:{controller: UnitCardController}) {
    if (controller.getCard().MyId === undefined) {
        return null;
    }
    return (
        <Stack>
            <span style={{ color: 'white', backgroundColor: 'black', textAlign: 'center', fontWeight: 'bold', padding: 2, borderRadius: 10, marginTop: 5, marginBottom: 5 }}>CRITICAL HITS</span>
            <div>
                <Stack>
                    <Stack horizontal style={{ display: 'flex' }}>
                        <span style={{ flexBasis: "120px", flexGrow: "0", textAlign: "right", fontWeight: "bold", paddingRight: "5px"}}>ENGINE</span>
                        <CriticalHitsCircles count={1} controller={controller} counter="cr_eng"/>
                        <span>+1 Heat/firing weapons</span>
                    </Stack>
                    <Stack horizontal style={{ display: 'flex' }}>
                        <span style={{ flexBasis: "120px", flexGrow: "0", textAlign: "right", fontWeight: "bold", paddingRight: "5px"}}>FIRE CONTROL</span>
                        <CriticalHitsCircles count={4} controller={controller} counter="cr_fc"/>
                        <span>+2TN Each</span>
                    </Stack>
                    <Stack horizontal style={{ display: 'flex'}}>
                        <span style={{ flexBasis: "120px", flexGrow: "0", textAlign: "right", fontWeight: "bold", paddingRight: "5px"}}>MP</span>
                        <CriticalHitsCircles count={4} controller={controller} counter="cr_mp" />
                        <span>1/2 MV Each</span>
                    </Stack>
                    <Stack horizontal style={{ display: 'flex'}}>
                        <span style={{ flexBasis: "120px", flexGrow: "0", textAlign: "right", fontWeight: "bold", paddingRight: "5px"}}>WEAPONS</span>
                        <CriticalHitsCircles count={4} controller={controller} counter="cr_wp"/>
                        <span>-1 Damage Each</span>
                    </Stack>
                </Stack>
            </div>
        </Stack>
    )
}

export default CriticalHitsPanel;