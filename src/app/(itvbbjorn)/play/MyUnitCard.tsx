import { Panel, TextField, Label } from '@fluentui/react';
import { PencilSquareIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';
import HeatPanel from './HeatPanel';
import DamagePanel from './DamagePanel';
import CriticalHitsPanel from './CriticalHitsPanel';
import AttackDamageTable from './AttackDamageTable';
import { PrimaryButton, DefaultButton } from '@fluentui/react';
import SpecialModal from './SpecialModal';
import { UnitCardController } from './MyUnitCardController';
import './Styles-UnitDetailsPanel.css'
import Image from 'next/image';

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
    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
    const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editedName, setEditedName] = useState(controller.getCard().Name);
    const [editedBorderColor, setEditedBorderColor] = useState(controller.getCard().MyBorderColor || "#909090");

    const colorOptions = ["black", "darkred", "darkblue", "darkorange", "darkgreen", "gold", "#F0E68C", "#FF6347", "#8A2BE2", "#20B2AA"];
    const displayedSkill = controller.getCard().MySkill ?? 4;
    const displayedCost = controller.getCard().MyCalculatedPointValue ?? controller.getCard().BFPointValue;

    const saveEdits = () => {
        controller.update(editedName, editedBorderColor)
        setIsEditPanelOpen(false);
    };

    return (
        <div className={`p-1 bg-gray-400 border border-solid rounded-lg m-2 overflow-hidden w-[310px] h-[490px]`}>
            <div className="flex h-6 text-left justify-between items-center">
                <span className={`font-bold ${fontSize(editedName)}`}>
                    {editedName}
                </span>
                <div className="flex-none">
                    <PencilSquareIcon className="h-5 w-5" title="edit" onClick={() => setIsEditPanelOpen(true)}/>
                </div>
            </div>

            <div className="flex gap-1">
                <UnitDetails className="w-2/3" controller={controller} useHexes={useHexes} />
                <div className='flex w-1/3 grow-0 justify-center items-center bg-white align-middle relative'>
                    <Image src={controller.getCard().ImageUrl} alt={`${controller.getCard().Name}`} className='align-middle' fill style={{objectFit: 'contain',}}/>
                    <div className="absolute top-0 right-0 text-lg font-bold text-red-700 p-1 border border-gray-400 border-1 bg-white">
                        {displayedCost}
                    </div>
                    <div className="absolute top-0 left-0 text-lg font-bold text-black p-1 border border-gray-400 border-1 bg-white" >
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
                                setIsModalOpen(true);
                            }}
                        >
                            {ability.trim()}
                            {index !== controller.getCard().BFAbilities.split(',').length - 1 && ', '}
                        </span>
                    )) : null}
                </div>
                <CriticalHitsPanel controller={controller} />
            </div>

            <Panel isOpen={isEditPanelOpen} onDismiss={() => setIsEditPanelOpen(false)} headerText="Edit Unit">
                <TextField
                    label="Unit Name"
                    value={editedName}
                    onChange={(e, newValue) => setEditedName(newValue || "")}
                />
                <Label>Border color</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', maxWidth: '150px' }}>
                    {colorOptions.map(color => (
                        <div
                            key={color}
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: color,
                                margin: '5px',
                                cursor: 'pointer',
                                border: editedBorderColor === color ? '2px solid black' : '2px solid transparent',
                                boxSizing: 'border-box'
                            }}
                            onClick={() => setEditedBorderColor(color)}
                        />
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                    <PrimaryButton onClick={saveEdits} style={{ marginRight: '10px' }} text="Save" />
                    <DefaultButton onClick={() => setIsEditPanelOpen(false)} text="Cancel" />
                </div>
            </Panel>
            <SpecialModal
                ability={selectedAbility}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div >

    )
}

export default MyUnitCard;