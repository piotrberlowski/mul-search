import { getUnits } from '@/../lib/units/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const factionId = Number(url.searchParams.get('factionId'))
  const eraId = Number(url.searchParams.get('eraId'))
  const typeIds = url.searchParams.getAll('typeId').map(Number).filter(Number.isFinite)

  if (!Number.isFinite(factionId) || !Number.isFinite(eraId)) {
    return Response.json({ error: 'factionId and eraId are required' }, { status: 400 })
  }

  const units = await getUnits({
    factionId,
    eraId,
    typeIds: typeIds.length ? typeIds : undefined,
  })
  return Response.json(units)
}
