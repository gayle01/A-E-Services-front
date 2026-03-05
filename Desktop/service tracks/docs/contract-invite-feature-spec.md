# Contract Invite Onboarding Spec

## Goal
Allow a company to create a contract, send a contract-specific invite link to a client, and let that client sign up/sign in and immediately access only the invited contract timeline.

## Scope
- Company creates contract from timeline flow.
- Company generates and shares invite link for that contract.
- Client opens invite link.
- If not authenticated: client signs up/signs in, then invite is auto-accepted.
- If authenticated: invite is validated and accepted immediately.
- Accepted client can view contract and ongoing progress updates.

## Current App Mapping
- Existing contract UI: `src/components/ContractsScreen.jsx`
- Existing auth UI: `src/components/AuthScreen.jsx`, `src/pages/AuthPage.jsx`
- App state + routing: `src/App.jsx`
- Persistence layer: `src/lib/persistence.js` (local state today, API-ready via `VITE_STATE_API_BASE`)

## Data Model (Backend)

### `contracts`
Required fields:
- `id` (uuid, pk)
- `company_id` (uuid, fk -> users.id)
- `title` (text, not null)
- `location` (text)
- `frequency` (enum: weekly, biweekly, monthly)
- `weekday` (smallint 0-6)
- `start_date` (date, not null)
- `end_date` (date, not null)
- `status` (enum: draft, active, archived; default `active`)
- `created_at`, `updated_at` (timestamptz)

Client link fields:
- `client_user_id` (uuid, fk -> users.id, nullable until invite acceptance)
- `client_email_snapshot` (text, nullable, store invited email for display/audit)

### `contract_occurrences`
- `id` (uuid, pk)
- `contract_id` (uuid, fk -> contracts.id, indexed)
- `scheduled_at` (timestamptz)
- `status` (enum: scheduled, in_progress, submitted, verified, rejected, missed)
- `note` (text)
- `photos` (jsonb array of urls)
- `client_feedback` (text)
- `started_at`, `submitted_at`, `verified_at`, `rejected_at`, `missed_at` (timestamptz)
- `created_at`, `updated_at`

### `contract_invites`
- `id` (uuid, pk)
- `contract_id` (uuid, fk -> contracts.id, indexed)
- `issued_by_user_id` (uuid, fk -> users.id)
- `invitee_email` (text, nullable; if provided, only that email can accept)
- `token_hash` (text, unique, indexed)
- `status` (enum: pending, accepted, expired, revoked; default `pending`)
- `expires_at` (timestamptz, indexed)
- `accepted_at` (timestamptz, nullable)
- `accepted_by_user_id` (uuid, fk -> users.id, nullable)
- `created_at`, `updated_at`

Constraint:
- One active invite per contract (`status='pending'` and `expires_at > now()`), or keep multiple and honor latest only.

### `contract_memberships` (recommended)
- `id` (uuid, pk)
- `contract_id` (uuid, fk -> contracts.id)
- `user_id` (uuid, fk -> users.id)
- `role` (enum: company, client, worker)
- `created_at`

Unique:
- `(contract_id, user_id, role)`

## Invite Token Logic
1. Generate raw token with CSPRNG (32 bytes min).
2. Store only `token_hash = sha256(rawToken + serverPepper)`.
3. Link format: `/invite/<rawToken>`
4. Default expiry: 7 days.
5. On resolve:
   - Hash incoming token and find pending invite.
   - Reject if not found/revoked/expired/already accepted.
6. On accept:
   - If `invitee_email` exists, authenticated user email must match (case-insensitive).
   - In one transaction:
     - set invite status to `accepted`
     - set `accepted_by_user_id`, `accepted_at`
     - bind `contracts.client_user_id` if empty
     - create membership row (`role=client`)
7. Token is single-use after acceptance.

Security rules:
- Never return raw token from DB.
- Rate-limit invite resolve/accept endpoints.
- Log invalid token attempts.

## API Contract

### Company side
1. `POST /contracts`
- Creates contract.
- Response includes contract summary.

2. `POST /contracts/:contractId/invites`
- Body: `{ inviteeEmail?: string, expiresInDays?: number }`
- Auth: company owner of contract.
- Response:
  - `inviteId`
  - `inviteUrl`
  - `expiresAt`
  - `status`

3. `POST /contracts/:contractId/invites/:inviteId/revoke`
- Marks pending invite as revoked.

### Client side
4. `GET /invites/:token`
- Public endpoint.
- Returns sanitized metadata:
  - `valid`
  - `status` (`pending|expired|accepted|revoked|invalid`)
  - `contractPreview` (title, company name, location)
  - `requiresAuth` (always true unless session present)
  - `emailHint` (masked, optional)

5. `POST /invites/:token/accept`
- Auth required.
- Accepts invite and returns:
  - `contractId`
  - `redirectTo` (`/contracts/:id`)

6. `GET /me/contracts`
- Returns contracts user can access.

## UI / UX Requirements

### Company
1. Contract create flow:
- Keep current contract form in `ContractsScreen`.
- After creation, show new action: `Send Client Invite`.

2. Invite modal/panel:
- Optional target email field.
- Expiry selector (3/7/14 days).
- `Generate Invite Link` button.
- Show `Copy Link`, `Regenerate`, `Revoke`.
- Show invite status badge + expiry date.

### Client
3. Invite landing screen (`/invite/:token`):
- States:
  - loading
  - invalid
  - expired
  - already accepted
  - valid (shows contract preview + CTA)
- CTA:
  - unauthenticated: `Sign up to continue` / `Sign in to continue`
  - authenticated: `Accept Invite`

4. Post-auth resume:
- If auth initiated from invite link, store `pendingInviteToken` in session/local storage.
- After successful auth, auto-call accept endpoint.
- Redirect to contract timeline.

5. Contract access:
- Client sees invited contract in timeline list.
- Non-members must not see contract.

## Authorization Rules
- Company can create/revoke invites only for their own contracts.
- Client can accept invite only as authenticated user.
- Email-restricted invites require exact email match.
- Worker cannot accept client invite unless system supports dual-role users explicitly.

## Validation and Errors
- Expired token: show `This invite has expired. Request a new one from the company.`
- Revoked token: show `This invite is no longer active.`
- Already accepted:
  - if accepted by same user, route to contract
  - if accepted by another user, show blocked message
- Email mismatch: show masked invited email and prevent acceptance.

## Audit + Notifications
- Log events:
  - invite_created
  - invite_viewed
  - invite_accepted
  - invite_expired
  - invite_revoked
- Notifications:
  - Company notified on acceptance.
  - Client gets confirmation in notifications feed.

## Suggested Rollout Plan
1. Phase 1:
- Add DB tables and backend endpoints.
- Support company invite creation + client acceptance.

2. Phase 2:
- Add email delivery integration (send invite automatically).
- Add reminders for expiring invites.

3. Phase 3:
- Add analytics dashboard (invite conversion rate).

## Acceptance Criteria (Must Pass)
1. Company can create contract and generate invite URL.
2. Valid invite resolves with contract preview.
3. Unauthenticated client can sign up from invite and auto-accept.
4. Authenticated client can accept in one click.
5. Accepted client can see contract timeline and updates.
6. Expired/revoked/invalid invite states are handled with clear UI.
7. Unauthorized users cannot access contract data.
8. Invite acceptance is idempotent and transaction-safe.

## Implementation Notes For This Codebase
- Add `invite` route support in `src/lib/routeMap.js`.
- Extend global state in `src/App.jsx` with:
  - `contractInvites`
  - `pendingInviteToken`
- Add UI surface in `ContractsScreen` for invite management.
- Add new component/page for invite landing and acceptance state machine.
- Keep local-storage fallback behavior via `src/lib/persistence.js` for demo mode.
