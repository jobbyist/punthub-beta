# PuntHub Beta

PuntHub is South Africa's premier prediction-market platform — think Polymarket, tuned for the SA community.  
Users predict real-world events, earn PuntPoints, trade on live Polymarket markets through the Builder Program with gasless transactions, and redeem points for real prizes.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React (single-page app) |
| Auth | [Magic Embedded Wallet](https://magic.link) — passwordless email OTP |
| Wallet | Gnosis Safe Proxy (deployed via Polymarket Builder Relayer) |
| Markets | [Polymarket CLOB Client](https://github.com/Polymarket/py-clob-client) + Builder Program |
| Payments | Payfast (ZAR) · PayPal · Coinbase Commerce |
| Hosting | GitHub Pages (CI via GitHub Actions) |

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

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.  
All `VITE_*` variables are inlined into the browser bundle at build time by Vite.

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
2. Once approved, obtain your **API Key** and **Passphrase** from the same settings page.

#### ⚠️ Builder Secret — server-side only

The `POLYMARKET_BUILDER_SECRET` is used for HMAC request signing and must **never** be exposed to the browser.

For the static GitHub Pages deployment, deploy a lightweight signing proxy (e.g., a Vercel Edge Function or a Netlify Function based on the [magic-safe-builder-example](https://github.com/Polymarket/magic-safe-builder-example/blob/main/src/app/api/polymarket/sign/route.ts)) and set `VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL` to its URL.

```env
VITE_POLYMARKET_BUILDER_API_KEY=your_builder_api_key
VITE_POLYMARKET_BUILDER_PASSPHRASE=your_builder_passphrase
VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL=https://your-api.example.com/api/polymarket/sign
```

### Payfast (ZAR payments — sandbox credentials pre-configured)

The sandbox credentials are safe to use in development and CI:

```env
VITE_PAYFAST_MERCHANT_ID=10000100
VITE_PAYFAST_MERCHANT_KEY=46f0cd694581a
VITE_PAYFAST_SANDBOX=true
```

Sandbox buyer credentials (for manual testing):
- Email: `buyer@example.com`
- Password: `Test1234`
- Full card details: <https://developers.payfast.co.za/docs#testing>

For live payments, replace the credentials and set `VITE_PAYFAST_SANDBOX=false`.

### PayPal

```env
VITE_PAYPAL_CLIENT_ID=sb   # "sb" = PayPal sandbox
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
| `VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL` | URL of your server-side signing proxy |
| `VITE_PAYPAL_CLIENT_ID` | PayPal Client ID (`sb` for sandbox) |
| `VITE_COINBASE_CHECKOUT_ID` | Coinbase Commerce Checkout UUID |
| `VITE_PAYFAST_MERCHANT_ID` | Payfast merchant ID |
| `VITE_PAYFAST_MERCHANT_KEY` | Payfast merchant key |
| `VITE_PAYFAST_SANDBOX` | `"true"` (sandbox) or `"false"` (live) |

> **Never** set `POLYMARKET_BUILDER_SECRET` as a GitHub Secret for the Pages build — it belongs on your signing proxy server only.

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

The integration is split across three files:

| File | Responsibility |
|---|---|
| `src/services/magic.js` | Magic SDK singleton — `loginWithEmail`, `logout`, session check |
| `src/services/polymarketAuth.js` | Safe deployment, CLOB credentials, token approvals, `ClobClient` factory |
| `src/hooks/useWallet.js` | React hook exposing `connect`, `disconnect`, `setupTrading`, wallet state |

### Key Integration Details

**Builder Config** — `src/services/polymarketAuth.js:createBuilderConfig()`  
Uses `remoteBuilderConfig` so the builder secret stays server-side.

**RelayClient** — used for gasless Safe deployment and batched token approvals.

**ClobClient** — authenticated client with builder attribution for order placement.

Reference implementation: <https://github.com/Polymarket/magic-safe-builder-example>

