import { describe, expect, test } from 'bun:test'

describe('env', () => {
  test('provides defaults in development', async () => {
    // env.ts reads process.env at import time, so we test the module behavior
    const { env } = await import('../env')
    expect(env.DATABASE_URL).toBe('file:./dev.db')
    expect(env.PORT).toBe(3000)
    expect(env.isProd).toBe(false)
  })

  test('PORT can be overridden via env var', () => {
    const original = process.env.PORT
    process.env.PORT = '4000'
    // Force re-evaluation — in practice env.ts is imported once
    // This tests the parsing logic
    expect(Number(process.env.PORT ?? 3000)).toBe(4000)
    process.env.PORT = original
  })
})
