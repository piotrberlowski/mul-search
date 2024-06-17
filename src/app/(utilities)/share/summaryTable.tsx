'use client';
import { ISelectedUnit, groupByLance } from '../../../api/unitListApi';
import { UnitLine } from './mulUnitLine';

export default function SummaryTable({ input }: { input: ISelectedUnit[] }) {

    function makeLines(uts: ISelectedUnit[]) {
        return uts.map((u) => (
            <UnitLine key={u.ordinal} unit={u} />
        ));
    }

    if (input.length == 0) {
        console.error("Expected units but got none");
        return (<></>);
    }

    const byLance = groupByLance(input);
    if (byLance.size == 1) {
        for (const line of byLance.values()) {
            // return on first element
            return (
                <>
                    {makeLines(line)}
                </>
            );
        }
    }

    return (
        <>
            {
                Array.from(byLance).flatMap(([lance, uts]) => {
                    return [
                        <div key={lance} className='text-center items-center w-full font-bold my-0.5'>Lance: {lance || 'default'}</div>,
                        ...makeLines(uts)
                    ];
                })
            }
        </>
    );
}
