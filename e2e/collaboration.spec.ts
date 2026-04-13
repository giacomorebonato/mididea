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

async function trpcQuery(
  request: import('@playwright/test').APIRequestContext,
  procedure: string,
  input: unknown,
  signedCookie: string,
) {
  const res = await request.get(
    `/api/trpc/${procedure}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`,
    { headers: authHeaders(signedCookie) },
  )
  return { res, body: await res.json() }
}

test.describe('collaboration API', () => {
  let userACookie: string
  let userBCookie: string
  let userAEmail: string
  let userBEmail: string
  let compositionId: string

  test.beforeAll(async ({ request }) => {
    userAEmail = uniqueEmail()
    userBEmail = uniqueEmail()
    const userA = await signUpViaOtp(request, userAEmail, 'User A')
    const userB = await signUpViaOtp(request, userBEmail, 'User B')
    userACookie = userA.signedCookie
    userBCookie = userB.signedCookie
    compositionId = await createComposition(request, 'Test Comp', userACookie)
  })

  test('invite creates pending invitation', async ({ request }) => {
    const { res, body } = await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId, email: userBEmail },
      userACookie,
    )
    expect(res.ok()).toBeTruthy()
    expect(body.result.data.json.status).toBe('pending')
    expect(body.result.data.json.inviteeEmail).toBe(userBEmail)
    expect(body.result.data.json.token).toBeDefined()
  })

  test('cannot invite self', async ({ request }) => {
    const { res } = await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId, email: userAEmail },
      userACookie,
    )
    expect(res.ok()).toBeFalsy()
  })

  test('cannot invite non-existent user', async ({ request }) => {
    const { res } = await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId, email: 'nonexistent@test.com' },
      userACookie,
    )
    expect(res.ok()).toBeFalsy()
  })

  test('cannot invite existing collaborator', async ({ request }) => {
    const invRes = await trpcQuery(
      request,
      'collaboration.sentInvitations',
      { compositionId },
      userACookie,
    )
    const invitations = invRes.body.result.data.json
    const pending = invitations.find(
      (inv: { inviteeEmail: string; status: string }) =>
        inv.inviteeEmail === userBEmail && inv.status === 'pending',
    )
    expect(pending).toBeDefined()

    await trpcMutate(
      request,
      'collaboration.acceptInvitation',
      { token: pending.token },
      userBCookie,
    )

    const { res } = await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId, email: userBEmail },
      userACookie,
    )
    expect(res.ok()).toBeFalsy()
  })

  test('list collaborators includes accepted user', async ({ request }) => {
    const { body } = await trpcQuery(
      request,
      'collaboration.list',
      { compositionId },
      userACookie,
    )
    const list = body.result.data.json
    expect(list.length).toBeGreaterThanOrEqual(1)
    expect(
      list.some(
        (c: { user: { email: string } }) => c.user.email === userBEmail,
      ),
    ).toBe(true)
  })

  test('remove collaborator', async ({ request }) => {
    const { body } = await trpcQuery(
      request,
      'collaboration.list',
      { compositionId },
      userACookie,
    )
    const list = body.result.data.json
    const collaborator = list.find(
      (c: { user: { email: string } }) => c.user.email === userBEmail,
    )

    const { res } = await trpcMutate(
      request,
      'collaboration.remove',
      { compositionId, userId: collaborator.user.id },
      userACookie,
    )
    expect(res.ok()).toBeTruthy()

    const after = await trpcQuery(
      request,
      'collaboration.list',
      { compositionId },
      userACookie,
    )
    const listAfter = after.body.result.data.json
    expect(
      listAfter.some(
        (c: { user: { email: string } }) => c.user.email === userBEmail,
      ),
    ).toBe(false)
  })

  test('decline invitation', async ({ request }) => {
    const newEmail = uniqueEmail()
    const { signedCookie: newCookie } = await signUpViaOtp(
      request,
      newEmail,
      'User C',
    )

    await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId, email: newEmail },
      userACookie,
    )

    const invRes = await trpcQuery(
      request,
      'collaboration.sentInvitations',
      { compositionId },
      userACookie,
    )
    const invitations = invRes.body.result.data.json
    const inv = invitations.find(
      (i: { inviteeEmail: string; status: string }) =>
        i.inviteeEmail === newEmail && i.status === 'pending',
    )
    expect(inv).toBeDefined()

    const { res } = await trpcMutate(
      request,
      'collaboration.declineInvitation',
      { token: inv.token },
      newCookie,
    )
    expect(res.ok()).toBeTruthy()

    const after = await trpcQuery(
      request,
      'collaboration.sentInvitations',
      { compositionId },
      userACookie,
    )
    const declined = after.body.result.data.json.find(
      (i: { id: string }) => i.id === inv.id,
    )
    expect(declined.status).toBe('declined')
  })

  test('non-owner cannot invite', async ({ request }) => {
    const newEmail = uniqueEmail()
    await signUpViaOtp(request, newEmail, 'User D')

    const { res } = await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId, email: newEmail },
      userBCookie,
    )
    expect(res.ok()).toBeFalsy()
  })
})

test.describe('invitation deep links', () => {
  let userACookie: string
  let userBCookie: string
  let userBEmail: string
  let compositionId: string
  let inviteToken: string

  test.beforeAll(async ({ request }) => {
    const userAEmail = uniqueEmail()
    userBEmail = uniqueEmail()
    const userA = await signUpViaOtp(request, userAEmail, 'Owner')
    const userB = await signUpViaOtp(request, userBEmail, 'Invitee')
    userACookie = userA.signedCookie
    userBCookie = userB.signedCookie
    compositionId = await createComposition(
      request,
      'Deep Link Comp',
      userACookie,
    )

    await trpcMutate(
      request,
      'collaboration.invite',
      { compositionId, email: userBEmail },
      userACookie,
    )
    const invitations = await (
      await trpcQuery(
        request,
        'collaboration.sentInvitations',
        { compositionId },
        userACookie,
      )
    ).body.result.data.json
    const inv = invitations.find(
      (i: { inviteeEmail: string; status: string }) =>
        i.inviteeEmail === userBEmail && i.status === 'pending',
    )
    inviteToken = inv.token
  })

  test('?invite= token accepts and reloads page', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'better-auth.session_token',
        value: cookieValue(userBCookie),
        domain: 'localhost',
        path: '/',
      },
    ])
    await page.goto(`/composition/${compositionId}?invite=${inviteToken}`)
    await page.waitForURL(`**/composition/${compositionId}`, {
      timeout: 10000,
    })
    expect(page.url()).not.toContain('invite=')
  })

  test('?decline= token declines and redirects to /creations', async ({
    page,
    request,
  }) => {
    const emailA = uniqueEmail()
    const emailB = uniqueEmail()
    const userA = await signUpViaOtp(request, emailA, 'Owner 2')
    const userB = await signUpViaOtp(request, emailB, 'Invitee 2')
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
    const invs = await trpcQuery(
      request,
      'collaboration.sentInvitations',
      { compositionId: compId },
      userA.signedCookie,
    )
    const inv = invs.body.result.data.json.find(
      (i: { inviteeEmail: string; status: string }) =>
        i.inviteeEmail === emailB && i.status === 'pending',
    )

    await page.context().addCookies([
      {
        name: 'better-auth.session_token',
        value: cookieValue(userB.signedCookie),
        domain: 'localhost',
        path: '/',
      },
    ])
    await page.goto(`/composition/${compId}?decline=${inv.token}`)
    await page.waitForURL('**/creations', { timeout: 10000 })
    expect(page.url()).toContain('/creations')
  })
})
