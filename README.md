# PuntHub Beta

PuntHub is South Africa's premier prediction-market platform — think Polymarket, tuned for the SA community.  
Users predict real-world events, earn PuntPoints, trade on live Polymarket markets through the Builder Program with gasless transactions, and redeem points for real prizes.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React (SPA, deployed to GitHub Pages or Vercel) |
| API / Backend | Vercel Serverless Functions (`api/` directory — TypeScript) |
| Auth | [Magic Embedded Wallet](https://magic.link) — passwordless email OTP |
| Wallet | Gnosis Safe Proxy (deployed via Polymarket Builder Relayer) |
| Markets | [Polymarket CLOB Client](https://github.com/Polymarket/py-clob-client) + Builder Program |
| Payments | Payfast (ZAR) · PayPal · Coinbase Commerce · Magic (crypto) |
| Hosting | GitHub Pages (static) + Vercel (API functions) |

---

## Local Development

```bash
npm install
cp .env.example .env   # fill in your keys (see Environment Variables below)
npm run dev
```

```bash
npm run build   # production build → dist/
npm run preview # preview the production build locally
```

---

## Deployment Architecture

The app is split into two deployment targets:

1. **Frontend (GitHub Pages / Vercel)** — the static Vite build from `dist/`
2. **API (Vercel)** — the serverless functions in `api/`

The `vercel.json` at the root configures both targets.  
The GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys the frontend.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

### Variable types

| Prefix | Where | Description |
|---|---|---|
| `VITE_*` | Browser bundle (Vite) | Injected at build time. Also add to GitHub Secrets. |
| _(none)_ | Vercel server only | Set in Vercel → Project Settings → Environment Variables. **Never** expose in the browser or GitHub Actions. |

---

### Magic Embedded Wallet (required for passwordless auth)

1. Sign up at <https://magic.link> and create a new app.
2. In the Magic Dashboard, enable **Embedded Wallet** and set the network to **Polygon Mainnet**.
3. Copy the **Publishable API Key** (starts with `pk_live_` or `pk_test_`).

```env
VITE_MAGIC_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXX
```

Reference: [Magic × Polymarket integration guide](https://docs.magic.link/home/integrations/embedded-wallets/polymarket)

### Polygon RPC (required for Magic + Safe + CLOB)

Any Polygon mainnet RPC endpoint works.  
The public fallback (`https://polygon-rpc.com`) is rate-limited; use your own for production.

```env
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
```

### Polymarket Builder Program (required for gasless trading)

1. Visit <https://polymarket.com/settings?tab=builder> to apply for the Builder Program.
2. Once approved, obtain your **API Key**, **Passphrase**, and **Secret** from the same settings page.

#### Browser-safe (add to GitHub Secrets as well)

```env
VITE_POLYMARKET_BUILDER_API_KEY=your_builder_api_key
VITE_POLYMARKET_BUILDER_PASSPHRASE=your_builder_passphrase
VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL=https://your-vercel-app.vercel.app
```

#### ⚠️ Server-side only — set in Vercel dashboard, NOT in GitHub Secrets

```env
POLYMARKET_BUILDER_API_KEY=your_builder_api_key
POLYMARKET_BUILDER_SECRET=your_builder_secret
POLYMARKET_BUILDER_PASSPHRASE=your_builder_passphrase
```

The `POLYMARKET_BUILDER_SECRET` is used for HMAC signing of requests.  
The signing proxy lives at `api/polymarket/sign.ts` (Vercel serverless function).

### Payfast (ZAR payments)

Payfast credentials are configured **server-side only** in Vercel environment variables.  
The form fields (including the security signature) are generated server-side by `api/payfast/prepare.ts`.

#### Server-side only (set in Vercel dashboard)

```env
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_merchant_passphrase   # from Payfast Settings → Integration
PAYFAST_SANDBOX=true   # set to "false" for live payments
PAYFAST_NOTIFY_URL=https://your-vercel-app.vercel.app/api/payfast/notify
PAYFAST_ITN_SECRET=<random 32-byte hex>   # openssl rand -hex 32
```

Sandbox buyer credentials (for manual testing):
- Email: `buyer@example.com`
- Password: `Test1234`
- Full card details: <https://developers.payfast.co.za/docs#testing>

### PayPal

```env
VITE_PAYPAL_CLIENT_ID=sb   # "sb" = PayPal sandbox; replace with live client ID for production
```

### Coinbase Commerce

```env
VITE_COINBASE_CHECKOUT_ID=your_checkout_uuid
```

---

## GitHub Secrets — CI / GitHub Pages Deploy

All `VITE_*` variables must be added as GitHub Repository Secrets so the GitHub Actions build job can inject them at build time.

### Step-by-step

1. Go to your repository on GitHub.
2. Navigate to **Settings → Secrets and variables → Actions**.
3. Click **New repository secret** for each variable:

| Secret Name | Description |
|---|---|
| `VITE_MAGIC_PUBLISHABLE_KEY` | Magic Publishable API Key |
| `VITE_POLYGON_RPC_URL` | Polygon RPC endpoint URL |
| `VITE_POLYMARKET_BUILDER_API_KEY` | Polymarket Builder API Key |
| `VITE_POLYMARKET_BUILDER_PASSPHRASE` | Polymarket Builder Passphrase |
| `VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL` | URL of your Vercel deployment |
| `VITE_PAYPAL_CLIENT_ID` | PayPal Client ID (`sb` for sandbox) |
| `VITE_COINBASE_CHECKOUT_ID` | Coinbase Commerce Checkout UUID |

> **Never** add Payfast credentials, `POLYMARKET_BUILDER_SECRET`, or `PAYFAST_ITN_SECRET`  
> to GitHub Secrets — these belong in Vercel environment variables only.

The deploy workflow at `.github/workflows/deploy.yml` automatically reads these secrets during `npm run build`.

### One-time GitHub Pages setting

In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**

---

## Authentication Flow

### New User

1. User enters their email on the PuntHub sign-up screen.
2. Magic sends a **one-time passcode** to that email (no password required).
3. After OTP verification, Magic provisions a non-custodial **EOA wallet** on Polygon via its TEE Key Management System (TKMS).
4. PuntHub calls `setupPolymarketTrading()` which:
   - Deploys a **Gnosis Safe Proxy** wallet for the user via the Polymarket Builder Relayer.
   - Derives **CLOB API credentials** (signed by the user's EOA).
   - Sets all required **token approvals** (USDC.e · CTF Exchange · Neg Risk Exchange) as a gasless batched transaction.
   - Returns an authenticated `ClobClient` ready for trading.

### Returning User

1. User enters their email → Magic retrieves the existing EOA wallet.
2. CLOB credentials are loaded from `sessionStorage` (no re-signature needed).
3. Safe deployment and approvals are skipped (idempotent).

---

## Polymarket Builder Program Integration

The integration is split across three client-side files:

| File | Responsibility |
|---|---|
| `src/services/magic.js` | Magic SDK singleton — `loginWithEmail`, `logout`, session check |
| `src/services/polymarketAuth.js` | Safe deployment, CLOB credentials, token approvals, `ClobClient` factory |
| `src/hooks/useWallet.js` | React hook exposing `connect`, `disconnect`, `setupTrading`, wallet state |

And two API (server-side) endpoints:

| File | Responsibility |
|---|---|
| `api/polymarket/sign.ts` | HMAC signing proxy — keeps `POLYMARKET_BUILDER_SECRET` off the browser |
| `api/polymarket/clob/[...path].ts` | Authenticated reverse proxy for Polymarket CLOB API |

### Key Integration Details

**Builder Config** — `src/services/polymarketAuth.js:createBuilderConfig()`  
Uses `remoteBuilderConfig` pointing to `VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL` so the builder secret stays server-side.

**RelayClient** — used for gasless Safe deployment and batched token approvals.

**ClobClient** — authenticated client with builder attribution for order placement.

Reference implementation: <https://github.com/Polymarket/magic-safe-builder-example>

---

## Payfast Payment Flow

1. User selects a PuntCoin package and clicks **Pay with Payfast**.
2. The app calls `POST /api/payfast/prepare` with `{amount, coins, email}`.
3. The server-side handler:
   - Computes the Payfast MD5 signature (using `PAYFAST_PASSPHRASE` — server-only).
   - Generates a time-limited HMAC grant token (`PAYFAST_ITN_SECRET`).
   - Returns all form fields, the endpoint URL, and the grant token.
4. The browser submits a POST form directly to Payfast.
5. Payfast processes the payment and:
   - Calls `PAYFAST_NOTIFY_URL` (`/api/payfast/notify`) server-to-server with the ITN.
   - Redirects the user to `return_url` with `?pf_token=<token>&pf_coins=<n>`.
6. The app calls `GET /api/payfast/grant?token=<token>&coins=<n>` to verify the token.
7. On success, PuntCoins are credited to the user's account.

