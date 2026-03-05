# PuntHub Beta

PuntHub is a prediction-market community platform built with Vite + React. It integrates:

- **Polymarket Gamma API** — live prediction markets streamed into the app
- **Magic Embedded Wallet** — passwordless email OTP authentication with non-custodial wallet provisioning via TKMS
- **Gnosis Safe Proxy Wallet** — deployed gaslessly through Polymarket's Builder Relayer
- **Polymarket CLOB Client** — on-chain limit/market orders with builder attribution
- **P2P Betting** — peer-to-peer betting sessions powered by live Polymarket scenarios

---

## Local dev

```bash
cp .env.example .env    # fill in values (see below)
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values described below.

| Variable | Required | Description |
|---|---|---|
| `VITE_MAGIC_PUBLISHABLE_KEY` | ✅ | Magic publishable API key — [magic.link dashboard](https://magic.link/) |
| `VITE_POLYGON_RPC_URL` | Optional | Polygon RPC endpoint. Defaults to `https://polygon-rpc.com` |
| `VITE_POLYMARKET_BUILDER_API_KEY` | ✅ for trading | Builder API key — [polymarket.com/settings?tab=builder](https://polymarket.com/settings?tab=builder) |
| `VITE_POLYMARKET_BUILDER_SECRET` | ✅ for trading | Builder secret |
| `VITE_POLYMARKET_BUILDER_PASSPHRASE` | ✅ for trading | Builder passphrase |
| `VITE_PAYPAL_CLIENT_ID` | Optional | PayPal client ID |
| `VITE_COINBASE_CHECKOUT_ID` | Optional | Coinbase Commerce checkout UUID |
| `VITE_PAYFAST_MERCHANT_ID` | Optional | Payfast merchant ID |
| `VITE_PAYFAST_MERCHANT_KEY` | Optional | Payfast merchant key |
| `VITE_PAYFAST_SANDBOX` | Optional | `true` for sandbox, `false` for live |

---

## GitHub Secrets Setup

The GitHub Actions workflow at `.github/workflows/deploy.yml` reads API keys from
[GitHub Repository Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
at build time so they are **never committed to source control**.

### Step-by-step

1. Go to your repository on GitHub.
2. Click **Settings → Secrets and variables → Actions**.
3. Click **New repository secret** for each variable below.

#### Magic Embedded Wallet

| Secret name | Where to get it |
|---|---|
| `VITE_MAGIC_PUBLISHABLE_KEY` | [magic.link](https://magic.link/) → create an app → **Publishable API Key** |

#### Polygon RPC (optional but recommended)

| Secret name | Where to get it |
|---|---|
| `VITE_POLYGON_RPC_URL` | [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/) → create a Polygon Mainnet app → copy the HTTPS URL |

#### Polymarket Builder Program

> Obtain credentials at **[polymarket.com/settings?tab=builder](https://polymarket.com/settings?tab=builder)**.

| Secret name | Description |
|---|---|
| `VITE_POLYMARKET_BUILDER_API_KEY` | Builder API key |
| `VITE_POLYMARKET_BUILDER_SECRET` | Builder HMAC secret |
| `VITE_POLYMARKET_BUILDER_PASSPHRASE` | Builder passphrase |

> ⚠️ **Security note:** Because PuntHub is a static Vite SPA (no server), builder
> credentials are embedded in the compiled JS bundle. For a production deployment,
> move order signing to a server-side endpoint (e.g. a Vercel Edge Function or
> Cloudflare Worker) that accepts authenticated requests and returns only the HMAC
> signature — **never** the raw `SECRET`. See
> [magic-safe-builder-example/app/api/polymarket/sign](https://github.com/Polymarket/magic-safe-builder-example)
> for a reference implementation.

#### Payment gateways (optional)

| Secret name | Description |
|---|---|
| `VITE_PAYPAL_CLIENT_ID` | PayPal client ID |
| `VITE_COINBASE_CHECKOUT_ID` | Coinbase Commerce checkout UUID |
| `VITE_PAYFAST_MERCHANT_ID` | Payfast merchant ID |
| `VITE_PAYFAST_MERCHANT_KEY` | Payfast merchant key |
| `VITE_PAYFAST_SANDBOX` | `true` or `false` |

---

## Authentication & Wallet Flow

### New user

1. User enters username + email on the onboarding screen.
2. Magic sends a one-time code to the email (no password needed).
3. Magic provisions a non-custodial **EOA wallet** via TKMS.
4. On first trade, the app deploys a **Gnosis Safe Proxy** from the EOA (gasless via Builder Relayer).
5. Token approvals (USDC.e + outcome tokens) are set in a single batched transaction.
6. An authenticated **ClobClient** is initialised with builder attribution.

### Returning user

1. User re-authenticates with Magic email OTP.
2. Existing wallet + Safe address are restored.
3. Cached API credentials are loaded from `localStorage`; the trading session resumes immediately.

### Sign-out

Clicking **Sign Out** in the Profile tab:
- Calls `magic.user.logout()` to invalidate the Magic session.
- Clears the cached trading session from `localStorage`.
- Returns the user to the landing page.

---

## Architecture

```
src/
├── App.jsx                      # Main app (landing, onboarding, tabs)
└── services/
    ├── magic.js                 # Magic Embedded Wallet singleton + helpers
    ├── polymarket.js            # Gamma API (public markets, P2P scenarios)
    ├── polymarketTrading.js     # CLOB Client + Builder Relayer + session mgmt
    └── approvals.js             # Token approval utilities (ERC-20 + ERC-1155)
```

### Key contract addresses (Polygon mainnet)

| Contract | Address |
|---|---|
| USDC.e | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| CTF Contract | `0x4d97dcd97ec945f40cf65f87097ace5ea0476045` |
| CTF Exchange | `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E` |
| Neg Risk CTF Exchange | `0xC5d563A36AE78145C45a50134d48A1215220f80a` |
| Neg Risk Adapter | `0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296` |

---

## GitHub Pages deploy

The repo includes a GitHub Actions workflow that builds on every push to `main`
and deploys the `dist/` folder to GitHub Pages.

### One-time GitHub setting

In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**

---

## References

- [Magic × Polymarket integration guide](https://docs.magic.link/home/integrations/embedded-wallets/polymarket)
- [magic-safe-builder-example](https://github.com/Polymarket/magic-safe-builder-example)
- [Polymarket CLOB Client](https://github.com/Polymarket/clob-client)
- [Polymarket Builder Relayer Client](https://github.com/Polymarket/builder-relayer-client)
