import { deleteListByKey, findListsByCurrentUser } from "@/app/api/dao/lists"
import { auth, signOut } from "@/app/auth"
import Link from "next/link"
import DeleteButton from "./deleteButton"

export default async function Page() {
  const session = await auth()
  if (!session) return <div>Not authenticated</div>

  const lists = await findListsByCurrentUser()

  if (typeof lists === "string") {
    return (<div role="alert" className="alert alert-error">{lists}</div>)
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Total PV</th>
          <th>Constraints</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {
          lists.map(list => (
            <tr key={list.key}>
              <th>{list.name}</th>
              <td>{list.total}</td>
              <td>{list.constraints}</td>
              <td>
                <div className="flex gap-1">
                  <Link className="btn btn-outline btn-xs flex-1" href={`/share?key=${list.key}`}>View</Link>
                  <DeleteButton className="btn btn-outline btn-xs flex-1" listKey={list.key}/>
                </div>
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}