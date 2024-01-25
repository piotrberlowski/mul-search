import React, { useState, useEffect } from 'react';
import { DefaultButton, Dialog, Stack } from '@fluentui/react';
import './Styles-UnitDetailsPanel.css';
import { Card } from '../../../api/card';
import MyUnitCard from './MyUnitCard';

interface UnitDetailsPanelProps {
    unit: Card;
    isOpen: boolean;
    onClose: () => void;
    onAddUnit?: (unit: Card) => void;
}

const UnitDetailsPanel: React.FC<UnitDetailsPanelProps> = ({ unit, isOpen, onClose, onAddUnit }) => {
    useEffect(() => {
        // Reset skill value when unit changes
        setSkillValue(defaultSkill);
    }, [unit]);

    const defaultSkill: number = 4;
    const [skillValue, setSkillValue] = useState<number>(defaultSkill);

    if (!unit) {
        return null;
    }

    const calculatePointValue = (baseValue: number, skillDifference: number) => {
        let increaseAdjustment;
        let decreaseAdjustment;

        if (baseValue <= 7) {
            increaseAdjustment = 1;
        } else if (baseValue <= 12) {
            increaseAdjustment = 2;
        } else if (baseValue <= 17) {
            increaseAdjustment = 3;
        } else if (baseValue <= 22) {
            increaseAdjustment = 4;
        } else if (baseValue <= 27) {
            increaseAdjustment = 5;
        } else if (baseValue <= 32) {
            increaseAdjustment = 6;
        } else if (baseValue <= 37) {
            increaseAdjustment = 7;
        } else if (baseValue <= 42) {
            increaseAdjustment = 8;
        } else if (baseValue <= 47) {
            increaseAdjustment = 9;
        } else if (baseValue <= 52) {
            increaseAdjustment = 10;
        } else {
            increaseAdjustment = 10 + Math.floor((baseValue - 53) / 5) + 1;
        }

        if (baseValue <= 14) {
            decreaseAdjustment = 1;
        } else if (baseValue <= 24) {
            decreaseAdjustment = 2;
        } else if (baseValue <= 34) {
            decreaseAdjustment = 3;
        } else if (baseValue <= 44) {
            decreaseAdjustment = 4;
        } else if (baseValue <= 54) {
            decreaseAdjustment = 5;
        } else if (baseValue <= 64) {
            decreaseAdjustment = 6;
        } else if (baseValue <= 74) {
            decreaseAdjustment = 7;
        } else if (baseValue <= 84) {
            decreaseAdjustment = 8;
        } else if (baseValue <= 94) {
            decreaseAdjustment = 9;
        } else if (baseValue <= 104) {
            decreaseAdjustment = 10;
        } else {
            decreaseAdjustment = 10 + Math.floor((baseValue - 105) / 10) + 1;
        }

        let finalValue;
        if (skillDifference < 0) {
            finalValue = baseValue + (increaseAdjustment * Math.abs(skillDifference));
        } else {
            finalValue = baseValue - (decreaseAdjustment * skillDifference);
        }

        return finalValue < 1 ? 1 : finalValue;
    };

    const handleAddUnit = () => {
        const calculatedValue = calculatePointValue(unit.BFPointValue, skillValue - defaultSkill);
        unit.MyCalculatedPointValue = calculatedValue;

        unit.MySkill = skillValue;

        if (onAddUnit) {
            onAddUnit(unit);
        }
        onClose();
    };

    const incrementSkill = () => {
        if (skillValue < 9) {
            setSkillValue(prevSkill => prevSkill + 1);
        }
    };

    const decrementSkill = () => {
        if (skillValue > 0) {
            setSkillValue(prevSkill => prevSkill - 1);
        }
    };

    return (
        <Dialog
            hidden={!isOpen}
            onDismiss={onClose}
            dialogContentProps={{
                title: 'Card preview',
            }}
            modalProps={{
                isBlocking: true,
                containerClassName: 'dialogContainer'
            }}
        >
            <div style={{ pointerEvents: 'none' }}>
                <MyUnitCard
                    skillValue={skillValue}
                    pointValue={calculatePointValue(unit.BFPointValue, skillValue - defaultSkill)}
                    isPreview={true}
                    unit={unit}
                    updateDamage={() => { }}
                    updateHeat={() => { }}
                    updateHits={() => { }}
                    useHexes={false}
                    removeUnit={() => { }}
                    onUnitUpdate={() => { }}
                />
            </div>
            <div style={{
                textAlign: 'center',
                margin: '10px 0'
            }}>
            </div>
            <Stack horizontal style={{ margin: '10px 0', alignItems: 'center', justifyContent: 'center' }}>

                <div style={{ width: 'auto', textAlign: 'center', marginRight: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Skill:</span>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '10px'
                    }}>
                        <DefaultButton
                            onClick={decrementSkill}
                            text="-"
                            style={{
                                width: '35px',
                                height: '35px',
                                minWidth: '0',
                                padding: '0',
                            }}
                        />
                        <span style={{ margin: '0 10px', fontSize: 30, fontWeight: 'bold' }}>{skillValue}</span>
                        <DefaultButton
                            onClick={incrementSkill}
                            text="+"
                            style={{
                                width: '35px',
                                height: '35px',
                                minWidth: '0',
                                padding: '0',
                            }}
                        />
                    </div>
                </div>

                <div style={{ width: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Point Value:</span>
                    <span style={{ color: 'darkred', fontSize: 30, fontWeight: 'bold', marginTop: '10px' }}>{calculatePointValue(unit.BFPointValue, skillValue - defaultSkill)}</span>
                </div>
            </Stack>

            {onAddUnit && (
                <DefaultButton
                    text="Add unit to force"
                    onClick={handleAddUnit}
                    style={{
                        display: 'block',
                        margin: '20px auto',
                        width: 'fit-content'
                    }}
                />
            )}
        </Dialog>
    );
};

export default UnitDetailsPanel;
