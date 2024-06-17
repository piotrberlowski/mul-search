import { Suspense } from "react"
import { fetchFactions } from '@/app/data'
import SearchForm from './searchForm'
import Link from "next/link"

function CsrFallback() {
  return <>Executing your search...</>
}

function Intro() {
  return (
    <>
      <div className="mb-5">
        <p className="my-1">
          This tool supports the list building flow of the <a href="https://wolfsdragoons.com/alpha-strike-core-tournament-rules-2/">Wolf Net Alpha Strike 350 format</a>.
        </p>
        <p>
          <Link href="/validate">Navigate here to validate lists from MasterUnitList</Link>
        </p>
        <p>
          To start working on your list, please:
        </p>
        <ul className="list-disc ml-5">
          <li>select a faction to play</li>
          <li>select the availability era for your units</li>
          <li>select the applicable &quot;general list&quot; for your faction in your era</li>
        </ul>
        <p className="my-1">
          Once you have the faction and era selected, the tool <b>will</b> give you a link which you can follow to see which general list is relevant.
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
        <SearchForm factions={factions} />
      </Suspense>
      <Footnote />
    </main>
  )
}
