import { parametersDao } from '@/app/api/dao/parametersDao'
import { Suspense } from "react"
import BuilderApp from './builderApp'

function CsrFallback() {
  return <>Executing your search...</>
}

export default async function Home() {

  const [factions, eras, factionsByEra, unitTypes] = await Promise.all([
    parametersDao.getFactions(),
    parametersDao.getEras(),
    parametersDao.getFactionsByEra(),
    parametersDao.getUnitTypes(),
  ])

  return (
    <main className="relative items-center align-top bg-inherit">
      <Suspense fallback={<CsrFallback />}>
          <BuilderApp factions={factions} eras={eras} factionsByEra={factionsByEra} unitTypes={unitTypes} />
      </Suspense>
    </main>
  )
}
