import { Suspense } from "react"
import { fetchFactions } from "@/app/data"
import ValidateForm from "./validateForm"
import {  ChevronDoubleRightIcon, ChevronDownIcon  } from "@heroicons/react/24/outline"

function CsrFallback() {
  return <>Executing your search...</>
}

function Intro() {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="mb-5 mx-auto flex-0">
        <p className="my-1">
          This is a validator for lists in <a href="https://wolfsdragoons.com/alpha-strike-core-tournament-rules-2/">Wolf Net Alpha Strike 350 format</a>.
        </p>
        <div className="flex items-center">
          <ChevronDoubleRightIcon className="h-5 w-5 my-2 flex-none"/> Please select the following list attributes:
        </div>
        <ul className="list-disc ml-10">
          <li>faction</li>
          <li>availability era</li>
          <li>&quot;general list&quot;</li>
        </ul>
        <ChevronDownIcon className="h-5 w-5 my-1"/>
        <p className="ml-5">
          Manually verify if the general list is applicable based on the provided link.
        </p>
        <ChevronDownIcon className="h-5 w-5 my-1"/>
        <p className="ml-5">
          Upload the Master Unit List PDF.
        </p>
      </div>
    </div>
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
