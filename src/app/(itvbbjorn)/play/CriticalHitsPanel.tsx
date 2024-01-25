import React from 'react';
import CriticalHitsCircles from './CriticalHitsCircles';
import { UnitCardController } from './MyUnitCardController';

function CriticalHitsPanel ({controller}:{controller: UnitCardController}) {
    if (controller.getCard().MyId === undefined) {
        return null;
    }
    return (
        <div className="w-full">
            <div className='w-full text-center bg-black text-white font-bold text-xs py-0.5 rounded-xl'>CRITICAL HITS</div>
            <div className="w-full items-center justify-center">
                    <div className="flex items-center">
                        <span className="flex-none w-28 text-right mr-1 font-bold text-sm">ENGINE</span>
                        <CriticalHitsCircles count={1} controller={controller} counter="cr_eng"/>
                        <span className='ml-1 flex-auto text-sm'>+1 Heat/firing weapons</span>
                    </div>
                    <div className="flex items-center">
                        <span className="flex-none w-28 text-right mr-1 font-bold text-sm">FIRE CONTROL</span>
                        <CriticalHitsCircles count={4} controller={controller} counter="cr_fc"/>
                        <span className='ml-1 flex-auto text-sm'>+2TN Each</span>
                    </div>
                        <div className="flex items-center">
                        <span className="flex-none w-28 text-right mr-1 font-bold text-sm">MP</span>
                        <CriticalHitsCircles count={4} controller={controller} counter="cr_mp" />
                        <span className='ml-1 flex-auto text-sm'>1/2 MV Each</span>
                    </div>
                        
                    <div className="flex items-center">
                        <span className="flex-none w-28 text-right mr-1 font-bold text-sm">WEAPONS</span>
                        <CriticalHitsCircles count={4} controller={controller} counter="cr_wp"/>
                        <span className='ml-1 flex-auto text-sm'>-1 Damage Each</span>
                    </div>
            </div>
        </div>
    )
}

export default CriticalHitsPanel;