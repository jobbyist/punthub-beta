import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { setCors } from "../_cors.js";

// ── Payfast MD5 signature ──────────────────────────────────────────────────────
// Sorts key=value pairs alphabetically, appends passphrase, and MD5-hashes.
// Implements the algorithm described at https://developers.payfast.co.za/docs#signing
function buildPayfastSignature(
  fields: Record<string, string>,
  passphrase: string
): string {
  const paramString = Object.keys(fields)
    .sort()
    .filter((k) => fields[k] !== "" && k !== "signature")
    .map((k) => `${k}=${encodeURIComponent(fields[k]).replace(/%20/g, "+")}`)
    .join("&");

  const hashString = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : paramString;

  return createHash("md5").update(hashString).digest("hex");
}

// ── Grant token ────────────────────────────────────────────────────────────────
// Generates a time-limited HMAC token for a specific coin grant.
// The token encodes the coin amount and a 5-minute epoch window so it expires
// naturally without requiring database storage.
function buildGrantToken(coins: number, secret: string): string {
  const window = Math.floor(Date.now() / 300_000); // 5-minute window
  return createHmac("sha256", secret)
    .update(`${coins}:${window}`)
    .digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const itnSecret = process.env.PAYFAST_ITN_SECRET;
  const sandbox = process.env.PAYFAST_SANDBOX === "true";
  const notifyUrl = process.env.PAYFAST_NOTIFY_URL || "";

  if (!merchantId || !merchantKey || !itnSecret) {
    return res.status(500).json({ error: "Payfast not configured on server" });
  }

  const { amount, coins, email, firstName } = req.body ?? {};

  if (!amount || !coins || typeof coins !== "number" || coins <= 0) {
    return res.status(400).json({ error: "Invalid amount or coins" });
  }

  // Build origin from request headers for the return/cancel URLs
  const origin = req.headers.origin || `https://${req.headers.host}`;
  const returnPath = "/?pf_grant=1";

  // Generate a grant token so the return URL can be server-verified
  const grantToken = buildGrantToken(coins, itnSecret);

  const fields: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${origin}${returnPath}&pf_token=${grantToken}&pf_coins=${coins}`,
    cancel_url: `${origin}/`,
    notify_url: notifyUrl,
    ...(email ? { email_address: String(email) } : {}),
    ...(firstName ? { name_first: String(firstName) } : {}),
    amount: Number(amount).toFixed(2),
    item_name: `${coins} PuntCoins — PuntHub`,
    custom_str1: String(coins), // passed back by Payfast in ITN
  };

  // Exclude notify_url from signature if it's empty
  if (!fields.notify_url) delete fields.notify_url;

  const signature = buildPayfastSignature(fields, passphrase);

  return res.status(200).json({
    fields: { ...fields, signature },
    endpoint: sandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process",
    grant_token: grantToken,
  });
}
