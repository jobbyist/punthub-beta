// ─── POLYMARKET CLOB + BUILDER RELAYER SERVICE ────────────────────────────────
// Integrates Polymarket's CLOB Client and Builder Relayer Client for
// gasless trading with builder order attribution via the Builder Program.
//
// Flow (new user):
//   1. Magic authentication → EOA wallet provisioned
//   2. Initialize RelayClient with builder config (remote signing)
//   3. Derive Safe address (deterministic from EOA)
//   4. Deploy Safe via RelayClient if not yet deployed
//   5. Derive or create User API Credentials via ClobClient
//   6. Set token approvals (USDC.e + outcome tokens) via batch tx
//   7. Initialize authenticated ClobClient with builder attribution
//
// Flow (returning user):
//   1. Magic authentication → retrieve existing EOA
//   2. Load cached session from localStorage
//   3. Skip deployment + approvals if already done
//   4. Initialize authenticated ClobClient
//
// Reference: https://github.com/Polymarket/magic-safe-builder-example

import { ClobClient } from "@polymarket/clob-client";
import { RelayClient } from "@polymarket/builder-relayer-client";
import { BuilderConfig } from "@polymarket/builder-signing-sdk";
import { getMagic } from "./magic.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const CLOB_URL = "https://clob.polymarket.com";
const RELAYER_URL = "https://relayer-v2.polymarket.com/";
const POLYGON_CHAIN_ID = 137;

// Polygon contract addresses
export const USDC_E_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
export const CTF_CONTRACT_ADDRESS = "0x4d97dcd97ec945f40cf65f87097ace5ea0476045";
export const CTF_EXCHANGE_ADDRESS = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E";
export const NEG_RISK_CTF_EXCHANGE_ADDRESS = "0xC5d563A36AE78145C45a50134d48A1215220f80a";
export const NEG_RISK_ADAPTER_ADDRESS = "0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296";

// localStorage keys
const SESSION_KEY = "punthub_trading_session";

// ── Builder config ─────────────────────────────────────────────────────────────
// Builder credentials are read from VITE_ env vars at runtime.
// In production, prefer a server-side proxy endpoint so the secret never
// reaches the client bundle. See README for GitHub Secrets setup instructions.

function getBuilderEnv() {
  const env = (typeof import.meta !== "undefined" && import.meta.env) || {};
  return {
    apiKey: env.VITE_POLYMARKET_BUILDER_API_KEY || "",
    secret: env.VITE_POLYMARKET_BUILDER_SECRET || "",
    passphrase: env.VITE_POLYMARKET_BUILDER_PASSPHRASE || "",
  };
}

function isBuilderConfigured() {
  const { apiKey, secret, passphrase } = getBuilderEnv();
  return Boolean(apiKey && secret && passphrase);
}

/**
 * Build a BuilderConfig object.
 * Uses inline credentials when no remote signing endpoint is available
 * (acceptable for demos; use a server-side proxy for production).
 *
 * @returns {BuilderConfig}
 */
function createBuilderConfig() {
  const { apiKey, secret, passphrase } = getBuilderEnv();
  return new BuilderConfig({
    builderApiKeyCreds: { key: apiKey, secret, passphrase },
  });
}

// ── Session persistence ────────────────────────────────────────────────────────

/**
 * Load a persisted trading session from localStorage.
 * @returns {{ safeAddress: string, credentials: object } | null}
 */
export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save trading session data to localStorage.
 * @param {{ safeAddress: string, credentials: object }} session
 */
export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage quota exceeded or private browsing — ignore
  }
}

/**
 * Clear the stored trading session (e.g. on logout).
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── RelayClient ────────────────────────────────────────────────────────────────

/**
 * Initialize the RelayClient with the user's Magic EOA signer and builder config.
 *
 * @param {import("ethers").Signer} ethersSigner - Signer from Magic's provider
 * @returns {RelayClient}
 */
export function initRelayClient(ethersSigner) {
  const builderConfig = createBuilderConfig();
  return new RelayClient(RELAYER_URL, POLYGON_CHAIN_ID, ethersSigner, builderConfig);
}

// ── Safe deployment ────────────────────────────────────────────────────────────

/**
 * Derive the deterministic Safe proxy address for a given EOA, then deploy
 * the Safe if it has not been deployed yet.
 *
 * @param {RelayClient} relayClient
 * @param {string} eoaAddress
 * @returns {Promise<string>} The Safe proxy address
 */
export async function ensureSafeDeployed(relayClient, eoaAddress) {
  // Dynamic import to keep the bundle lean for users who don't trade
  const { deriveSafe } = await import(
    "@polymarket/builder-relayer-client/dist/builder/derive"
  );
  const { getContractConfig } = await import(
    "@polymarket/builder-relayer-client/dist/config"
  );

  const config = getContractConfig(POLYGON_CHAIN_ID);
  const safeAddress = deriveSafe(eoaAddress, config.SafeContracts.SafeFactory);

  const isDeployed = await relayClient.getDeployed(safeAddress);
  if (!isDeployed) {
    console.log("[Trading] Deploying Safe for", eoaAddress);
    const response = await relayClient.deploy();
    const result = await response.wait();
    console.log("[Trading] Safe deployed at:", result.proxyAddress);
  }

  return safeAddress;
}

// ── User API Credentials ───────────────────────────────────────────────────────

/**
 * Derive (or create) Polymarket User API Credentials using a temporary ClobClient.
 * Credentials are cached in localStorage for subsequent sessions.
 *
 * @param {import("ethers").Signer} ethersSigner
 * @param {string} safeAddress
 * @returns {Promise<{ key: string, secret: string, passphrase: string }>}
 */
export async function getOrCreateUserCredentials(ethersSigner, safeAddress) {
  // Check localStorage cache first
  const cached = loadSession();
  if (cached?.credentials && cached?.safeAddress === safeAddress) {
    return cached.credentials;
  }

  // Create a temporary (unauthenticated) ClobClient to derive credentials
  const tempClient = new ClobClient(CLOB_URL, POLYGON_CHAIN_ID, ethersSigner);

  let creds;
  try {
    creds = await tempClient.deriveApiKey();
  } catch {
    creds = await tempClient.createApiKey();
  }

  return creds;
}

// ── Authenticated ClobClient ───────────────────────────────────────────────────

/**
 * Initialize the authenticated ClobClient with builder attribution.
 *
 * @param {import("ethers").Signer} ethersSigner
 * @param {{ key: string, secret: string, passphrase: string }} userCreds
 * @param {string} safeAddress
 * @returns {ClobClient}
 */
export function initClobClient(ethersSigner, userCreds, safeAddress) {
  const builderConfig = createBuilderConfig();
  return new ClobClient(
    CLOB_URL,
    POLYGON_CHAIN_ID,
    ethersSigner,
    userCreds,
    2, // signatureType = 2: EOA associated with a Gnosis Safe proxy wallet
    safeAddress,
    undefined,
    false,
    builderConfig
  );
}

// ── Full trading session initializer ──────────────────────────────────────────

/**
 * Orchestrate the full trading session setup.
 * Emits progress updates via the `onStep` callback.
 *
 * @param {import("ethers").Signer} ethersSigner - Signer from Magic
 * @param {string} eoaAddress                    - Magic EOA address
 * @param {function(string): void} onStep        - Progress callback
 * @returns {Promise<{ safeAddress: string, clobClient: ClobClient, relayClient: RelayClient }>}
 */
export async function initTradingSession(ethersSigner, eoaAddress, onStep = () => {}) {
  if (!isBuilderConfigured()) {
    throw new Error(
      "Polymarket Builder credentials are not configured. " +
        "Set VITE_POLYMARKET_BUILDER_API_KEY, VITE_POLYMARKET_BUILDER_SECRET, " +
        "and VITE_POLYMARKET_BUILDER_PASSPHRASE."
    );
  }

  onStep("Initializing relay client…");
  const relayClient = initRelayClient(ethersSigner);

  onStep("Deriving Safe wallet address…");
  const safeAddress = await ensureSafeDeployed(relayClient, eoaAddress);

  onStep("Fetching trading credentials…");
  const credentials = await getOrCreateUserCredentials(ethersSigner, safeAddress);

  onStep("Setting up token approvals…");
  const { ensureTokenApprovals } = await import("./approvals.js");
  await ensureTokenApprovals(relayClient, safeAddress);

  onStep("Initializing CLOB client…");
  const clobClient = initClobClient(ethersSigner, credentials, safeAddress);

  // Persist session for returning users
  saveSession({ safeAddress, credentials });

  onStep("Ready to trade ✓");
  return { safeAddress, clobClient, relayClient };
}

// ── Order helpers ──────────────────────────────────────────────────────────────

/**
 * Place a GTC order on Polymarket with builder attribution.
 *
 * @param {ClobClient} clobClient
 * @param {{ tokenID: string, price: number, size: number, side: "BUY"|"SELL", negRisk?: boolean }} order
 * @returns {Promise<{ orderID: string }>}
 */
export async function placeOrder(clobClient, { tokenID, price, size, side, negRisk = false }) {
  const { OrderType } = await import("@polymarket/clob-client");
  const response = await clobClient.createAndPostOrder(
    {
      tokenID,
      price,
      size,
      side,
      feeRateBps: 0,
      expiration: 0, // GTC
      taker: "0x0000000000000000000000000000000000000000",
    },
    { negRisk },
    OrderType.GTC
  );
  return response;
}

/**
 * Cancel an open order by ID.
 *
 * @param {ClobClient} clobClient
 * @param {string} orderID
 */
export async function cancelOrder(clobClient, orderID) {
  await clobClient.cancelOrder({ orderID });
}

export { isBuilderConfigured };
