import { expect, test } from '@playwright/test'
import {
  authHeaders,
  cookieValue,
  createComposition,
  signUpViaOtp,
  uniqueEmail,
} from './helpers'

async function trpcMutate(
  request: import('@playwright/test').APIRequestContext,
  procedure: string,
  input: unknown,
  signedCookie: string,
) {
  const res = await request.post(`/api/trpc/${procedure}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(signedCookie),
    },
    data: { json: input },
  })
  return { res, body: await res.json() }
}

async function setSessionCookie(
  page: import('@playwright/test').Page,
  signedCookie: string,
) {
  await page.context().addCookies([
    {
      name: 'better-auth.session_token',
      value: cookieValue(signedCookie),
      domain: 'localhost',
      path: '/',
    },
  ])
}

test.describe('invitation banner', () => {
  test('no banner for guests', async ({ page }) => {
    await page.goto('/creations')
    await expect(page.getByText(/invited you to collaborate/)).not.toBeVisible()
  })

  test('no banner for authenticated user with no invitations', async ({
    page,
    request,
  }) => {
    const email = uniqueEmail()
    const { signedCookie } = await signUpViaOtp(request, email)
    await setSessionCookie(page, signedCookie)
    await page.goto('/creations')
    await expect(page.getByText(/invited you to collaborate/)).not.toBeVisible()
  })

  test('banner shows pending invitation', async ({ page, request }) => {
    const emailA = uniqueEmail()
    const emailB = uniqueEmail()
    const userA = await signUpViaOtp(request, emailA, 'Inviter')
    const userB = await signUpViaOtp(request, emailB, 'Invitee Banner')
    const compId = await createComposition(
      request,
      'Banner Comp',
      userA.signedCookie,
    )

    await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId: compId, email: emailB },
      userA.signedCookie,
    )

    await setSessionCookie(page, userB.signedCookie)
    await page.goto('/creations')
    await expect(page.getByText(/invited you to collaborate on/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Decline' })).toBeVisible()
  })

  test('accept removes banner and navigates', async ({ page, request }) => {
    const emailA = uniqueEmail()
    const emailB = uniqueEmail()
    const userA = await signUpViaOtp(request, emailA, 'Inviter 2')
    const userB = await signUpViaOtp(request, emailB, 'Invitee 3')
    const compId = await createComposition(
      request,
      'Accept Comp',
      userA.signedCookie,
    )

    await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId: compId, email: emailB },
      userA.signedCookie,
    )

    await setSessionCookie(page, userB.signedCookie)
    await page.goto('/creations')
    await expect(page.getByText(/invited you to collaborate on/)).toBeVisible()
    await page.getByRole('button', { name: 'Accept' }).click()
    await page.waitForURL(`**/composition/${compId}`, { timeout: 10000 })
  })

  test('decline removes banner', async ({ page, request }) => {
    const emailA = uniqueEmail()
    const emailB = uniqueEmail()
    const userA = await signUpViaOtp(request, emailA, 'Inviter 3')
    const userB = await signUpViaOtp(request, emailB, 'Invitee 4')
    const compId = await createComposition(
      request,
      'Decline Comp',
      userA.signedCookie,
    )

    await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId: compId, email: emailB },
      userA.signedCookie,
    )

    await setSessionCookie(page, userB.signedCookie)
    await page.goto('/creations')
    await expect(page.getByText(/invited you to collaborate on/)).toBeVisible()
    await page.getByRole('button', { name: 'Decline' }).click()
    await expect(page.getByText(/invited you to collaborate/)).not.toBeVisible({
      timeout: 5000,
    })
  })
})
