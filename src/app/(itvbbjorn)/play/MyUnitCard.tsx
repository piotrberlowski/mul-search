import { PencilSquareIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useRef, useState } from 'react';
import AttackDamageTable from './AttackDamageTable';
import CardEditModal from './CardEditPanel';
import CriticalHitsPanel from './CriticalHitsPanel';
import DamagePanel from './DamagePanel';
import HeatPanel from './HeatPanel';
import { UnitCardController } from './MyUnitCardController';
import SpecialModal from './SpecialModal';
import './Styles-UnitDetailsPanel.css';

function fontSize(name: string) {
    if (name.length > 40) {
        return 'text-[8px] text-ellipsis'
    } else if (name.length > 36) {
        return 'text-xs';
    } else if (name.length > 30) {
        return 'text-sm';
    } else if (name.length > 24) {
        return 'test-base';
    } else if (name.length > 12) {
        return 'text-lg';
    } else {
        return 'text-xl';  // default size
    }
};

function UnitDetails({ className, controller, useHexes }: { className: string, controller: UnitCardController, useHexes: boolean }) {
    return (
        <div className={className}>
            <div className="flex w-full flex-wrap">
                <div className="flex w-full gap-1">
                    <span className="w-1/5 text-left text-sm">
                        Type:
                    </span>
                    <span className="w-4/5 text-left text-sm">
                        {controller.getCard().Type.Name}
                    </span>
                </div>
                <div className="flex w-full gap-1">
                    <span className="w-1/5 text-left text-sm">
                        Role:
                    </span>
                    <span className="w-4/5 text-left text-sm">
                        {controller.getCard().Role.Name}
                    </span>
                </div>
            </div>
            <div className='flex w-full justify-around my-1'>
                <div className='game-properties-container'>
                    <span className='game-properties-title'>SZ:</span>
                    <span className='game-properties-value'>{controller.getCard().BFSize}</span>
                </div>
                <div className='game-properties-container'>
                    <span className='game-properties-title'>TMM:</span>
                    <span className='game-properties-value'>{controller.getTmmString()}</span>
                </div>
                <div className='game-properties-container'>
                    <span className='game-properties-title'>MV:</span>
                    <span className='game-properties-value'>{controller.getMvString(useHexes)}</span>
                </div>
            </div>
            <AttackDamageTable controller={controller} />
        </div >
    )
}

export function MyUnitCard({ controller, useHexes }: { controller: UnitCardController, useHexes: boolean }) {
    const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
    const [editableProps, setEditableProps] = useState({
        name: controller.getCard().Name,
        borderColor: controller.getCard().MyBorderColor || "slate-600"
    });
    const cardEditRef = useRef<HTMLDialogElement>(null)
    const specialRef = useRef<HTMLDialogElement>(null)

    const displayedSkill = controller.getCard().MySkill ?? 4;
    const displayedCost = controller.getCard().MyCalculatedPointValue ?? controller.getCard().BFPointValue;

    const saveEdits = (newName: string, newBorderColor: string) => {
        setEditableProps({
            name: newName,
            borderColor: newBorderColor,
        })
        controller.update(newName, newBorderColor)
    };

    return (
        <div className={`p-1 bg-gray-400 border border-solid rounded-lg m-2 overflow-hidden w-[310px] h-[490px] border-4 border-${editableProps.borderColor}`}>
            <div className="flex h-6 text-left justify-between items-center">
                <span className={`font-bold ${fontSize(editableProps.name)}`}>
                    {editableProps.name}
                </span>
                <div className="flex-none">
                    <PencilSquareIcon className="h-5 w-5" title="edit" onClick={() => cardEditRef?.current && cardEditRef.current.showModal()} />
                </div>
            </div>

            <div className="flex gap-1">
                <UnitDetails className="w-2/3" controller={controller} useHexes={useHexes} />
                <div className='flex w-1/3 grow-0 justify-center items-center bg-white align-middle relative'>
                    <Image src={controller.getCard().ImageUrl} alt={`${controller.getCard().Name}`} className='align-middle' fill style={{ objectFit: 'contain', }} />
                    <div className="absolute top-0 right-0 text-lg font-bold text-red-700 p-1 border border-gray-400 border-2 bg-white">
                        {displayedCost}
                    </div>
                    <div className="absolute top-0 left-0 text-lg font-bold text-black p-1 border border-gray-400 border-2 bg-white" >
                        {displayedSkill}
                    </div>
                </div>
            </div>
            <HeatPanel controller={controller} />
            <DamagePanel controller={controller} />
            <div className="flex flex-wrap bg-neutral-400 rounded-md border border-2 mt-1">
                <div className="text-sm w-full p-1">
                    <span className="font-bold text-red-700 text-xs">SPECIAL: </span>
                    {controller.getCard().BFAbilities ? controller.getCard().BFAbilities.split(',').map((ability, index) => (
                        <span
                            key={index}
                            className="cursor-pointer text-xs"
                            onClick={() => {
                                setSelectedAbility(ability.trim());
                                specialRef?.current && specialRef.current.showModal()
                            }}
                        >
                            {ability.trim()}
                            {index !== controller.getCard().BFAbilities.split(',').length - 1 && ', '}
                        </span>
                    )) : null}
                </div>
                <CriticalHitsPanel controller={controller} />
            </div>

            <CardEditModal name={editableProps.name} borderColor={editableProps.borderColor} onSave={saveEdits} ref={cardEditRef} />
            <SpecialModal ability={selectedAbility} ref={specialRef} />
        </div >

    )
}

export default MyUnitCard;