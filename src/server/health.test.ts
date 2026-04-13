import { afterAll, describe, expect, test } from 'bun:test'

let server: ReturnType<typeof Bun.serve>
let baseUrl: string

// Start a test server
const { serve } = await import('bun')
server = serve({
  port: 0, // random available port
  routes: {
    '/api/health': () => Response.json({ status: 'ok' }),
  },
})
baseUrl = `http://localhost:${server.port}`

afterAll(() => {
  server.stop()
})

describe('health endpoint', () => {
  test('returns ok status', async () => {
    const res = await fetch(`${baseUrl}/api/health`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({ status: 'ok' })
  })

  test('returns JSON content type', async () => {
    const res = await fetch(`${baseUrl}/api/health`)
    expect(res.headers.get('content-type')).toContain('application/json')
  })
})
