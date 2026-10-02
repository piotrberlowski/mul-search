import { getFactionsForUi } from '@/../lib/units/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  const factions = await getFactionsForUi()
  return Response.json(factions)
}
