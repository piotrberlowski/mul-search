import { resolveLegacy } from '@/../lib/units/queries'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const ids = Array.isArray(body?.ids) ? body.ids : []
  const resolved = await resolveLegacy(ids)
  return Response.json(Object.fromEntries(resolved))
}
