import { parametersDao } from '@/app/api/dao/parametersDao'

export const dynamic = 'force-dynamic'

export async function GET() {
  const factions = await parametersDao.getFactions()
  return Response.json(factions)
}
