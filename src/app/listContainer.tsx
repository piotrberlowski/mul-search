'use client'
import { useState, useCallback } from 'react'
import { IUnit } from './unitLine';
import { AddUnitCallback, ISelectedUnit, toJeffsUnits } from './unitListApi';
import { createPortal } from 'react-dom';

const LOCAL_STORAGE_KEY = 'alphaStrikeLists'
const LOCAL_STORAGE_LIST_KEY_PREFIX = 'alphaStrikeList_'
const LOCAL_STORAGE_NAME_AUTOSAVE = 'autosave'

function currentPV(unit: ISelectedUnit) {
    var multiplier = 0;
    if (unit.skill < 4) {
        if (unit.BFPointValue < 8)
            multiplier = (4 - unit.skill);
        else
            multiplier = (4 - unit.skill) * Math.ceil((Math.max((unit.BFPointValue - 7), 1) / 5) + 1);
    } else {
        if (unit.BFPointValue < 15)
            multiplier = -(unit.skill - 4);
        else
            multiplier = -((unit.skill - 4) * Math.ceil(((unit.BFPointValue - 14) / 10.0) + 1));
    }
    return (Math.max(unit.BFPointValue + multiplier, 1))
}

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
            <div id={"line-"+unit.ordinal} className="col-span-3 text-left">
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

function BuilderHeader({ count, total, onClose }: { count: number, total: number, onClose: () => void }) {
    return (
        <div className="w-full">
            <div className="grid grid-cols-2 w-full">
                <div className="text-center">Units: {count}</div>
                <div className="text-center">Total PV: {total}</div>
            </div>
            <button className="absolute right-0 top-0 border border-solid px-1 border-red-500 w-5" onClick={e => onClose()}>X</button>
        </div>
    )
}

function BuilderFooter({ storedLists,
    onClear,
    onSave,
    onLoad,
    onExport
}: {
    storedLists: string[],
    onClear: () => void,
    onSave: (name: string) => void,
    onLoad: (name: string) => void,
    onExport: (name: string) => void,
}) {
    const [listName, setListName] = useState("")
    const [selectedList, setSelectedList] = useState<string>("")
    return (
        <div className="absolute bottom-0 w-full bg-inherit grid grid-cols-4 items-center text-center">
            <button className="h-full" onClick={e => onClear()}>Clear</button>
            <div className="mx-1">
                <div className="flex">
                    <span className="mr-1 flex-none">Name: </span>
                    <input className="inline flex-1 h-5 p-0 overflow-hidden" type='text' onChange={e => setListName(e.target.value)} value={listName} />
                </div>
                <button onClick={
                    e => {
                        onSave(listName)
                        setSelectedList(listName)
                    }
                }>Save</button>
            </div>
            <div className="mx-1">
                <div className="flex">
                    <span className="flex-none mr-1">Pick:</span>
                    <select className="inline flex-1 overflow-hidden" value={selectedList} onChange={
                        e => {
                            setSelectedList(e.target.value)
                            setListName(e.target.value)
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
                    setListName(selectedList)
                }
                }>Load</button>
            </div>
            <button className="mx-1 h-full" onClick={e => {
                onExport(listName)
            }
            }>Export to Jeff&apos;s Tools</button>
        </div>
    )

}

function totalPV(units: ISelectedUnit[]): number {
    return units.map(u => currentPV(u)).reduce((p, n) => p + n, 0)
}

function loadLists(): string[] {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]")
}

function saveLists(lists: string[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists))
}

function compactOrdinals(units: ISelectedUnit[]) {
    units.forEach((u, idx) => u.ordinal = idx)
}

function loadByName(name: string): ISelectedUnit[] {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const result = localStorage.getItem(listKey)
    const units = JSON.parse(result || "[]")
    compactOrdinals(units)
    console.log("Loaded list %s (%d units)", listKey, units.length)
    return units
}

function saveByName(units: ISelectedUnit[], name: string) {
    const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
    const unitList = JSON.stringify(units)
    localStorage.setItem(listKey, unitList)
    console.log("Saved list %s (%d units)", listKey, units.length)
}

function exportData(name: string, units: ISelectedUnit[]) {
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

export default function ListBuilder({ onCreate }: { onCreate: (cb: AddUnitCallback) => void }) {
    const [visible, setVisible] = useState(false)
    const [units, setUnits] = useState<ISelectedUnit[]>(loadByName(LOCAL_STORAGE_NAME_AUTOSAVE))
    const [total, setTotal] = useState(totalPV(units))
    const [storedLists, setStoredList] = useState(loadLists())

    function addUnit(unit: IUnit) {
        const ord = (units.length == 0) ? 0 : Math.max(...units.map(u => u.ordinal)) + 1
        const selected = {
            ordinal: ord,
            skill: 4,
            ...unit
        }
        const newUnits = [...units, selected]
        setUnits(newUnits)
        updateTotal(newUnits)
    }

    function removeUnit(ord: number) {
        console.log("Removing unit: " + ord)
        const newUnits = units.filter(u => u.ordinal != ord)
        console.log("previous length: " + units.length + " Current length:" + newUnits.length)
        setUnits(newUnits)
        updateTotal(newUnits)
    }

    function updateTotal(optionalUnits?: ISelectedUnit[]) {
        let subject = optionalUnits || units
        setTotal(totalPV(subject))
        saveByName(subject, LOCAL_STORAGE_NAME_AUTOSAVE)
    }

    function clear() {
        setUnits([])
        updateTotal([])
    }

    function storeToLocal(name: string) {
        const listPosition = storedLists.indexOf(name)
        if (units.length > 0) {
            saveByName(units, name)
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
            const listKey = LOCAL_STORAGE_LIST_KEY_PREFIX + name
            localStorage.removeItem(listKey)
        }
    }

    function loadFromLocal(name: string) {
        const selectedUnits = loadByName(name)
        if (selectedUnits.length > 0) {
            setUnits(selectedUnits)
            updateTotal(selectedUnits)
        } else {
            console.log("Loaded empty list... " + name)
        }
    }

    function exportToJeffs(name: string) {
        exportData(name, units)
    }

    const count = units.length

    const unitList = () => {
        if (visible) {
            return (

                <div className="fixed bg-inherit top-20 bottom-20 max-xl:inset-x-[1%] xl:inset-x-[10%] 2xl:inset-x-[20%] z-10 border border-red-500 items-center text-center">
                    <BuilderHeader count={count} total={total} onClose={() => setVisible(false)} />
                    {units.map(u => <ListLine key={u.ordinal} unit={u} onRemove={removeUnit} onUpdate={updateTotal} />)}
                    <BuilderFooter storedLists={storedLists} onClear={clear} onSave={storeToLocal} onLoad={loadFromLocal} onExport={exportToJeffs} />
                </div>
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
                    <div className="fixed w-full top-2 left-0">
                        <div className="max-w-screen-lg mx-auto items-right">
                            <div className="float-right grid grid-cols-2 w-40 text-xs bg-red-500 text-white hover:text-black text-center border border-black-500 dark:border-white-500" onClick={(e) => setVisible(v => !v)}>
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

