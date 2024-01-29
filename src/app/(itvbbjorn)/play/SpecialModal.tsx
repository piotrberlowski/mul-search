import { XCircleIcon } from "@heroicons/react/16/solid";
import React from 'react';
import { RulesReference } from '../models/RulesReference';
import RulesReferences from './RulesReferences'; // Adjust path if needed


interface SpecialModalProps {
    ability: string | null;
}

const findRuleByAbbreviation = (abbreviation: string): RulesReference | undefined => {
    return RulesReferences.find(rule => {
        const regexPattern = rule.abbreviation.replace(/#/g, ".+"); // Any number of any characters to replace # in string
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(abbreviation);
    });
};

const SpecialModal = React.forwardRef<HTMLDialogElement, SpecialModalProps>(({ ability }, ref) => {
    const rule = findRuleByAbbreviation(ability || "");
    return (
        <dialog id="dlg_special" className="modal" ref={ref}>
            <div className="modal-box">
                <div className="flex justify-between items-center">
                    <span className="font-bold">{rule ? rule.name : "Ability not found"}</span>
                    <div className="flex items-center">
                        {/* {rule && <span style={{ marginRight: 10,  }}>p. {rule.pageNumber}</span>} */}
                        <div className="modal-action my-0 flex text-center items-center">
                            <form method="dialog">
                                <button className="btn my-0">
                                    <XCircleIcon className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
                {rule && <div>{rule.type} (p.{rule.pageNumber})</div>}
                <div className="ms-modal-body" style={{ marginTop: 8 }}>
                    {rule ? (
                        <span>
                            {rule.rule}
                        </span>
                    ) : (
                        <div>Ability details not available. Optional rules are not yet implemented.</div>
                    )}
                </div>
            </div>
        </dialog>
    )
});
SpecialModal.displayName = "Special Abilities"

export default SpecialModal;
