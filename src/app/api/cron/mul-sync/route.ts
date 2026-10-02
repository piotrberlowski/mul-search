import { syncMul } from '@/../lib/mul/sync'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const result = await syncMul({
    timeBudgetMs: 250_000,
    scrapeDelayMs: 10_000,
  })
  const status = result.status === 'failed' ? 500 : 200
  return Response.json(result, { status })
}
