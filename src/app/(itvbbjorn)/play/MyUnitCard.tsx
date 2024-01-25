import { Stack, Icon, Panel, TextField, Label } from '@fluentui/react';
import React, { useState } from 'react';
import HeatPanel from './HeatPanel';
import DamagePanel from './DamagePanel';
import CriticalHitsPanel from './CriticalHitsPanel';
import AttackDamageTable from './AttackDamageTable';
import { PrimaryButton, DefaultButton } from '@fluentui/react';
import SpecialModal from './SpecialModal';
import { UnitCardController } from './MyUnitCardController';
import './Styles-UnitDetailsPanel.css'


export function MyUnitCard({controller, useHexes}: {controller: UnitCardController, useHexes: boolean}) {
    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
    const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editedName, setEditedName] = useState(controller.getCard().Name);
    const [editedBorderColor, setEditedBorderColor] = useState(controller.getCard().MyBorderColor || "#909090");

    const colorOptions = ["black", "darkred", "darkblue", "darkorange", "darkgreen", "gold", "#F0E68C", "#FF6347", "#8A2BE2", "#20B2AA"];
    const displayedSkill = controller.getCard().MySkill ?? 4;
    const displayedCost = controller.getCard().MyCalculatedPointValue ?? controller.getCard().BFPointValue;

    const saveEdits = () => {

        setIsEditPanelOpen(false);
    };

    return (
        <div style={{
            padding: 5,
            backgroundColor: 'darkgrey',
            border: 'solid',
            borderColor: editedBorderColor,
            borderRadius: 10,
            margin: 10,
            position: 'relative',
            width: '322px',
            height: '493px',
            overflow: 'hidden'
        }}>
            <Icon
                iconName='Edit'
                style={{ cursor: 'pointer', position: 'absolute', top: 11, right: 30 }}
                onClick={() => setIsEditPanelOpen(true)}
            ></Icon>

            <div style={{
                height: '32px',
                display: 'flex',
                justifyContent: 'left',
                alignItems: 'center',
                overflow: 'hidden'
            }}>
                <span style={{ fontSize: controller.getNameFontSize(), fontWeight: 'bold' }}>
                    {controller.getCard().Name}
                </span>
            </div>

            <Stack horizontal tokens={{ childrenGap: 10 }} horizontalAlign="space-between">
                <Stack verticalAlign="space-between" style={{ height: '100%' }} tokens={{ childrenGap: 30 }}>
                    <Stack>
                        <Stack horizontal style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>

                                <Stack tokens={{ childrenGap: 5 }}>
                                    <span>Type: {controller.getCard().Type.Name}</span>
                                    <span>Role: {controller.getCard().Role.Name} </span>
                                </Stack>
                            </Stack>
                        </Stack>
                        <Stack className='game-properties-stack' horizontal tokens={{ childrenGap: 10 }}>
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
                        </Stack>

                    </Stack>
                    <AttackDamageTable controller={controller} />
                </Stack>
                <Stack.Item
                    styles={{
                        root: {
                            width: '35%',
                            height: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'solid black',
                            backgroundColor: 'white',
                            position: 'relative'
                        }
                    }}
                >
                    <img src={controller.getCard().ImageUrl} alt={`${controller.getCard().Name}`} className='unit-image' />
                    <div
                        style={{
                            position: 'absolute',
                            top: '0%',
                            right: '0%',
                            fontSize: 'large',
                            fontWeight: 'bold',
                            color: 'darkred',
                            padding: '5px 5px'
                        }}
                    >
                        {displayedCost}
                    </div>
                    {/* {!isPreview && */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '0%',
                            left: '0%',
                            fontSize: 'large',
                            fontWeight: 'bold',
                            color: 'black',
                            background: 'white',
                            borderRight: 'solid black',
                            borderBottom: 'solid black',
                            padding: '5px 10px'
                        }}
                    >
                        {displayedSkill}
                    </div>
                    {/* } */}

                </Stack.Item>
            </Stack>
            <HeatPanel controller={controller} />
            <DamagePanel controller={controller} />
            <Stack horizontal styles={{ root: { display: 'flex', width: '100%' } }}>
                <Stack.Item grow={1} styles={{ root: { border: 'solid black', borderRadius: 10, padding: 5, backgroundColor: 'lightgray', marginTop: "5px" } }}>
                    <div style={{
                        fontWeight: 'bold',
                        color: "darkred",
                        marginLeft: "5px",
                        pointerEvents: 'all' // force on to override in unit preview mode
                    }}>
                        <span style={{color: "black"}}>SPECIAL: </span>
                        {controller.getCard().BFAbilities ? controller.getCard().BFAbilities.split(',').map((ability, index) => (
                            <span
                                key={index}
                                style={{ cursor: 'pointer' }}
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

                </Stack.Item>
                <Stack.Item grow={1}>

                </Stack.Item>
            </Stack>

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
        </div>

    )
}

export default MyUnitCard;