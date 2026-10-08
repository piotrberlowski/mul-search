import { ISelectedUnit } from "@/api/unitListApi";
import { shareQuery } from "@/api/shareApi";
import Link from "next/link";

export default function ShareLink({constraints, name, total, units, eraId, factionId, className}:{constraints: string, name:string, total: number, units:ISelectedUnit[], eraId?: number | null, factionId?: number | null, className?: string}) {
    const params = shareQuery({ name, total, units, constraints, eraId, factionId })
    return (
        <div className={className || "w-full text-center items-center border border-solid dark:border-white border-black"}>
            <Link href={`/share/?${params.toString()}`} target="_blank">Print</Link>
        </div>
    )
}
