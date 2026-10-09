'use client'
import ShareLink from '@/app/(utilities)/share/shareLink';
import { useCombinations } from '@/components/combinations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ISelectedUnit, Save, WORK_IN_PROGRESS_NAME, groupByLance, loadBuilderIdentity, totalPV } from '../../../api/unitListApi';
import PlayLink from '../../../components/playLink';
import { ListLine } from './ListLine';
import { ListBuilderController, useBuilderContext } from './listBuilderController';
import useNameDialog from './saveDialog';
import { useSession } from 'next-auth/react';

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
    serverKey,
    controller,
}: {
    units: ISelectedUnit[],
    total: number,
    constraints: string,
    listName: string,
    serverKey: string | null,
    controller: ListBuilderController,
}) {
    const {data: session, status} = useSession()
    const router = useRouter()

    const loggedIn = session?.externalAccount != undefined || status === "authenticated"
    const savedOnServer = serverKey != null
    const displayName = savedOnServer ? listName : WORK_IN_PROGRESS_NAME

    const [cmbBtn, cmbDlg] = useCombinations(units, <>Sub-lists</>, 'btn text-center w-full btn-sm')
    const [saveAsBtn, saveAsDlg] = useNameDialog({
        id: 'dlg-save-as',
        label: 'Save as',
        confirmLabel: 'Save as',
        initialName: savedOnServer ? listName : '',
        onConfirm: (name) => controller.saveAs(name),
    })
    const [rememberBtn, rememberDlg] = useNameDialog({
        id: 'dlg-remember',
        label: 'Remember for later',
        confirmLabel: 'Remember for later',
        initialName: savedOnServer ? listName : '',
        onConfirm: (name) => controller.remember(name),
    })

    async function onSave(event: React.MouseEvent<HTMLButtonElement>) {
        event.currentTarget.blur()
        const error = await controller.overwrite()
        if (error) alert(error)
    }

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
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64">
                    <li><button className="btn text-center w-full btn-sm" onClick={e => {
                        controller.clear()
                        e?.currentTarget.blur()
                    }}>Clear</button></li>
                    {loggedIn && savedOnServer ? <li><button className="btn text-center w-full btn-sm" onClick={onSave}>Save</button></li> : null}
                    {loggedIn ? <li>{saveAsBtn}</li> : null}
                    <li>{rememberBtn}</li>
                    <li><Link href="/user" className="btn text-center w-full btn-sm">Load</Link></li>
                    <li><button className="btn text-center w-full btn-sm" onClick={e => {
                        router.push("/validate/result?" + controller.toValidateParams().toString())
                        e?.currentTarget.blur()
                    }}>Validate</button></li>
                </ul>
            </div>
            <div className="dropdown dropdown-top dropdown-end h-full text-center items-center">
                <div tabIndex={0} role="button" className="button-link w-full h-full text-center items-center align-middle flex"><div className='m-auto'>Export</div></div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><ShareLink constraints={constraints} name={displayName} total={total} units={units} eraId={controller.getEraId()} factionId={controller.getFactionId()} className='btn text-center w-full btn-sm' /></li>
                    <li><Link href="/tts/" target="_blank" className="btn text-center w-full btn-sm" onClick={e => controller.exportExternal(listName, "tts")}>TTS</Link></li>
                </ul>
            </div>
            {saveAsDlg}
            {rememberDlg}
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
    const identity = loadBuilderIdentity()
    const [name, setName] = useState(identity.name)
    const [serverKey, setServerKey] = useState<string | null>(identity.serverKey)
    const [save, setSave] = useState<Save>(controller.getSave())
    const [total, setTotal] = useState(totalPV(save.units))
    const [storedLists, setStoredLists] = useState(controller.getStoredLists())

    controller.registerBuilder(
        setSave,
        setName,
        setTotal,
        setStoredLists,
        setServerKey,
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
                        <input
                            className="inline flex-1 h-5 p-0 overflow-hidden bg-transparent"
                            type='text'
                            readOnly={serverKey == null}
                            aria-readonly={serverKey == null}
                            value={serverKey == null ? WORK_IN_PROGRESS_NAME : name}
                            onChange={e => {
                                setName(e.target.value)
                                controller.rename(e.target.value)
                            }}
                        />
                    </div>
                    <Lines save={save} controller={controller} />
                    <div className="flex-none w-full bg-inherit grid grid-cols-1">
                        <BuilderFooter
                            units={save.units}
                            total={total}
                            constraints={controller.getConstraints()}
                            listName={name}
                            serverKey={serverKey}
                            controller={controller} />
                    </div>
                </div>
            </div>
        </>
    )
}