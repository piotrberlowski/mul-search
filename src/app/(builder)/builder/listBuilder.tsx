'use client'
import { useCombinations } from '@/components/combinations';
import Link from 'next/link';
import { useState } from 'react';
import { ISelectedUnit, IUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, groupByLance, loadByName, loadLists, totalPV } from '../../../api/unitListApi';
import PlayLink from '../../../components/playLink';
import ShareLink from '@/app/(utilities)/share/shareLink';
import { ListLine } from './ListLine';
import { ListBuilderController, useBuilderContext } from './listBuilderController';
import useLoadDialog from './loadDialog';
import { useRouter } from 'next/navigation';
import { Factions, fetchFactions } from '@/app/data';

function BuilderHeader({ controller, children }: { controller: ListBuilderController, children: React.ReactNode }) {
    const units = controller.getUnits()
    const constraints = controller.getConstraints()
    return (
        <>
            <div className="w-full flex max-h-fit">
                <div className="w-full text-center font-bold max-md:text-xs mx-auto xl:hidden">{constraints}</div>
                {children}
            </div>
            <div className="w-full flex-0 flex">
                <div className="w-full flex max-h-fit">
                    <div className="text-center flex-1 max-h-fit">Units: {units.length}</div>
                    <div className="text-center flex-1 max-h-fit">PV: {totalPV(units)}</div>
                </div>
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

    const router = useRouter()

    const [cmbBtn, cmbDlg] = useCombinations(units, <>Sub-lists</>, 'btn text-center w-full btn-sm')
    const [loadBtn, loadDlg] = useLoadDialog(listName, controller, (<>Load</>))

    return (
        <div className="bg-inherit grid grid-cols-3 items-center text-center w-full text-xs md:text-sm lg:text-base h-12 md:h-8">
            <div className="dropdown dropdown-top dropdown-start h-full text-center items-center">
                <div tabIndex={0} role="button" className="button-link w-full h-full text-center items-center align-middle flex"><div className='m-auto'>Play</div></div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>{cmbBtn}</li>
                    <li><PlayLink units={units} className='btn text-center w-full btn-sm'>Play View</PlayLink></li>
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
                    <li><button className="btn text-center w-full btn-sm" onClick={e => {
                        fetchFactions()
                            .then(f => new Factions(f))
                            .then(f => controller.toValidateParams(f))
                            .then(p => router.push("/validate/result?" + p.toString()))
                            .catch(err => {
                                console.log(err)
                                e?.currentTarget.blur()
                            })
                    }}>Validate</button></li>
                </ul>
            </div>
            <div className="dropdown dropdown-top dropdown-end h-full text-center items-center">
                <div tabIndex={0} role="button" className="button-link w-full h-full text-center items-center align-middle flex"><div className='m-auto'>Export</div></div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><ShareLink constraints={constraints} name={listName} total={total} units={units} className='btn text-center w-full btn-sm' /></li>
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
        <div className="w-full flex-1 h-full overflow-auto overscroll-none striped px-2">
            {
                Array.from(lances).flatMap(([lid, units]) => [
                    <UnitsHeader key={`lance-header-${lid}`} lid={`Lance: ${lid || 'default'}`} units={units} />,
                    ...units.map(u => <ListLine key={u.ordinal} unit={u} controller={controller} />)
                ])
            }
        </div>
    )
}

export default function ListBuilder({ children }: { children: React.ReactNode }) {
    const controller: ListBuilderController = useBuilderContext()
    const [name, setName] = useState(LOCAL_STORAGE_NAME_AUTOSAVE)
    const [save, setSave] = useState<Save>(controller.getSave())
    const [total, setTotal] = useState(totalPV(save.units))
    const [storedLists, setStoredLists] = useState(controller.getStoredLists())

    controller.registerBuilder(
        setSave,
        setName,
        setTotal,
        setStoredLists,
    )

    const count = save.units.length

    return (
        <>
            <div className="flex-1 flex flex-col h-full pb-5 px-1">
                <div className="flex-1 border border-red-500 flex flex-col bg-white dark:bg-base-200 flex flex-col h-full">
                    <BuilderHeader controller={controller} >
                        {children}
                    </BuilderHeader>
                    <div className="flex-none w-full flex px-2">
                        <span className="mr-1 flex-none">Name: </span>
                        <input className="inline flex-1 h-5 p-0 overflow-hidden" type='text' onChange={e => setName(e.target.value)} value={name} />
                    </div>
                    <Lines save={save} controller={controller} />
                    <div className="flex-none w-full bg-inherit grid grid-cols-1">
                        <BuilderFooter
                            units={save.units}
                            total={total}
                            constraints={controller.getConstraints()}
                            listName={name}
                            controller={controller} />
                    </div>
                </div>
            </div>
        </>
    )
}