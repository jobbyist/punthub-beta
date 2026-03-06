// ─── MAGIC SDK SINGLETON ───────────────────────────────────────────────────────
// Provides passwordless email OTP authentication via Magic's Embedded Wallet.
// The singleton is lazily created on first call so that SSR/static builds
// that run without a DOM never try to instantiate the SDK.
//
// Magic docs: https://docs.magic.link/home/integrations/embedded-wallets/polymarket
// Reference:  https://github.com/Polymarket/magic-safe-builder-example

// Polygon mainnet — required for Polymarket (CLOB lives on Polygon)
export const POLYGON_CHAIN_ID = 137;
export const POLYGON_RPC_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_POLYGON_RPC_URL) ||
  "https://polygon-rpc.com";

let _magic = null;

/**
 * Returns the Magic SDK singleton, lazily instantiated.
 * Returns null in non-browser environments (SSR / static build pre-rendering).
 *
 * @deprecated Prefer the async `initMagic()` for ES module / tree-shaking compatibility.
 * This synchronous helper is kept for backwards compatibility only.
 */
export function getMagic() {
  if (typeof window === "undefined") return null;
  return _magic; // Returns null until initMagic() has been called at least once
}

/**
 * Asynchronously initialise Magic using dynamic import (tree-shake friendly).
 * Resolves with the Magic instance, or null if the key is absent.
 */
export async function initMagic() {
  if (typeof window === "undefined") return null;
  if (_magic) return _magic;

  const apiKey =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_MAGIC_PUBLISHABLE_KEY) || "";

  if (!apiKey) {
    console.warn(
      "[Magic] VITE_MAGIC_PUBLISHABLE_KEY is not set — running in demo mode."
    );
    return null;
  }

  try {
    const { Magic } = await import("magic-sdk");
    _magic = new Magic(apiKey, {
      network: {
        rpcUrl: POLYGON_RPC_URL,
        chainId: POLYGON_CHAIN_ID,
      },
    });
    return _magic;
  } catch (e) {
    console.error("[Magic] Failed to initialise Magic SDK:", e);
    return null;
  }
}

/**
 * Log the user in with a passwordless email OTP.
 * Returns the user's EOA address on success, or null on failure/demo mode.
 *
 * @param {string} email
 * @returns {Promise<string|null>} EOA address
 */
export async function loginWithEmail(email) {
  const magic = await initMagic();
  if (!magic) return null;

  try {
    await magic.auth.loginWithEmailOTP({ email, showUI: true });
    const info = await magic.user.getInfo();
    return info.publicAddress || null;
  } catch (e) {
    if (e?.code === -32603) {
      // User cancelled the OTP dialog — not an error worth logging loudly
      return null;
    }
    console.error("[Magic] loginWithEmail failed:", e);
    return null;
  }
}

/**
 * Log the current user out.
 */
export async function logoutMagic() {
  const magic = await initMagic();
  if (!magic) return;
  try {
    await magic.user.logout();
  } catch (e) {
    console.warn("[Magic] logout failed:", e);
  }
}

/**
 * Check whether a Magic user is currently logged in.
 * @returns {Promise<boolean>}
 */
export async function isMagicLoggedIn() {
  const magic = await initMagic();
  if (!magic) return false;
  try {
    return await magic.user.isLoggedIn();
  } catch {
    return false;
  }
}

/**
 * Return the currently-authenticated Magic user's info.
 * @returns {Promise<{email:string, publicAddress:string}|null>}
 */
export async function getMagicUserInfo() {
  const magic = await initMagic();
  if (!magic) return null;
  try {
    return await magic.user.getInfo();
  } catch {
    return null;
  }
}
