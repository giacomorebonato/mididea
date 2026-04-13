import { describe, expect, test } from 'bun:test'

describe('emailOtp plugin', () => {
  test('auth config includes emailOtp plugin', async () => {
    const { auth } = await import('../auth')
    const options = auth.options
    expect(options.plugins).toBeDefined()
    expect(Array.isArray(options.plugins)).toBe(true)
    const pluginIds = (options.plugins as any[]).map((p: any) => p.id)
    expect(pluginIds).toContain('email-otp')
  })
})
