import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac, timingSafeEqual } from "crypto";
import { setCors } from "../_cors.js";

// ── Payfast grant token verifier ───────────────────────────────────────────────
// The client calls this endpoint after being redirected back from Payfast's
// payment page.  It verifies the time-limited HMAC token issued by
// /api/payfast/prepare before crediting PuntCoins.
//
// Tokens are valid for ~10 minutes (two consecutive 5-minute windows).
// Replay within the same session is prevented client-side via sessionStorage.

function buildGrantToken(coins: number, secret: string, windowOffset = 0): string {
  const window = Math.floor(Date.now() / 300_000) - windowOffset;
  return createHmac("sha256", secret)
    .update(`${coins}:${window}`)
    .digest("hex");
}

function safeEquals(a: string, b: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.PAYFAST_ITN_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Grant verification not configured" });
  }

  const { token, coins: coinsStr } = req.query;

  if (!token || !coinsStr || typeof token !== "string" || typeof coinsStr !== "string") {
    return res.status(400).json({ error: "Missing token or coins" });
  }

  const coins = parseInt(coinsStr, 10);
  if (isNaN(coins) || coins <= 0 || coins > 10_000) {
    return res.status(400).json({ error: "Invalid coins value" });
  }

  // Accept tokens from the current 5-minute window and the previous one (~10 min total)
  const expectedCurrent = buildGrantToken(coins, secret, 0);
  const expectedPrev = buildGrantToken(coins, secret, 1);

  const isValid =
    safeEquals(token, expectedCurrent) || safeEquals(token, expectedPrev);

  if (!isValid) {
    return res.status(403).json({ error: "Invalid or expired grant token" });
  }

  return res.status(200).json({ ok: true, coins });
}
