import React, { useState, useEffect } from 'react';
import { UnitCardController } from './MyUnitCardController';
import "./Styles-DamagePanel.css"

const calculateBackgroundColor = (damage: number, armor: number, structure: number) => {
    const percentageDamage = (damage - armor) / structure;

    if (percentageDamage <= 0) return 'bg-neutral-350';
    if (percentageDamage >= 1) return 'pattern-diagonal-lines pattern-size-3 pattern-black pattern-bg-red-700 pattern-opacity-100'
    if (percentageDamage > 0.5) return 'bg-red-500';
    
    return 'bg-yellow-500';
};

function DamagePanel ({ controller }: {controller: UnitCardController}) {
    const[dmg, setDmg] = useState(controller.value("dmg") ?? 0)
    const armorDamage = Math.min(controller.getCard().BFArmor, dmg);
    const structureDamage = Math.max(0, dmg - controller.getCard().BFArmor);

    const [clickedArmorButtons, setClickedArmorButtons] = useState<boolean[]>(Array(controller.getCard().BFArmor).fill(false).map((_, i) => i < armorDamage));
    const [clickedSButtons, setClickedSButtons] = useState<boolean[]>(Array(controller.getCard().BFStructure).fill(false).map((_, i) => i < structureDamage));

    useEffect(() => {
        const armorDamageCalculation = Math.min(controller.getCard().BFArmor, dmg);
        const structureDamageCalculation = Math.max(0, dmg - controller.getCard().BFArmor);

        setClickedArmorButtons(Array(controller.getCard().BFArmor).fill(false).map((_, i) => i < armorDamageCalculation));
        setClickedSButtons(Array(controller.getCard().BFStructure).fill(false).map((_, i) => i < structureDamageCalculation));
    }, [dmg, controller]);


    const handleArmorButtonClick = (index: number) => {
        const newClickedButtons = [...clickedArmorButtons];
        newClickedButtons[index] = !newClickedButtons[index];
        setClickedArmorButtons(newClickedButtons);

        const totalDamage = newClickedButtons.filter(btn => btn).length + clickedSButtons.filter(btn => btn).length;
        setDmg(controller.set("dmg", totalDamage));
    };

    const handleStructureButtonClick = (index: number) => {
        // if user is trying to fill a circle, check if all armor circles are not filled 
        if (!clickedSButtons[index] && clickedArmorButtons.some(btn => !btn)) return;
        const newClickedButtons = [...clickedSButtons];
        newClickedButtons[index] = !newClickedButtons[index];
        setClickedSButtons(newClickedButtons);

        const totalDamage = clickedArmorButtons.filter(btn => btn).length + newClickedButtons.filter(btn => btn).length;
        setDmg(controller.set("dmg", totalDamage));
    };


    const totalDamage = clickedArmorButtons.filter(btn => btn).length + clickedSButtons.filter(btn => btn).length;
    const backgroundStyle = calculateBackgroundColor(totalDamage, controller.getCard().BFArmor, controller.getCard().BFStructure);

    return (
        <div
            className={`border border-black dark:border-white rounded-lg p-1 mt-1 ${backgroundStyle}`}
        >

                <div className='flex items-center'>
                    <span className="label font-bold h-6 w-6 text-right">A:</span>
                    {clickedArmorButtons.map((clicked, i) => (
                        <button
                            key={i}
                            className={`circleButton ${clicked ? 'clicked' : ''}`}
                            onClick={() => handleArmorButtonClick(i)}
                        />
                    ))}
                </div>
                <div className='flex items-center'>
                    <span className='label font-bold h-6 w-6 text-right'>S:</span>
                    {clickedSButtons.map((clicked, i) => (
                        <button
                            key={i}
                            className={`sCircleButton ${clicked ? 'clicked' : ''}`}
                            onClick={() => handleStructureButtonClick(i)}
                        />
                    ))}
                </div>

        </div>
    );
};

export default DamagePanel;
