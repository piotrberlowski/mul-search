'use client'
import ShareLink from '@/app/(utilities)/share/shareLink';
import { useCombinations } from '@/components/combinations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ISelectedUnit, LOCAL_STORAGE_NAME_AUTOSAVE, Save, groupByLance, totalPV } from '../../../api/unitListApi';
import PlayLink from '../../../components/playLink';
import { ListLine } from './ListLine';
import { ListBuilderController, useBuilderContext } from './listBuilderController';
import { useListValidation } from './useListValidation';
import useLoadDialog from './loadDialog';
import useSaveDialog from './saveDialog';
import { SessionProvider, useSession } from 'next-auth/react';
import { ValidationWarning } from './validationWarning';
import { useListSearch } from './searchQuery';

function BuilderHeader({ controller, messages, listFailed, children }: { controller: ListBuilderController, messages: string[], listFailed: boolean, children: React.ReactNode }) {
    const units = controller.getUnits()
    const { constraints } = useListSearch()
    const summaryClass = listFailed ? "!bg-error !text-error-content" : ""
    return (
        <>
            <div className="w-full flex max-h-fit">
                <div className="w-full text-center font-bold max-md:text-xs mx-auto xl:hidden">{constraints}</div>
                {children}
            </div>
            <div className="w-full flex-0 flex">
                <div className={`relative z-30 w-full flex max-h-fit items-center ${summaryClass}`}>
                    <div className="text-center flex-1 max-h-fit">Units: {units.length}</div>
                    <div className="text-center flex-1 max-h-fit inline-flex items-center justify-center gap-1">
                        <span>PV: {totalPV(units)}</span>
                        <ValidationWarning messages={messages} />
                    </div>
                </div>
            </div>
        </>
    )
}

function BuilderFooter({
    units,
    total,
    listName,
    controller,
}: {
    units: ISelectedUnit[],
    total: number,
    listName: string,
    controller: ListBuilderController,
}) {
    const { constraints, eraId, factionId } = useListSearch()
    const {data: session, status} = useSession()
    const router = useRouter()

    console.log(`Status: ${status}`)

    const loggedIn = session?.externalAccount != undefined || status === "authenticated"

    const [cmbBtn, cmbDlg] = useCombinations(units, <>Sub-lists</>, 'btn text-center w-full btn-sm')
    const [loadBtn, loadDlg] = useLoadDialog({
        name: listName, 
        controller: controller,
        loggedIn: loggedIn,
    }, (<>Load</>))
    const [saveBtn, saveDlg] = useSaveDialog({
        name: listName,
        controller: controller,
        loggedIn: loggedIn,
    }, (<>Save</>))

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
                        controller.clear({ constraints, eraId, factionId })
                        e?.currentTarget.blur()
                    }}>Clear</button></li>
                    <li>{saveBtn}</li>
                    <li>{loadBtn}</li>
                    <li><button className="btn text-center w-full btn-sm" onClick={e => {
                        router.push("/validate/result?" + controller.toValidateParams(eraId, factionId).toString())
                        e?.currentTarget.blur()
                    }}>Validate</button></li>
                </ul>
            </div>
            <div className="dropdown dropdown-top dropdown-end h-full text-center items-center">
                <div tabIndex={0} role="button" className="button-link w-full h-full text-center items-center align-middle flex"><div className='m-auto'>Export</div></div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><ShareLink constraints={constraints} name={listName} total={total} units={units} eraId={eraId} factionId={factionId} className='btn text-center w-full btn-sm' /></li>
                    <li><Link href="/tts/" target="_blank" className="btn text-center w-full btn-sm" onClick={e => controller.exportExternal(listName, "tts")}>TTS</Link></li>
                </ul>
            </div>
            {loadDlg}
            {saveDlg}
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

function Lines({ save, controller, errorsByOrdinal }: { save: Save, controller: ListBuilderController, errorsByOrdinal: Record<number, string[]> }) {
    const lances = groupByLance(save.units)

    return (
        <div className="w-full flex-1 h-full overflow-auto overscroll-none striped px-2">
            {
                Array.from(lances).flatMap(([lid, units]) => [
                    <UnitsHeader key={`lance-header-${lid}`} lid={`Lance: ${lid || 'default'}`} units={units} />,
                    ...units.map(u => <ListLine key={u.ordinal} unit={u} controller={controller} errors={errorsByOrdinal[u.ordinal]} />)
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

    const validation = useListValidation(save.units)

    return (
        <>
            <div className="flex-1 flex flex-col h-full pb-5 px-1">
                <div className="flex-1 border border-red-500 flex flex-col bg-white dark:bg-base-200 flex flex-col h-full">
                    <BuilderHeader controller={controller} messages={validation.messages} listFailed={validation.listMessages.length > 0}>
                        {children}
                    </BuilderHeader>
                    <div className="flex-none w-full flex px-2">
                        <span className="mr-1 flex-none">Name: </span>
                        <input className="inline flex-1 h-5 p-0 overflow-hidden" type='text' onChange={e => setName(e.target.value)} value={name} />
                    </div>
                    <Lines save={save} controller={controller} errorsByOrdinal={validation.errorsByOrdinal} />
                    <div className="flex-none w-full bg-inherit grid grid-cols-1">
                        <BuilderFooter
                            units={save.units}
                            total={total}
                            listName={name}
                            controller={controller} />
                    </div>
                </div>
            </div>
        </>
    )
}