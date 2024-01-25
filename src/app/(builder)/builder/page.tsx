import { fetchFactions } from '../data'
import { Suspense } from "react"
import CsrPage from './csrPage'

function CsrFallback() {
  return <>Executing your search...</>
}

export default async function Home() {

  const factions = await fetchFactions()

  return (
    <main className="relative items-center align-top bg-inherit">
      <Suspense fallback={<CsrFallback/>}>
        <CsrPage factions={factions} />
      </Suspense> 
    </main>
  )
}
