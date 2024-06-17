import { Suspense } from "react"
import { fetchFactions } from "@/app/data"
import ValidateForm from "./validateForm"

function CsrFallback() {
  return <>Executing your search...</>
}

function Intro() {
  return (
    <>
      <div className="mb-5">
        <p className="my-1">
          This is a validator for lists in <a href="https://wolfsdragoons.com/alpha-strike-core-tournament-rules-2/">Wolf Net Alpha Strike 350 format</a>.
        </p>
        <p>
          Please select the following list attributes:
        </p>
        <ul className="list-disc ml-5">
          <li>faction</li>
          <li>availability era</li>
          <li>&quot;general list&quot;</li>
        </ul>
        <p className="my-1">
          Manually verify if the general list is applicable based on the provided link.
        </p>
        <p className="my-1">
           Upload the Master Unit List PDF.
        </p>
      </div>
    </>
  )
}

function Footnote() { 
  return (
    <div className="text-xs w-100 mt-5">
      <p className="my-1">
        This tool is developed by the community - for the community. It comes with no warranty and makes no claim to ownership to any of Catalyst Game Labs or The Topps Company, Inc properties.
      </p>
      <p className="my-1">
        MechWarrior, BattleMech, ‘Mech and AeroTech are registered trademarks of The Topps Company, Inc. All Rights Reserved.
      </p>
    </div>
  )
}

export default async function Home() {

  const factions = await fetchFactions()

  return (
    <main className="relative items-center align-top bg-inherit">
      <Intro />
      <Suspense fallback={<CsrFallback />}>
        <ValidateForm factions={factions} />
      </Suspense>
      <Footnote />
    </main>
  )
}
