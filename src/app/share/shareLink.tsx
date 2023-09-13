import { ISelectedUnit } from "../unitListApi";
import { exportShare } from "./shareApi";
import Link from "next/link";

export default function ShareLink({name, total, units}:{name:string, total: number, units:ISelectedUnit[]}) {
    const params = new URLSearchParams("")
    params.set('list', exportShare(name, total, units))
    return (
        <div className="w-full text-center items-center border border-solid dark:border-white border-black">
            <Link href={`/share/?${params.toString()}`} target="_blank">Show List</Link>
        </div>
    )
}