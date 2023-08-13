import SearchForm from './searchForm'
import ResultContainer from './resultContainer'
import { fetchFactions } from './data'
import { Suspense } from "react"

function ResultsPlaceholder() {
  return <>Executing your search...</>
}

function FormPlaceholder() {
  return <>Your search will be ready in a second...</>
}

export default async function Home() {

  const factions = await fetchFactions()

  return (
    <main className="items-center align-top bg-inherit">
      <Suspense fallback={<FormPlaceholder/>}>
        <SearchForm factions={factions} />
      </Suspense>
      <Suspense fallback={<ResultsPlaceholder />}>
        <ResultContainer />
      </Suspense>
    </main>
  )
}
