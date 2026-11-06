import { findListsByCurrentUser } from "@/app/api/dao/lists"
import { auth } from "@/app/auth"
import ListsView, { SavedListSummary } from "./listsView"

function listsPage(loggedIn: boolean, savedLists: SavedListSummary[], savedError: string | null) {
  return (
    <main className="relative items-center align-top bg-inherit">
      <ListsView loggedIn={loggedIn} savedLists={savedLists} savedError={savedError} />
    </main>
  )
}

export default async function Page() {
  return auth().then(session => {
    const loggedIn = Boolean(session?.externalAccount)
    if (!loggedIn) return listsPage(false, [], null)
    return findListsByCurrentUser().then(lists => {
      if (typeof lists === "string") return listsPage(true, [], lists)
      return listsPage(true, lists, null)
    })
  })
}
