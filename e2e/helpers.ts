import type { APIRequestContext } from '@playwright/test'

export async function fetchOtp(
  request: APIRequestContext,
  email: string,
): Promise<string> {
  const res = await request.get(
    `/api/test/last-otp?email=${encodeURIComponent(email)}`,
  )
  if (!res.ok()) {
    throw new Error(`Failed to fetch OTP for ${email}: ${res.status()}`)
  }
  const { otp } = (await res.json()) as { otp: string }
  return otp
}

function extractSignedCookie(setCookieHeader: string): string {
  return setCookieHeader.split(';')[0]!
}

export async function signUpViaOtp(
  request: APIRequestContext,
  email: string,
  name?: string,
): Promise<{
  user: { id: string; email: string }
  signedCookie: string
}> {
  const sendRes = await request.post(
    '/api/auth/email-otp/send-verification-otp',
    {
      data: { email, type: 'sign-in' },
    },
  )
  if (!sendRes.ok()) {
    throw new Error(
      `Failed to send OTP: ${sendRes.status()} ${await sendRes.text()}`,
    )
  }

  const otp = await fetchOtp(request, email)

  const signInRes = await request.post('/api/auth/sign-in/email-otp', {
    data: { email, otp, name: name ?? email.split('@')[0] },
  })
  if (!signInRes.ok()) {
    throw new Error(
      `Failed to sign in: ${signInRes.status()} ${await signInRes.text()}`,
    )
  }
  const data = (await signInRes.json()) as {
    token: string
    user: { id: string; email: string }
  }

  const setCookie = signInRes.headers()['set-cookie']
  if (!setCookie) {
    throw new Error('No Set-Cookie header in sign-in response')
  }
  const signedCookie = extractSignedCookie(setCookie)

  return { user: data.user, signedCookie }
}

export async function createComposition(
  request: APIRequestContext,
  title: string,
  signedCookie: string,
): Promise<string> {
  const res = await request.post('/api/trpc/composition.create', {
    headers: {
      'Content-Type': 'application/json',
      Cookie: signedCookie,
    },
    data: {
      json: { title, data: JSON.stringify({ bpm: 120, stepCount: 16 }) },
    },
  })
  if (!res.ok()) {
    throw new Error(
      `Failed to create composition: ${res.status()} ${await res.text()}`,
    )
  }
  const body = (await res.json()) as {
    result: { data: { json: { id: string } } }
  }
  return body.result.data.json.id
}

export function authHeaders(signedCookie: string): Record<string, string> {
  return { Cookie: signedCookie }
}

export function cookieValue(signedCookie: string): string {
  return signedCookie.split('=').slice(1).join('=')
}

let counter = 0
export function uniqueEmail(): string {
  counter++
  return `e2e-${Date.now()}-${counter}@test.com`
}
