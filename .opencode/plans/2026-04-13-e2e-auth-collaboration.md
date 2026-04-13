# E2E Tests: Auth + Collaboration

## Overview
Playwright E2E tests for email OTP auth flow, unauthenticated save prompt, invitation-based collaboration, invitation banner, and deep links. Includes Resend integration for production email.

## Task 0: Test-mode OTP endpoint ✅
- `src/server/auth.ts`: stores last OTP per email in `Map<string,string>` when `NODE_ENV=test`. Exports `getLastOtp()`.
- `src/index.ts`: `GET /api/test/last-otp?email=...` gated behind `NODE_ENV=test`.
- `src/env.ts`: `RESEND_API_KEY` required in prod, `RESEND_FROM_EMAIL` configurable.

## Task 1: Update `e2e/auth.spec.ts` ✅
- Send OTP via API → fetch from test endpoint → sign in via `/sign-in/email-otp`
- UI flow: Sign in → email → Send code → Enter code form visible
- Wrong OTP returns error
- Sign out clears session

## Task 2: New `e2e/save-composition.spec.ts` ✅
- Guest sees Save without count
- Guest save prompts "Sign in to save"
- Auth save shows dialog with title input + count (N/5)
- Limit message at 5 compositions

## Task 3: New `e2e/collaboration.spec.ts` ✅
- Invite creates pending invitation
- Cannot invite self
- Cannot invite non-existent user
- Cannot invite existing collaborator (after accept)
- List collaborators includes accepted user
- Remove collaborator
- Decline invitation
- Non-owner cannot invite

## Task 4: New `e2e/invitation-banner.spec.ts` ✅
- No banner for guests
- No banner with no invitations
- Banner shows pending invitation with Accept/Decline
- Accept navigates to composition
- Decline removes banner

## Task 5: Deep link tests ✅
- `?invite=TOKEN` accepts and reloads (in collaboration.spec.ts)
- `?decline=TOKEN` declines and redirects to /creations

## Task 6: Resend integration ✅
- `resend` package installed
- `src/env.ts`: RESEND_API_KEY required in prod, RESEND_FROM_EMAIL default noreply@mididea.com
- `src/server/auth.ts`: production sends via Resend, dev logs, test stores in memory

## Bug fix
- Fixed client sign-in flow: `authClient.emailOtp.verifyEmail` → `authClient.signIn.emailOtp`
  - `verifyEmail` maps to `/email-otp/verify-email` (uses `email-verification` identifier)
  - Sign-in OTP sent with `type: 'sign-in'` stores under `sign-in` identifier
  - Must use `/sign-in/email-otp` endpoint to match identifiers
