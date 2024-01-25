import { Card } from "@/api/card";
import { UNITS_KEY } from '@/api/playApi';
import { ISelectedUnit, currentPV } from "@/api/unitListApi";
import Link from "next/link";

export default function PlayLink({ units, children, className }: { children: React.ReactNode, units: ISelectedUnit[], className?: string }) {
    const prep = () => {
        const cards = units.map<Card>((u) => {return {...u, MyId: u.ordinal, MySkill: u.skill, MyCalculatedPointValue: currentPV(u)}})
        localStorage.setItem(UNITS_KEY, JSON.stringify(cards));
    }

    return (
        <Link target="_blank" prefetch={false} href="/play" onClick={()=>prep()} className={className}>
            {children}
        </Link>
    )
}