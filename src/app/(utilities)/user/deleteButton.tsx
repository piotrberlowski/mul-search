'use client'

import { deleteListByKey } from "@/app/api/dao/lists"
import { useRouter } from "next/navigation"

export default function DeleteButton({listKey, className}:{listKey:string, className?:string}) {
    const router = useRouter()
    console.log(`rendering delete for ${listKey}`)
    return (
    <button className={className} onClick={() => {
        deleteListByKey(listKey).then(() => router.refresh())
      }
      }>Delete</button>
    )
}