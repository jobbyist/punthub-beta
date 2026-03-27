// ─── useWallet — React hook for Magic auth + Polymarket wallet state ───────────
// Wraps loginWithEmail / logoutMagic and exposes the full wallet state to
// React components.  All heavy SDK work is deferred so the initial render
// stays fast.

import { useState, useEffect, useCallback, useRef } from "react";
import {
  initMagic,
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
 * @property {boolean}  otpSent           - True after OTP email has been dispatched (custom UI flow)
 * @property {string|null} otpError       - Error message for OTP verification failures
 * @property {string|null} email          - Authenticated user's email address
 * @property {string|null} eoaAddress     - Magic-provisioned EOA wallet address
 * @property {string|null} safeAddress    - Polymarket Safe proxy address (null until setup)
 * @property {object|null}  clobClient    - Authenticated Polymarket ClobClient (null until setup)
 * @property {string|null}  error         - Last error message, if any
 * @property {Function} sendOTP           - (email: string) => Promise<void>  — send OTP via custom UI
 * @property {Function} verifyOTP         - (otp: string) => void             — submit OTP code
 * @property {Function} cancelOTP         - () => void                        — cancel OTP flow
 * @property {Function} connect           - (email: string) => Promise<void>  — legacy: full OTP flow with Magic UI
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
  const [isLoading, setIsLoading] = useState(false); // only true during active auth operations
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [email, setEmail] = useState(null);
  const [eoaAddress, setEoaAddress] = useState(null);
  const [safeAddress, setSafeAddress] = useState(null);
  const [clobClient, setClobClient] = useState(null);
  const [error, setError] = useState(null);

  // Holds the Magic PromiEvent handle during the custom OTP flow
  const otpHandleRef = useRef(null);

  // ── Check existing session on mount (non-blocking background check) ──────────
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

  // ── sendOTP — initiate custom-UI OTP flow ────────────────────────────────────
  // Uses Magic's showUI:false PromiEvent pattern so we control the OTP screen.
  const sendOTP = useCallback(async (emailInput) => {
    if (!emailInput) return;
    setIsLoading(true);
    setError(null);
    setOtpError(null);
    setOtpSent(false);

    try {
      const magic = await initMagic();
      if (!magic) {
        // Magic not configured — fall back to classic connect
        await connect(emailInput);
        return;
      }

      const handle = magic.auth.loginWithEmailOTP({ email: emailInput, showUI: false });
      otpHandleRef.current = handle;

      handle.on("email-otp-sent", () => {
        setIsLoading(false);
        setOtpSent(true);
      });

      handle.on("invalid-email-otp", () => {
        setOtpError("Incorrect code — double-check and try again.");
      });

      handle.on("email-otp-expired", () => {
        setOtpError("Code expired. Please request a new one.");
        setOtpSent(false);
        setIsLoading(false);
        otpHandleRef.current = null;
      });

      // Await final resolution (fires after successful OTP verification)
      handle
        .then(async () => {
          try {
            const info = await getMagicUserInfo();
            setEmail(info?.email || emailInput);
            const clients = await getEthersClients();
            setEoaAddress(clients?.address || info?.publicAddress || null);
            setIsConnected(true);
          } catch (infoErr) {
            console.warn("[useWallet] getInfo after OTP failed:", infoErr);
          }
          setOtpSent(false);
          setIsLoading(false);
          otpHandleRef.current = null;
        })
        .catch((e) => {
          if (e?.code !== -32603) {
            console.error("[useWallet] OTP login failed:", e);
            setError("Login failed. Please try again.");
          }
          setOtpSent(false);
          setIsLoading(false);
          otpHandleRef.current = null;
        });
    } catch (e) {
      console.error("[useWallet] sendOTP failed:", e);
      setError("Failed to send OTP. Please try again.");
      setIsLoading(false);
    }
  }, [connect]);

  // ── verifyOTP — submit the code the user typed ────────────────────────────────
  const verifyOTP = useCallback((otp) => {
    const handle = otpHandleRef.current;
    if (!handle || !otp) return;
    setOtpError(null);
    try {
      handle.emit("verify-email-otp", otp);
    } catch (e) {
      console.error("[useWallet] verifyOTP failed:", e);
      setOtpError("Failed to verify code. Check that you entered the correct digits, or request a new code.");
    }
  }, []);

  // ── cancelOTP — abort the current OTP flow ────────────────────────────────────
  const cancelOTP = useCallback(() => {
    const handle = otpHandleRef.current;
    if (handle) {
      try { handle.emit("cancel"); } catch { /* ignore */ }
      otpHandleRef.current = null;
    }
    setOtpSent(false);
    setIsLoading(false);
    setOtpError(null);
  }, []);
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
    otpSent,
    otpError,
    email,
    eoaAddress,
    safeAddress,
    clobClient,
    error,
    sendOTP,
    verifyOTP,
    cancelOTP,
    connect,
    disconnect,
    setupTrading,
  };
}
