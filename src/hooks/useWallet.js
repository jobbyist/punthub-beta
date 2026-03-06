// ─── useWallet — React hook for Magic auth + Polymarket wallet state ───────────
// Wraps loginWithEmail / logoutMagic and exposes the full wallet state to
// React components.  All heavy SDK work is deferred so the initial render
// stays fast.

import { useState, useEffect, useCallback } from "react";
import {
  loginWithEmail,
  logoutMagic,
  isMagicLoggedIn,
  getMagicUserInfo,
} from "../services/magic.js";
import {
  getEthersClients,
  clearEthersClients,
  setupPolymarketTrading,
} from "../services/polymarketAuth.js";

/**
 * @typedef {Object} WalletState
 * @property {boolean}  isConnected       - True when the user is authenticated via Magic
 * @property {boolean}  isLoading         - True while an async auth operation is in progress
 * @property {string|null} email          - Authenticated user's email address
 * @property {string|null} eoaAddress     - Magic-provisioned EOA wallet address
 * @property {string|null} safeAddress    - Polymarket Safe proxy address (null until setup)
 * @property {object|null}  clobClient    - Authenticated Polymarket ClobClient (null until setup)
 * @property {string|null}  error         - Last error message, if any
 * @property {Function} connect           - (email: string) => Promise<void>  — start email OTP flow
 * @property {Function} disconnect        - () => Promise<void>               — log out
 * @property {Function} setupTrading      - () => Promise<void>               — run Polymarket onboarding
 */

/**
 * React hook that manages Magic authentication state and exposes Polymarket
 * wallet clients (Safe address, ClobClient) for the rest of the app.
 *
 * @returns {WalletState}
 */
export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // true during initial session check
  const [email, setEmail] = useState(null);
  const [eoaAddress, setEoaAddress] = useState(null);
  const [safeAddress, setSafeAddress] = useState(null);
  const [clobClient, setClobClient] = useState(null);
  const [error, setError] = useState(null);

  // ── Check existing session on mount ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const loggedIn = await isMagicLoggedIn();
        if (cancelled) return;
        if (loggedIn) {
          const info = await getMagicUserInfo();
          if (cancelled) return;
          const clients = await getEthersClients();
          if (cancelled) return;
          setEmail(info?.email || null);
          setEoaAddress(clients?.address || info?.publicAddress || null);
          setIsConnected(true);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn("[useWallet] Session check failed:", e);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, []);

  // ── connect — trigger email OTP login ────────────────────────────────────────
  const connect = useCallback(async (emailInput) => {
    if (!emailInput) return;
    setIsLoading(true);
    setError(null);
    try {
      const address = await loginWithEmail(emailInput);
      if (address) {
        const info = await getMagicUserInfo();
        setEmail(info?.email || emailInput);
        setEoaAddress(address);
        setIsConnected(true);
      } else {
        // User cancelled OTP — not a hard error
        setError(null);
      }
    } catch (e) {
      console.error("[useWallet] connect failed:", e);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── disconnect — log out and clear state ─────────────────────────────────────
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logoutMagic();
      clearEthersClients();
    } catch (e) {
      console.warn("[useWallet] disconnect failed:", e);
    } finally {
      setEmail(null);
      setEoaAddress(null);
      setSafeAddress(null);
      setClobClient(null);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, []);

  // ── setupTrading — run Polymarket onboarding (Safe + approvals + creds) ──────
  const setupTrading = useCallback(async () => {
    if (!isConnected) {
      setError("Connect your wallet first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await setupPolymarketTrading();
      if (result) {
        setSafeAddress(result.safeAddress);
        setClobClient(result.clobClient);
      } else {
        // setupPolymarketTrading already logs the root cause
        setError(
          "Polymarket setup incomplete. Check that VITE_MAGIC_PUBLISHABLE_KEY " +
            "and VITE_POLYMARKET_BUILDER_RELAY_SIGN_URL are configured."
        );
      }
    } catch (e) {
      console.error("[useWallet] setupTrading failed:", e);
      setError("Polymarket setup failed. See console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  return {
    isConnected,
    isLoading,
    email,
    eoaAddress,
    safeAddress,
    clobClient,
    error,
    connect,
    disconnect,
    setupTrading,
  };
}
