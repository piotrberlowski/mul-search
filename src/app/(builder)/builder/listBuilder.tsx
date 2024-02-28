'use client'
import { useCombinations } from '@/components/combinations';
import Link from 'next/link';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ISelectedUnit, IUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, groupByLance, loadByName, loadLists, totalPV } from '../../../api/unitListApi';
import PlayLink from '../../../components/playLink';
import ShareLink from '../share/shareLink';
import { ListLine } from './ListLine';
import { ListBuilderController } from './listBuilderController';
import useLoadDialog from './loadDialog';
import { SearchResultsController, useSearchResultsContext } from './searchResultsController';

function BuilderHeader({ controller, onClose }: { controller: ListBuilderController, onClose: () => void }) {
    const units = controller.getUnits()
    const constraints = controller.getConstraints()
    return (
        <>
            <div className="w-full text-center font-bold max-md:text-xs mx-auto">{constraints}</div>
            <div className="w-full flex">
                <div className="w-full flex">
                    <div className="text-center flex-1">Units: {units.length}</div>
                    <div className="text-center flex-1">PV: {totalPV(units)}</div>
                </div>
                <button className="absolute right-0 top-0 border border-solid px-1 border-red-500 w-5" onClick={e => onClose()}>X</button>
            </div>
        </>
    )
}

function BuilderFooter({
    units,
    total,
    constraints,
    listName,
    controller,
}: {
    units: ISelectedUnit[],
    total: number,
    constraints: string,
    listName: string,
    controller: ListBuilderController,
}) {

    const [cmbBtn, cmbDlg] = useCombinations(units, <>Sub-lists</>, 'btn text-center w-full btn-sm')
    const [loadBtn, loadDlg] = useLoadDialog(listName, controller, (<>Load</>))

    return (
        <div className="bg-inherit grid grid-cols-3 items-center text-center w-full text-xs md:text-sm lg:text-base">
            <div className="dropdown dropdown-top dropdown-start h-full text-center items-center">
                <div tabIndex={0} role="button" className="button-link w-full h-full text-center items-center align-middle flex"><div className='m-auto'>Play</div></div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>{cmbBtn}</li>
                    <li><PlayLink units={units} className='btn text-center w-full btn-sm'>Play View</PlayLink></li>
                    <li><ShareLink constraints={constraints} name={listName} total={total} units={units} className='btn text-center w-full btn-sm' /></li>
                </ul>
            </div>
            <div className="dropdown dropdown-top dropdown-end h-full text-center items-center">
                <div tabIndex={0} role="button" className="button-link w-full h-full text-center items-center align-middle flex"><div className='m-auto'>Edit</div></div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><button className="btn text-center w-full btn-sm" onClick={e => {
                        controller.clear()
                        e?.currentTarget.blur()
                    }}>Clear</button></li>
                    <li><button className="btn text-center w-full btn-sm" onClick={e => {
                        controller.store(listName)
                        e?.currentTarget.blur()
                    }}>Save</button></li>
                    <li>{loadBtn}</li>
                </ul>
            </div>
            <div className="dropdown dropdown-top dropdown-end h-full text-center items-center">
                <div tabIndex={0} role="button" className="button-link w-full h-full text-center items-center align-middle flex"><div className='m-auto'>Export</div></div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><button className="w-full btn text-center btn-sm" onClick={e => controller.exportExternal(listName, "jeff")}>Jeff&apos;s Tools</button></li>
                    <li><Link href="/tts/" target="_blank" className="btn text-center w-full btn-sm" onClick={e => controller.exportExternal(listName, "tts")}>TTS</Link></li>
                </ul>
            </div>
            {loadDlg}
            {cmbDlg}
        </div>
    )

}

function UnitsHeader({ lid, units }: { lid: string, units: ISelectedUnit[] }) {
    return (
        <div className="flex text-sm lg:text-base">
            <div className="text-center flex-1">Units: {units.length}</div>
            <div className="text-center flex-1 font-bold">{lid}</div>
            <div className="text-center flex-1">PV: {totalPV(units)}</div>
        </div>
    )
}

function Lines({ save, controller }: { save: Save, controller: ListBuilderController }) {
    const lances = groupByLance(save.units)

    return (
        <div className="w-full flex-1 overflow-auto overscroll-none">
            {
                Array.from(lances).flatMap(([lid, units]) => [
                    <UnitsHeader key={`lance-header-${lid}`} lid={`Lance: ${lid || 'default'}`} units={units} />,
                    ...units.map(u => <ListLine key={u.ordinal} unit={u} controller={controller} />)
                ])
            }
        </div>
    )
}



export default function ListBuilder({ defaultVisible }: { defaultVisible: boolean }) {
    const searchResultsController: SearchResultsController = useSearchResultsContext()
    const [visible, setVisible] = useState(defaultVisible)
    const [name, setName] = useState(LOCAL_STORAGE_NAME_AUTOSAVE)
    const [save, setSave] = useState<Save>(loadByName(name))
    const [total, setTotal] = useState(totalPV(save.units))
    const [storedLists, setStoredLists] = useState(loadLists())

    const controller = new ListBuilderController(
        save,
        searchResultsController.getListConstraints(),
        storedLists,
        setSave,
        setName,
        setTotal,
        setStoredLists,
    )

    searchResultsController.register(
        (unit: IUnit) => {
            if (save.constraints != searchResultsController.getListConstraints()) {
                if (save.units.length == 0) {
                    setSave(
                        {
                            ...save,
                            constraints: searchResultsController.getListConstraints(),
                        }
                    )
                } else {
                    alert(`Cannot add unit. Please clear the list or set your search to: \n ${save.constraints} `)
                    return
                }
            }
            controller.addUnit(unit)
        }
    )

    const count = save.units.length

    const unitList = () => {
        if (visible) {
            return (
                <>
                    <div className="fixed bg-inherit inset-y-[1%] lg:inset-y-20 max-xl:inset-x-[1%] xl:inset-x-[10%] 2xl:inset-x-[20%] z-10 border border-red-500 items-center text-center flex flex-col">
                        <BuilderHeader controller={controller} onClose={() => setVisible(false)} />
                        <div className="flex-none w-full flex">
                            <span className="mr-1 flex-none">Name: </span>
                            <input className="inline flex-1 h-5 p-0 overflow-hidden" type='text' onChange={e => setName(e.target.value)} value={name} />
                        </div>

                        <Lines save={save} controller={controller} />

                        <div className="flex-none w-full bg-inherit grid grid-cols-1">
                            <BuilderFooter
                                units={save.units}
                                total={total}
                                constraints={searchResultsController.getListConstraints()}
                                listName={name}
                                controller={controller} />
                        </div>
                    </div>
                </>
            )
        } else {
            return <></>
        }
    }


    if (typeof document !== "undefined") {
        return (
            createPortal(
                <>
                    <div className="fixed w-full top-2 left-0 pointer-events-none">
                        <div className="max-w-screen-lg mx-auto items-right">
                            <div className="pointer-events-auto float-right grid grid-cols-2 w-40 text-xs bg-red-500 text-white hover:text-black text-center border dark:border-white border-black" onClick={(e) => setVisible(v => !v)}>
                                <div className="col-span-2">Current List</div>
                                <div>Count: {count}</div>
                                <div>Total: {total}</div>
                            </div>
                        </div>
                    </div>
                    {unitList()}
                </>
                , document.body
            )
        )
    }
    else {
        return (<></>)
    }
}

