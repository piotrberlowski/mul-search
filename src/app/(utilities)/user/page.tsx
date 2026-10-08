import { findListsByCurrentUser } from "@/app/api/dao/lists"
import { auth } from "@/app/auth"
import ListsView, { SavedListSummary } from "./listsView"

export default async function Page() {
  const session = await auth()
  const loggedIn = Boolean(session?.externalAccount)
  let savedLists: SavedListSummary[] = []
  let savedError: string | null = null

  if (loggedIn) {
    const lists = await findListsByCurrentUser()
    if (typeof lists === "string") savedError = lists
    else savedLists = lists
  }

  return (
    <main className="relative items-center align-top bg-inherit">
      <ListsView loggedIn={loggedIn} savedLists={savedLists} savedError={savedError} />
    </main>
  )
}
