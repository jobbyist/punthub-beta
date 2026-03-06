import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "crypto";

// ── Payfast ITN (Instant Transaction Notification) handler ────────────────────
// Called server-to-server by Payfast after every payment event.
// Docs: https://developers.payfast.co.za/docs#notify-page

const PAYFAST_VALID_IPS = [
  "197.97.145.144",
  "197.97.145.145",
  "197.97.145.146",
  "197.97.145.147",
  "41.74.179.194",
  "41.74.179.195",
  "41.74.179.196",
  "41.74.179.197",
];

function buildSignatureFromBody(
  body: Record<string, string>,
  passphrase: string
): string {
  const paramString = Object.keys(body)
    .sort()
    .filter((k) => body[k] !== "" && k !== "signature")
    .map((k) => `${k}=${encodeURIComponent(body[k]).replace(/%20/g, "+")}`)
    .join("&");

  const hashString = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : paramString;

  return createHash("md5").update(hashString).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Payfast sends ITN as POST
  if (req.method !== "POST") {
    return res.status(405).end("Method not allowed");
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE || "";

  try {
    const body: Record<string, string> = req.body ?? {};

    // 1. Validate source IP (Payfast server IP allowlist)
    const clientIp =
      (Array.isArray(req.headers["x-forwarded-for"])
        ? req.headers["x-forwarded-for"][0]
        : req.headers["x-forwarded-for"]) ||
      String(req.socket?.remoteAddress || "");

    const normalizedIp = clientIp.split(",")[0].trim();

    // Skip IP check in sandbox mode
    const sandbox = process.env.PAYFAST_SANDBOX === "true";
    if (!sandbox && !PAYFAST_VALID_IPS.includes(normalizedIp)) {
      console.warn("[PayfastITN] Rejected unknown source IP:", normalizedIp);
      return res.status(403).end("Forbidden");
    }

    // 2. Verify the MD5 signature
    const receivedSignature = body.signature || "";
    const expectedSignature = buildSignatureFromBody(body, passphrase);

    if (receivedSignature !== expectedSignature) {
      console.error("[PayfastITN] Signature mismatch", {
        received: receivedSignature,
        expected: expectedSignature,
      });
      return res.status(400).end("Invalid signature");
    }

    // 3. Check payment status
    const paymentStatus = body.payment_status;
    if (paymentStatus !== "COMPLETE") {
      // Not an error — just not a completed payment (could be pending, cancelled, etc.)
      console.info("[PayfastITN] Non-complete status:", paymentStatus);
      return res.status(200).end("OK");
    }

    // 4. Verify merchant ID matches
    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    if (merchantId && body.merchant_id !== merchantId) {
      console.error("[PayfastITN] Merchant ID mismatch");
      return res.status(400).end("Merchant mismatch");
    }

    // Log completed payment (extend here with database writes in production)
    console.info("[PayfastITN] Payment complete", {
      payment_id: body.m_payment_id,
      pf_payment_id: body.pf_payment_id,
      amount_gross: body.amount_gross,
      email: body.email_address,
      custom_str1: body.custom_str1, // coins amount stored here
    });

    // Respond with 200 so Payfast knows the ITN was received
    return res.status(200).end("OK");
  } catch (err) {
    console.error("[PayfastITN] Unexpected error:", err);
    return res.status(500).end("Internal error");
  }
}
