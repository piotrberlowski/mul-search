'use client'
import { useState } from 'react'
import { IUnit } from '../unitLine';
import { AddUnitCallback, ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, currentPV, totalPV, loadByName, loadLists, removeByName, saveByName, saveLists, toJeffsUnits, exportTTSString, Save } from '../api/unitListApi';
import { createPortal } from 'react-dom';
import ShareLink from '../share/shareLink';
import { compareSelectedUnits } from '../api/shareApi';
import Link from 'next/link';

function ListLine({ unit, onUpdate, onRemove }: { unit: ISelectedUnit, onUpdate: () => void, onRemove: (id: number) => void }) {
    const [skill, setSkill] = useState(unit.skill)

    function skillOnSelect(newSkill: string) {
        const nSkill = parseInt(newSkill)
        unit.skill = (nSkill)
        setSkill(nSkill)
        onUpdate()
    }

    return (
        <div className="grid grid-cols-12 my-0 border border-solid border-gray-400 dark:border-gray-800 font-small text-center items-center">
            <div id={"line-" + unit.ordinal} className="col-span-3 text-left">
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
            <div className="text-xs truncate col-span-2 text-left">{unit.BFAbilities}</div>
            <button className="block text-center font-bold text-xs" onClick={e => { onRemove(unit.ordinal) }}>
                -
            </button>
        </div>
    )
}

function BuilderHeader({ constraints, count, total, onClose }: { constraints: string, count: number, total: number, onClose: () => void }) {
    return (
        <div className="w-full">
            <div className="text-center">{constraints}</div>
            <div className="flex">
                <div className="text-center flex-1">Units: {count}</div>
                <div className="text-center flex-1">Total PV: {total}</div>
            </div>
            <button className="absolute right-0 top-0 border border-solid px-1 border-red-500 w-5" onClick={e => onClose()}>X</button>
        </div>
    )
}

function BuilderFooter({
    listName,
    storedLists,
    onClear,
    onSave,
    onLoad,
    onExport,
    onSelect
}: {
    listName: string,
    storedLists: string[],
    onClear: () => void,
    onSave: (name: string) => void,
    onLoad: (name: string) => void,
    onExport: (name: string, format: string) => void,
    onSelect: (name: string) => void,
}) {
    const [selectedList, setSelectedList] = useState<string>(listName)
    return (
        <div className="bg-inherit grid grid-cols-4 items-center text-center w-full">
            <button className="h-full" onClick={e => onClear()}>Clear</button>
            <button className="h-full" onClick={
                e => {
                    onSave(listName)
                }
            }>Save</button>
            <div className="h-full">
                <div className="flex h-1/2">
                    <span className="flex-none mx-1 h-1/2">Pick:</span>
                    <select className="inline flex-1 overflow-hidden h-full" value={selectedList} onChange={
                        e => {
                            setSelectedList(e.target.value)
                            onSelect(e.target.value)
                        }
                    }>
                        <option key="" value=""></option>
                        {
                            storedLists.map(name => (<option key={name} value={name}>{name}</option>))
                        }
                    </select>
                </div>
                <button onClick={e => {
                    onLoad(selectedList)
                }
                }>Load</button>
            </div>
            <div className="h-full">
                <button className="w-full" onClick={e => {
                    onExport(listName, "jeff")
                }
                }>Export to Jeff&apos;s Tools</button>
                <Link href="/tts/" target="_blank" className="button-link w-full block" onClick={e => {
                    onExport(listName, "tts")
                }
                }>Export to TTS</Link>
            </div>
        </div>
    )

}

function exportJeffsJson(name: string, units: ISelectedUnit[]) {
    const data = {
        name: name,
        members: toJeffsUnits(units),
        lastUpdated: new Date().toISOString(),
        formationBonus: "None",
        groupLabel: "Star"
    }

    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(data)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "list.json";

    link.click();
};

export default function ListBuilder({ defaultVisible, onCreate, constraints }: { defaultVisible: boolean, onCreate: (onAddUnit: AddUnitCallback) => void, constraints: string }) {
    const [visible, setVisible] = useState(defaultVisible)
    const [name, setName] = useState(LOCAL_STORAGE_NAME_AUTOSAVE)
    const [save, setSave] = useState<Save>(loadByName(name))
    const [total, setTotal] = useState(totalPV(save.units))
    const [storedLists, setStoredList] = useState(loadLists())

    function addUnit(unit: IUnit) {
        if (save.constraints != constraints) {
            alert(`Cannot add unit. Please clear the list or set your search to: \n ${constraints} `)
            return
        }
        const ord = (save.units.length == 0) ? 0 : Math.max(...save.units.map(u => u.ordinal)) + 1
        const selected = {
            ordinal: ord,
            skill: 4,
            ...unit
        }
        const newUnits = [...save.units, selected].sort(compareSelectedUnits)
        setSave({
            units: newUnits,
            constraints: save.constraints,
        })
        updateTotal(newUnits)
    }

    function removeUnit(ord: number) {
        console.log("Removing unit: " + ord)
        const newUnits = save.units.filter(u => u.ordinal != ord)
        console.log("previous length: " + save.units.length + " Current length:" + newUnits.length)
        setSave({
            units: newUnits,
            constraints: save.constraints,
        })
        updateTotal(newUnits)
    }

    function updateTotal(optionalUnits?: ISelectedUnit[]) {
        let subject = optionalUnits || save.units
        setTotal(totalPV(subject))
        saveByName({
            units: subject,
            constraints: constraints,
        }, LOCAL_STORAGE_NAME_AUTOSAVE)
    }

    function clear() {
        setSave({
            units: [],
            constraints: constraints,
        })
        updateTotal([])
    }

    function storeToLocal(name: string) {
        const listPosition = storedLists.indexOf(name)
        if (save.units.length > 0) {
            saveByName(save, name)
            if (listPosition == -1) {
                const newLists = [...storedLists, name]
                setStoredList(newLists)
                saveLists(newLists)
            }
        } else {
            if (listPosition != -1) {
                const newLists = storedLists.filter(item => item != name)
                setStoredList(newLists)
                saveLists(newLists)
            }
            removeByName(name)
        }
    }

    function loadFromLocal(loadName: string) {
        const load = loadByName(loadName)
        if (load.units.length > 0) {
            setSave(load)
            updateTotal(load.units)
        } else {
            console.log("Loaded empty list... " + loadName)
        }
    }

    function exportExternal(name: string, format: string) {
        switch (format) {
            case "jeff":
                exportJeffsJson(`${name}`, save.units)
                break
            case "tts":
                exportTTSString(name, save.units)
                break
        }
    }

    const count = save.units.length

    const unitList = () => {
        if (visible) {
            return (
                <>
                    <div className="fixed bg-inherit top-20 bottom-20 max-xl:inset-x-[1%] xl:inset-x-[10%] 2xl:inset-x-[20%] z-10 border border-red-500 items-center text-center">
                        <BuilderHeader constraints={save.constraints} count={count} total={total} onClose={() => setVisible(false)} />
                        <div className="w-full flex">
                            <span className="mr-1 flex-none">Name: </span>
                            <input className="inline flex-1 h-5 p-0 overflow-hidden" type='text' onChange={e => setName(e.target.value)} value={name} />
                        </div>
                        {save.units.map(u => <ListLine key={u.ordinal} unit={u} onRemove={removeUnit} onUpdate={updateTotal} />)}
                        <div className="absolute bottom-0 w-full bg-inherit grid grid-cols-1">
                            <ShareLink constraints={constraints} name={name} total={total} units={save.units} />
                            <BuilderFooter
                                listName={name}
                                storedLists={storedLists}
                                onClear={clear}
                                onSave={storeToLocal}
                                onLoad={loadFromLocal}
                                onExport={exportExternal}
                                onSelect={(name: string) => setName(name)} />
                        </div>
                    </div>
                </>
            )
        } else {
            return <></>
        }
    }

    onCreate(addUnit)

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

