'use client'
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ConditionalSignInOut() {
    const {data: session, status} = useSession()
    const router = useRouter()
    
    if (!session?.externalAccount)
        return (<button className="btn btn-sm btn-ghost" onClick={() => signIn().then(()=>router.refresh()).catch(e => console.log(e))}>Sign In</button>)
    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                {session.user?.name}
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] shadow bg-base-100 rounded-box w-52">
                <li>
                    <Link className="btn btn-sm btn-outline" href="/user/">Lists</Link>
                </li>
                <li className="w-full p-0"><button className="btn btn-sm btn-ghost" onClick={() => {
                    signOut().then(() => router.refresh()).catch(e => console.log(e));
                }
                }>Sign Out</button></li>
            </ul>
        </div>
    )
}

export function SignIn() {
    return (
        <ConditionalSignInOut />
    )
}