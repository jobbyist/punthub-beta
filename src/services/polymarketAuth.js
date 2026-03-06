// ─── POLYMARKET AUTH & TRADING SERVICE ────────────────────────────────────────
// Integrates Polymarket's CLOB Client and Builder Relayer Client with Magic's
// Embedded Wallet (Safe Proxy) for gasless trading and builder order attribution.
//
// Reference: https://github.com/Polymarket/magic-safe-builder-example
// Docs:      https://docs.magic.link/home/integrations/embedded-wallets/polymarket
//
// ⚠️  SECURITY NOTE
// -----------------
// The POLYMARKET_BUILDER_SECRET is used server-side only for HMAC signing.
// In a static/GitHub-Pages deployment the signing endpoint is not available, so
// the RelayClient is initialised with `remoteBuilderConfig` pointing to
// VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL.  In production, deploy the tiny
// Next.js / Express signing proxy described in the README and set that env var.
// Never set VITE_POLYMARKET_BUILDER_SECRET in the browser environment.

import { providers } from "ethers";
import { initMagic, POLYGON_CHAIN_ID } from "./magic.js";

// ── Polymarket endpoint constants ─────────────────────────────────────────────
export const CLOB_API_URL = "https://clob.polymarket.com";
export const RELAYER_URL = "https://relayer-v2.polymarket.com/";

// ── Environment helpers ────────────────────────────────────────────────────────
function env(key) {
  return (typeof import.meta !== "undefined" && import.meta.env?.[key]) || "";
}

export function getBuilderApiKey() { return env("VITE_POLYMARKET_BUILDER_API_KEY"); }
export function getBuilderPassphrase() { return env("VITE_POLYMARKET_BUILDER_PASSPHRASE"); }
export function getRelaySignUrl() { return env("VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL"); }

// ── Lazy singletons ────────────────────────────────────────────────────────────
let _ethersProvider = null;
let _ethersSigner = null;
let _eoaAddress = null;

/**
 * Build an ethers provider + signer from the Magic rpcProvider.
 * Returns null when Magic is not configured.
 *
 * @returns {Promise<{provider: providers.Web3Provider, signer: providers.JsonRpcSigner, address: string}|null>}
 */
export async function getEthersClients() {
  if (_ethersProvider && _ethersSigner && _eoaAddress) {
    return { provider: _ethersProvider, signer: _ethersSigner, address: _eoaAddress };
  }

  const magic = await initMagic();
  if (!magic) return null;

  try {
    _ethersProvider = new providers.Web3Provider(magic.rpcProvider);
    _ethersSigner = _ethersProvider.getSigner();
    _eoaAddress = await _ethersSigner.getAddress();
    return { provider: _ethersProvider, signer: _ethersSigner, address: _eoaAddress };
  } catch (e) {
    console.error("[PolyAuth] Failed to build ethers clients:", e);
    _ethersProvider = null;
    _ethersSigner = null;
    _eoaAddress = null;
    return null;
  }
}

/** Clear cached clients (call on logout). */
export function clearEthersClients() {
  _ethersProvider = null;
  _ethersSigner = null;
  _eoaAddress = null;
}

// ── Builder Config ─────────────────────────────────────────────────────────────

/**
 * Build the BuilderConfig used by ClobClient and RelayClient.
 * Requires @polymarket/builder-signing-sdk.
 *
 * The builder secret is intentionally omitted on the client — signing is
 * delegated to the remote endpoint at VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL.
 *
 * @returns {Promise<import("@polymarket/builder-signing-sdk").BuilderConfig|null>}
 */
export async function createBuilderConfig() {
  try {
    const { BuilderConfig } = await import("@polymarket/builder-signing-sdk");
    const signUrl = getRelaySignUrl();
    if (!signUrl) {
      console.warn(
        "[PolyAuth] VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL is not set. " +
          "Builder order attribution will be disabled. " +
          "Deploy a signing proxy and set the env var for production."
      );
      return null;
    }
    return new BuilderConfig({
      remoteBuilderConfig: { url: signUrl },
    });
  } catch (e) {
    console.error("[PolyAuth] Failed to create BuilderConfig:", e);
    return null;
  }
}

// ── RelayClient (Safe deployment & approvals) ──────────────────────────────────

/**
 * Initialise the Polymarket RelayClient for a logged-in user.
 *
 * @param {providers.JsonRpcSigner} signer  ethers signer from getEthersClients()
 * @returns {Promise<import("@polymarket/builder-relayer-client").RelayClient|null>}
 */
export async function createRelayClient(signer) {
  try {
    const { RelayClient } = await import("@polymarket/builder-relayer-client");
    const builderConfig = await createBuilderConfig();
    // builderConfig may be null if the signing URL is absent; RelayClient
    // still works for Safe deployment when called without builder auth.
    return new RelayClient(RELAYER_URL, POLYGON_CHAIN_ID, signer, builderConfig);
  } catch (e) {
    console.error("[PolyAuth] Failed to create RelayClient:", e);
    return null;
  }
}

// ── Safe Proxy deployment ──────────────────────────────────────────────────────

/**
 * Deploy a Gnosis Safe Proxy wallet for the user via the RelayClient.
 * Safe addresses are deterministic (derived from the EOA), so calling this
 * for an existing Safe is a no-op — the relay detects the existing deployment.
 *
 * @param {providers.JsonRpcSigner} signer
 * @returns {Promise<string|null>}  Safe address, or null on failure
 */
export async function deploySafeForUser(signer) {
  const relay = await createRelayClient(signer);
  if (!relay) return null;
  try {
    const safeAddress = await relay.deploySafe();
    return safeAddress;
  } catch (e) {
    // Already-deployed Safes return an error we can safely ignore.
    // Match against known error messages from the relayer and ethers.
    const msg = typeof e?.message === "string" ? e.message.toLowerCase() : "";
    const alreadyDeployed =
      msg.includes("already deployed") ||
      msg.includes("safe already exists") ||
      msg.includes("proxy already deployed") ||
      e?.code === "CALL_EXCEPTION"; // ethers contract revert
    if (alreadyDeployed) {
      try { return await relay.getSafeAddress(); } catch { /* ignore */ }
    }
    console.error("[PolyAuth] deploySafe failed:", e);
    return null;
  }
}

// ── User API Credentials ───────────────────────────────────────────────────────

/**
 * Derive or fetch Polymarket CLOB API credentials for the user's Safe address.
 * Credentials are cached in sessionStorage so they survive a page refresh within
 * the same browser session without requiring another signature.
 *
 * @param {providers.JsonRpcSigner} signer
 * @param {string} safeAddress
 * @returns {Promise<{key:string,secret:string,passphrase:string}|null>}
 */
export async function getUserClobCredentials(signer, safeAddress) {
  const storageKey = `punthub_clob_creds_${safeAddress?.toLowerCase()}`;
  try {
    const cached = sessionStorage.getItem(storageKey);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore storage errors */ }

  try {
    const { ClobClient } = await import("@polymarket/clob-client");
    // Unauthenticated client is used only to derive credentials
    const tempClient = new ClobClient(CLOB_API_URL, POLYGON_CHAIN_ID, signer);
    const creds = await tempClient.createOrDeriveAPIKey(safeAddress);
    try { sessionStorage.setItem(storageKey, JSON.stringify(creds)); } catch { /* ignore */ }
    return creds;
  } catch (e) {
    console.error("[PolyAuth] getUserClobCredentials failed:", e);
    return null;
  }
}

// ── Authenticated ClobClient ───────────────────────────────────────────────────

/**
 * Create an authenticated ClobClient ready for gasless trading with builder
 * order attribution.
 *
 * @param {providers.JsonRpcSigner} signer
 * @param {string} safeAddress
 * @param {{key:string,secret:string,passphrase:string}} creds
 * @returns {Promise<import("@polymarket/clob-client").ClobClient|null>}
 */
export async function createAuthenticatedClobClient(signer, safeAddress, creds) {
  try {
    const { ClobClient } = await import("@polymarket/clob-client");
    const builderConfig = await createBuilderConfig();
    return new ClobClient(
      CLOB_API_URL,
      POLYGON_CHAIN_ID,
      signer,
      creds,
      undefined, // signatureType — use default
      safeAddress,
      builderConfig
    );
  } catch (e) {
    console.error("[PolyAuth] createAuthenticatedClobClient failed:", e);
    return null;
  }
}

// ── Token Approvals ────────────────────────────────────────────────────────────
// Required before placing the first order: approve USDC.e on CTF Exchange,
// Neg Risk Exchange, CTF Contract, and Neg Risk Adapter.

/**
 * Set all required token approvals for Polymarket trading.
 * Batched via the RelayClient so approvals are gasless.
 * Safe to call on returning users — the relay skips already-approved tokens.
 *
 * @param {providers.JsonRpcSigner} signer
 * @returns {Promise<boolean>}  true on success
 */
export async function setPolymarketApprovals(signer) {
  const relay = await createRelayClient(signer);
  if (!relay) return false;
  try {
    await relay.setApprovals();
    return true;
  } catch (e) {
    console.error("[PolyAuth] setApprovals failed:", e);
    return false;
  }
}

// ── Full onboarding flow ───────────────────────────────────────────────────────

/**
 * Run the complete new-user or returning-user Polymarket onboarding flow:
 *
 *  1. Build ethers signer from Magic provider
 *  2. Deploy Safe (no-op for returning users)
 *  3. Derive CLOB API credentials
 *  4. Set token approvals (no-op if already approved)
 *  5. Return authenticated ClobClient
 *
 * @returns {Promise<{
 *   clobClient: import("@polymarket/clob-client").ClobClient,
 *   safeAddress: string,
 *   eoaAddress:  string,
 * }|null>}
 */
export async function setupPolymarketTrading() {
  const clients = await getEthersClients();
  if (!clients) {
    console.warn("[PolyAuth] No ethers clients — user may not be logged in via Magic.");
    return null;
  }
  const { signer, address: eoaAddress } = clients;

  // 1. Deploy / retrieve Safe
  const safeAddress = await deploySafeForUser(signer);
  if (!safeAddress) {
    console.warn("[PolyAuth] Could not deploy/retrieve Safe address.");
    return null;
  }

  // 2. CLOB credentials
  const creds = await getUserClobCredentials(signer, safeAddress);
  if (!creds) {
    console.warn("[PolyAuth] Could not derive CLOB API credentials.");
    return null;
  }

  // 3. Token approvals (gasless, idempotent)
  await setPolymarketApprovals(signer);

  // 4. Authenticated ClobClient
  const clobClient = await createAuthenticatedClobClient(signer, safeAddress, creds);

  return clobClient ? { clobClient, safeAddress, eoaAddress } : null;
}
