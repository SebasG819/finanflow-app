# FinanFlow Gmail import design

## Intent

Let a signed-in FinanFlow user connect their Gmail account and turn bank notifications and store receipts into expenses or incomes. The user decides which senders can be imported automatically. The first message from a sender is always reviewed.

## Experience

- Settings has a `Correo` section with connection status, `Conectar Gmail`, `Revisar movimientos`, and `Desconectar Gmail`.
- Connection requests read-only Gmail access through Google Identity Services in the browser. It does not change the existing FinanFlow email/password login.
- A protected `Movimientos detectados` screen shows pending messages with sender, subject, merchant, date, amount, proposed expense/income type, and source. It never displays the full email body by default.
- Each pending item offers `Guardar`, `Descartar`, and `Guardar automaticamente los proximos de este remitente`. The user can correct amount, date, category, and payment status before saving.
- Settings lists allowed senders and whether each is automatic or review-only. The user can switch modes or remove a rule at any time.
- New senders, ambiguous amounts, invoices that may be unpaid, and possible duplicates always require review. No high-confidence guess is silently treated as a confirmed bank transaction.
- The import list has loading, empty, error, and reconnect states. Existing dashboard and finance views refresh after an import.

## Architecture

- Google OAuth is a separate connection flow for the signed-in user, using Supabase Google identity linking and the Gmail read-only scope. Google provider access and refresh tokens are passed to a trusted Edge Function and kept out of public tables.
- In the first release, the user presses Sincronizar ahora. The Google access token stays in browser memory only and is discarded on reload. Gmail messages are searched within the last 90 days, with a bounded scan; only normalized candidate metadata is stored.
- A public, RLS-protected import table stores metadata and proposed transaction values. A public, RLS-protected rules table stores per-user sender preferences.
- Importing uses the existing expense and income model and services. A unique Gmail message ID prevents reprocessing. Similar bank and store messages for the same amount, date, and merchant are flagged for review rather than both auto-imported.
- During a manual sync, trusted senders can be auto-saved only when amount and direction are unambiguous. A scheduled, background sync is a separate later release requiring server-held offline credentials and Google's restricted-scope production approval.

## Constraints

- Never store Google client secrets or refresh tokens in Vite environment variables, browser localStorage, or public tables. This first release needs only a public OAuth Web client ID.
- Never scan mail before the user grants access. Allow disconnect and token revocation.
- Keep RLS on all exposed tables and use ownership checks for every operation. The server verifies the Supabase user before storing a Google token or importing a transaction.
- Initial sync examines recent messages only. Import history must not create duplicate transactions.
- Google classifies `gmail.readonly` as a restricted scope. A public release may require OAuth verification and a security assessment; development can use a limited Google OAuth test-user list.
- Google Cloud Web OAuth client ID, authorized JavaScript origin, Gmail API enablement, and a test-user allowlist are external setup prerequisites. No Google redirect URI or Supabase Google provider is needed for the browser token flow.

## Alternatives considered

- Direct Gmail OAuth: chosen for the simplest connection experience; carries Google verification and secure-token work.
- Gmail forwarding rules: avoids full mailbox permission but requires each user to configure forwarding.
- Manual email upload: simplest technically but does not meet the automatic-import goal.

## Verification

- Connect one Gmail test account, review one bank alert and one store receipt, approve one and enable auto-import for its sender.
- Confirm a later receipt from that sender imports automatically and a new sender remains pending.
- Confirm duplicate bank/store messages create at most one financial transaction.
- Confirm disconnect stops sync, revokes/clears credentials, and leaves saved financial transactions intact.
- Confirm existing login, expense/income editing, dashboard totals, reports, and protected routes continue to work.
