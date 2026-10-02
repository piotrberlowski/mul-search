import { getFactionsForUi } from '@/../lib/units/queries'
import { Suspense } from "react"
import BuilderApp from './builderApp'

function CsrFallback() {
  return <>Executing your search...</>
}

export default async function Home() {

  const factions = await getFactionsForUi()

  return (
    <main className="relative items-center align-top bg-inherit">
      <Suspense fallback={<CsrFallback />}>
          <BuilderApp factions={factions} />
      </Suspense>
    </main>
  )
}
