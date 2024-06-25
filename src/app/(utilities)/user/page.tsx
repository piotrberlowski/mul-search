import { auth, signOut } from "@/app/auth"
 
export function SignOut() {
    return (
      <form
        action={async () => {
          "use server"
          await signOut()
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    )
  }

export default async function Page() {
  const session = await auth()
  if (!session) return <div>Not authenticated</div>
 
  return (
    <div>
        <div>
            <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
        <SignOut/>
    </div>
  )
}