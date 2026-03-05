// ─── MAGIC EMBEDDED WALLET SERVICE ───────────────────────────────────────────
// Provides a singleton Magic instance configured for Polygon mainnet.
// Used for passwordless email OTP authentication and non-custodial EOA
// wallet provisioning via Magic's TKMS (TEE Key Management System).
//
// Reference: https://docs.magic.link/home/integrations/embedded-wallets/polymarket
// Reference: https://github.com/Polymarket/magic-safe-builder-example

import { Magic } from "magic-sdk";
import { providers } from "ethers";

const POLYGON_RPC_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_POLYGON_RPC_URL) ||
  "https://polygon-rpc.com";

const POLYGON_CHAIN_ID = 137;

let _magic = null;

/**
 * Return (or lazily create) the Magic singleton.
 * Must only be called in a browser context.
 */
export function getMagic() {
  if (typeof window === "undefined") return null;
  if (_magic) return _magic;

  const apiKey =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_MAGIC_PUBLISHABLE_KEY) || "";

  if (!apiKey) {
    console.warn("[Magic] VITE_MAGIC_PUBLISHABLE_KEY is not set. Auth will be unavailable.");
    return null;
  }

  _magic = new Magic(apiKey, {
    network: {
      rpcUrl: POLYGON_RPC_URL,
      chainId: POLYGON_CHAIN_ID,
    },
  });

  return _magic;
}

/**
 * Authenticate a user via Magic email OTP.
 * Opens Magic's embedded UI; returns the user's EOA address on success.
 * Throws if the user cancels or an error occurs.
 *
 * @param {string} email - User's email address
 * @returns {Promise<{ eoaAddress: string, email: string, ethersSigner: import("ethers").Signer }>}
 */
export async function loginWithMagic(email) {
  const magic = getMagic();
  if (!magic) throw new Error("Magic is not configured. Set VITE_MAGIC_PUBLISHABLE_KEY.");

  // Trigger email OTP flow — Magic handles the UI popup
  await magic.auth.loginWithEmailOTP({ email });

  const userInfo = await magic.user.getInfo();
  const eoaAddress = userInfo.publicAddress;

  // Build an ethers v5 signer backed by Magic's RPC provider
  const ethersProvider = new providers.Web3Provider(magic.rpcProvider);
  const ethersSigner = ethersProvider.getSigner();

  return { eoaAddress, email: userInfo.email, ethersSigner };
}

/**
 * Log the current user out of Magic and clear the singleton.
 */
export async function logoutMagic() {
  const magic = getMagic();
  if (magic) {
    await magic.user.logout();
    _magic = null;
  }
}

/**
 * Check whether a Magic session is already active.
 * Returns user info if logged in, or null otherwise.
 *
 * @returns {Promise<{ eoaAddress: string, email: string } | null>}
 */
export async function getMagicUserIfLoggedIn() {
  const magic = getMagic();
  if (!magic) return null;
  try {
    const isLoggedIn = await magic.user.isLoggedIn();
    if (!isLoggedIn) return null;
    const userInfo = await magic.user.getInfo();
    return { eoaAddress: userInfo.publicAddress, email: userInfo.email };
  } catch {
    return null;
  }
}


