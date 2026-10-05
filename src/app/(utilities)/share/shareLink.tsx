import { ISelectedUnit } from "@/api/unitListApi";
import { exportShare } from "@/api/shareApi";
import Link from "next/link";

export default function ShareLink({constraints, name, total, units, eraId, factionId, className}:{constraints: string, name:string, total: number, units:ISelectedUnit[], eraId?: number | null, factionId?: number | null, className?: string}) {
    const params = new URLSearchParams("")
    params.set('list', exportShare(name, total, units))
    params.set('constraints', constraints)
    if (eraId != null) params.set('era', String(eraId))
    if (factionId != null) params.set('specific', String(factionId))
    return (
        <div className={className || "w-full text-center items-center border border-solid dark:border-white border-black"}>
            <Link href={`/share/?${params.toString()}`} target="_blank">Share/Print</Link>
        </div>
    )
}