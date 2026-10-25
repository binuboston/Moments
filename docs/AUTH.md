# Authentication, sessions and plans

How sign-in, recovery, confirmation, bot protection, sessions and plan limits work, and what must be configured outside the code. The design leans on Supabase Auth's built-in features; the app adds as little of its own as it can.

## Redirect targets

Every untrusted "where next" value (`?next=`, email links) goes through `safeNextPath` (`features/auth/safe-next.ts`). It returns a same-origin path or the fallback.

It rejects:

- control characters (literal or decoded tabs and newlines);
- backslashes;
- protocol-relative values (`//host`) and values that become them after normalisation (`/.//host`);
- absolute URLs;
- auth and API endpoints;
- values over 2048 characters.

The normalised path that was checked is the one returned. Tests: `tests/unit/safe-next.test.ts` and `tests/e2e/redirect-safety.spec.ts`.

## Email links (any device)

The confirmation and reset emails use Supabase's token-hash links (`supabase/templates/*.html`):

```
{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email|recovery
```

`RedirectTo` is always `/auth/confirm?next=…` on this site, so it must be in the project's redirect allow list. `app/auth/confirm/route.ts` calls `verifyOtp`, so no PKCE verifier from the requesting browser is needed, then applies `safeNextPath`. Recovery links always continue to `/reset-password`.

Invalid, used or expired links go to `/login?error=link` (or `/forgot-password?error=link` for recovery). OAuth (Google) still returns through `/auth/callback` (PKCE code).

**Guest drafts.** When a guest signs up or logs in, their drafts move to the account if the sign-in finishes in the same browser (signed claim cookie, `lib/auth/guest.ts`). Confirming on another device signs the person in there, and the drafts stay with the guest in the first browser. Drafts are never moved because a client supplied an invitation id.

## Password recovery

The recovery link signs the person in, and `/reset-password` sets the new password with `updateUser`. Supabase's **secure password change** setting means only a recent sign-in can do that without reauthenticating. Supabase answers `reauthentication_needed` to anything older, and the form asks for a new link.

On success, every other session is revoked (`signOut({ scope: "others" })`). Tests: `tests/e2e/password-recovery.spec.ts`.

## Session policy

| Event | Effect |
| --- | --- |
| Log out (menu, settings) | This device only (`signOut({ scope: "local" })`). Other browsers stay signed in. |
| Log out everywhere (settings) | Every session for the account, this one included (`scope: "global"`). For a suspected compromise. If revocation fails, this device is still signed out and the user is told. |
| Password reset | Every other session is revoked (`scope: "others"`). The device that reset stays signed in. |
| Suspected compromise (support) | Reset the password from the dashboard or ask the user to use Log out everywhere. Admins can also sign the user out in Supabase (Authentication → Users → user → Sign out). |

Revocation ends refresh tokens immediately. Server checks validate with Supabase, so a revoked browser loses access on its next request. Tests: `tests/e2e/session-policy.spec.ts`.

## Resend confirmation

Shown after sign-up and when logging in to an unconfirmed account. It calls `auth.resend()` directly:

- **Neutral answer.** It shows the same message whether or not the address is waiting for confirmation. Only CAPTCHA failures and rate limits are reported.
- **Limits.** Supabase limits sends per address (`max_frequency`) and per project (email rate limit). The button also has a 60-second cooldown.

## Bot protection (Cloudflare Turnstile)

These operations send a Turnstile token: sign-up, log-in, both password-reset forms, resend confirmation and guest sessions (`features/auth/captcha.tsx`). Without `NEXT_PUBLIC_TURNSTILE_SITE_KEY` the widget is not rendered.

Supabase Auth verifies the token server-side once CAPTCHA protection is on. A missing, invalid, expired or reused token gets `captcha_failed`, which the forms show as a clear message. The forms fail closed: if the widget errors or Cloudflare's script is blocked, they do not submit and say why. Tests: `tests/component/captcha.test.tsx`.

**Rollout order.** Do not skip steps.

1. Cloudflare → Turnstile → add a widget (Managed) for the production domain and any preview domains you want covered. Keep the site key and secret key.
2. Vercel → set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and redeploy. Tokens are sent, but nothing is enforced yet.
3. On the live domain, check that each form sends `captcha_token` in its Supabase auth request and that Cloudflare's analytics show solves.
4. Supabase → Authentication → Attack Protection → enable CAPTCHA, provider Turnstile, paste the **secret** key.
5. Re-test sign-up, log-in, reset, resend and guest start on the live domain.

To roll back, turn CAPTCHA protection off in Supabase first. The secret key never goes in this app or in Vercel.

## Plans and entitlements

`profiles.plan` (`free` or `pro`) is the only source of a user's plan. Only admins or the service role can change it (trigger `protect_profile_privileges`). The frontend's `draft.plan` and account context are for display only.

Enforcement has two layers:

1. **API routes** check first, with friendly errors, through `lib/entitlements.ts` and `features/invitations/server-actions-helpers.ts`.
2. **The database** (`supabase/migrations/20261025000002_plan_entitlements.sql`) enforces the same rules for every write, including direct Data API writes that skip the API:
   - **Premium templates:** cannot go live on Free, and a live invitation cannot switch to one.
   - **Live invitation limit:** concurrent publishes are serialised per owner.
   - **Gallery photo limit:** applies on insert and on a cover → gallery change.
   - **Branding:** follows the plan; any `settings.branding` a client writes is overwritten.

The limits live in `public.plan_entitlements`. `tests/rls/entitlements.test.ts` fails if they differ from `PLAN_LIMITS`.

**Downgrades.** Invitations that are already live keep working and stay editable. Branding is re-stamped on their next edit, and new publishes follow the new plan.

Public invitation pages and guest RSVPs need no login and are not affected. The triggers only run on owner writes.

## Deployment checklist

### Database

Apply pending migrations with `pnpm exec supabase db push`, after `--dry-run` shows the expected list.

Before applying the entitlements migration, check for owners who would already exceed limits. It does not change existing rows; the query is informational only:

```sql
select owner_id, count(*) from invitations where status = 'published' group by owner_id having count(*) > 3;
```

### Supabase dashboard (production project)

`supabase config push` would also overwrite the site URL and other settings, so do these by hand.

- **Authentication → URL Configuration → Redirect URLs:** add `https://<domain>/auth/confirm` (keep `/auth/callback`).
- **Authentication → Emails → Templates:** paste the token-hash links from `supabase/templates/confirmation.html` (Confirm signup) and `recovery.html` (Reset password).
- **Authentication → Providers → Email:**
  - Minimum password length: 8.
  - Secure password change: on.
  - Confirm email: on.
- **Authentication → Attack Protection → Prevent use of leaked passwords:** available on Pro plans and above. On Free it is unavailable; the strength meter and 8-character minimum still apply.
- **Authentication → SMTP:** configure a custom SMTP provider. The built-in sender allows only a few emails per hour and is not meant for production.
- **CAPTCHA:** see the rollout order above. Turn it on last.

### Vercel

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: step 2 of the Turnstile rollout.
