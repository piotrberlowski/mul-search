'use client'
import Link from 'next/link';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, currentPV, loadByName, loadLists, totalPV } from '../../../api/unitListApi';
import ShareLink from '../share/shareLink';
import { IUnit } from '../../../api/unitListApi';
import { ChangeListener, ListBuilderController } from './listBuilderController';
import { SearchResultsController, useSearchResultsContext } from './searchResultsController';
import Combinations from '../../../components/combinations';
import PlayLink from '../../../components/playLink';
import { Ubuntu } from 'next/font/google';

function ListLine({ unit, controller }: { unit: ISelectedUnit, controller: ListBuilderController }) {
    const [skill, setSkill] = useState(unit.skill)
    const [checked, setChecked] = useState(false)

    function skillOnSelect(newSkill: string) {
        const nSkill = parseInt(newSkill)
        unit.skill = (nSkill)
        setSkill(nSkill)
        controller.updateTotal()
    }

    return (
        <div className="grid grid-cols-8 md:grid-cols-12 my-0 border border-solid border-gray-400 dark:border-gray-800 text-xs lg:text-sm text-center items-center">
            <input type="checkbox" className="toggle toggle-xs toggle-warning max-md:hidden" checked={checked} onChange={() => {
                controller.setSelected(unit, !checked)
                setChecked(!checked)
            }}/>
            <div id={"line-" + unit.ordinal} className="col-span-1 md:col-span-2 text-left">
                <a href={"http://www.masterunitlist.info/Unit/Details/" + unit.Id} target="_blank">{unit.Name}</a>
            </div>
            <div>
                <select value={unit.skill} onChange={e => skillOnSelect(e.target.value)}>
                    {
                        [...Array(8).keys()].map(
                            num => {
                                return (
                                    <option key={num} value={num}>{num}</option>
                                )
                            }
                        )
                    }
                </select>
            </div>
            <div>{currentPV(unit)}</div>
            <div>{unit.Role.Name}</div>
            <div>{unit.BFMove}</div>
            <div>{unit.BFDamageShort}/{unit.BFDamageMedium}/{unit.BFDamageLong}</div>
            <div>{unit.BFArmor} + {unit.BFStructure}</div>
            <div className="hidden md:block text-xs truncate col-span-2 text-left">{unit.BFAbilities}</div>
            <button className="block text-center font-bold text-xs" onClick={e => { controller.removeUnit(unit.ordinal) }}>
                -
            </button>
        </div>
    )
}

function BuilderHeader({ controller, onClose }: { controller: ListBuilderController, onClose: () => void }) {
    const [selected, setSelected] = useState<ISelectedUnit[]>([])
    const units = controller.getUnits()
    const constraints = controller.getConstraints()
    controller.setSelectionHandler(setSelected)
    return (
        <div className="w-full flex-none">
            <div className="text-center">{constraints}</div>
            <div className="flex">
                <div className="text-center flex-1">Units: {units.length}</div>
                <div className="text-center flex-1">PV: {totalPV(units)} (Selected: {totalPV(selected)})</div>
            </div>
            <button className="absolute right-0 top-0 border border-solid px-1 border-red-500 w-5" onClick={e => onClose()}>X</button>
        </div>
    )
}

function BuilderFooter({
    listName,
    controller,
    setName,
}: {
    listName: string,
    controller: ListBuilderController,
    setName: ChangeListener<string>
}) {
    const [selectedList, setSelectedList] = useState<string>(listName)
    return (
        <div className="bg-inherit grid grid-cols-4 items-center text-center w-full text-xs md:text-sm lg:text-base">
            <button className="h-full" onClick={e => controller.clear()}>Clear</button>
            <button className="h-full" onClick={e => controller.store(listName)
            }>Save</button>
            <div className="h-full">
                <div className="flex h-1/2">
                    <span className="flex-none mx-1 h-1/2">Pick:</span>
                    <select className="inline flex-1 overflow-hidden h-full" value={selectedList} onChange={
                        e => {
                            setSelectedList(e.target.value)
                            setName(e.target.value)
                        }
                    }>
                        <option key="" value=""></option>
                        {
                            controller.getStoredLists().map(name => (<option key={name} value={name}>{name}</option>))
                        }
                    </select>
                </div>
                <button className="h-1/2 w-full" onClick={e => controller.load(listName)}>Load</button>
            </div>
            <div className="h-full">
                <button className="w-full" onClick={e => controller.exportExternal(listName, "jeff")}>Export to Jeff&apos;s Tools</button>
                <Link href="/tts/" target="_blank" className="button-link w-full block" onClick={e => controller.exportExternal(listName, "tts")}>Export to TTS</Link>
            </div>
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
    const [selected, setSelected] = useState<ISelectedUnit[]>([])

    const controller = new ListBuilderController(
        save,
        searchResultsController.getListConstraints(),
        storedLists,
        selected,
        setSave,
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
                    <div className="fixed bg-inherit inset-y-20 max-xl:inset-x-[1%] xl:inset-x-[10%] 2xl:inset-x-[20%] z-10 border border-red-500 items-center text-center flex flex-col">
                        <BuilderHeader controller={controller} onClose={() => setVisible(false)} />
                        <div className="flex-none w-full flex">
                            <span className="mr-1 flex-none">Name: </span>
                            <input className="inline flex-1 h-5 p-0 overflow-hidden" type='text' onChange={e => setName(e.target.value)} value={name} />
                        </div>

                        <div className="w-full flex-1 overflow-auto overscroll-none">
                            {save.units.map(u => <ListLine key={u.ordinal} unit={u} controller={controller} />)}
                        </div>

                        <div className="flex-none w-full bg-inherit grid grid-cols-1">
                            <div className="bg-inherit grid grid-cols-1 md:grid-cols-3">
                                <Combinations units={save.units}/>
                                <PlayLink units={save.units} className='button-link w-full block'>Play This</PlayLink>
                                <ShareLink constraints={searchResultsController.getListConstraints()} name={name} total={total} units={save.units} className='button-link w-full block'/>
                            </div>
                            <BuilderFooter
                                listName={name}
                                controller={controller}
                                setName={setName} />
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

