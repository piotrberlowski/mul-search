import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { MUL_ORIGIN, MUL_USER_AGENT } from './types'

const execFileAsync = promisify(execFile)
const STATUS_MARK = '\n__STATUS__:'

export class MulHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message)
    this.name = 'MulHttpError'
  }
}

function resolveUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http') ? pathOrUrl : new URL(pathOrUrl, MUL_ORIGIN).toString()
}

async function fetchWithCurl(url: string): Promise<Response> {
  const { stdout } = await execFileAsync('curl', [
    '-sS',
    '-L',
    '--compressed',
    '-A', MUL_USER_AGENT,
    '-H', 'Accept: text/html,application/json;q=0.9,*/*;q=0.8',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '-H', `Referer: ${MUL_ORIGIN}/`,
    '-w', STATUS_MARK + '%{http_code}',
    url,
  ], {
    maxBuffer: 20 * 1024 * 1024,
    timeout: 60_000,
  })
  const idx = stdout.lastIndexOf(STATUS_MARK)
  const body = idx >= 0 ? stdout.slice(0, idx) : stdout
  const status = idx >= 0 ? Number(stdout.slice(idx + STATUS_MARK.length)) : 200
  if (!Number.isFinite(status) || status >= 400) {
    throw new MulHttpError(`MUL request failed: ${status}`, Number.isFinite(status) ? status : 0, url)
  }
  return new Response(body, { status })
}

export async function fetchMul(pathOrUrl: string, init: RequestInit = {}): Promise<Response> {
  const url = resolveUrl(pathOrUrl)
  try {
    return await fetchWithCurl(url)
  } catch (error) {
    if (error instanceof MulHttpError) throw error
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
        'User-Agent': MUL_USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: `${MUL_ORIGIN}/`,
        ...init.headers,
      },
      redirect: init.redirect ?? 'follow',
    })
    if (!res.ok) {
      throw new MulHttpError(`MUL request failed: ${res.status} ${res.statusText}`, res.status, url)
    }
    return res
  }
}

export async function fetchMulJson<T>(pathOrUrl: string): Promise<T> {
  const res = await fetchMul(pathOrUrl)
  return res.json() as Promise<T>
}

export async function fetchMulText(pathOrUrl: string): Promise<string> {
  const res = await fetchMul(pathOrUrl)
  return res.text()
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
