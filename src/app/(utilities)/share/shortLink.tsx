import Link from "next/link";
import React from "react";

export default function ShortLink({listKey, className, children}:{listKey:string, className?:string, children: React.ReactNode}) {
    const params = new URLSearchParams("")
    params.set('key', listKey)
    return (
        <div className={className || "w-full text-center items-center border border-solid dark:border-white border-black"}>
            <Link href={`/share/?${params.toString()}`} target="_blank">{children}</Link>
        </div>
    )
}