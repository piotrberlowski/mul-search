import Link from "next/link";
import getConfig from 'next/config';
import { Bars3CenterLeftIcon } from "@heroicons/react/24/outline";
const { publicRuntimeConfig } = getConfig();

export default function Navigation({className}:{className?: string}) {
    return (
        <div className={`navbar bg-base-100 ${className} flex print:hidden`}>
            <div className="flex-0">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <Bars3CenterLeftIcon className="h-4 w-4" />
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li><Link href="/">Search/Builder</Link></li>
                        <li><Link href="/validate">AS350 Validator</Link></li>
                        <li><Link href="/library">List Library</Link></li>
                    </ul>
                </div>
                <Link className="btn btn-ghost text-xl flex-0" href="/">List Builder for AS ({publicRuntimeConfig?.version})</Link>
            </div>
            <div className="flex-1 hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><Link href="/">Search/Builder</Link></li>
                    <li><Link href="/validate">AS350 Validator</Link></li>
                    <li><Link href="/library">List Library</Link></li>
                </ul>
            </div>
        </div>
    )
}
