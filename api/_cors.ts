import type { VercelRequest, VercelResponse } from "@vercel/node";

// Allowed origins: the GitHub Pages frontend and any custom domain.
// In production, tighten this to the exact frontend origin.
const ALLOWED_ORIGINS = [
  "https://punthub.fun",
  "https://www.punthub.fun",
  "https://punthub.gravitas.uno",
  // Allow localhost for local development
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowed) =>
    typeof allowed === "string" ? allowed === origin : allowed.test(origin)
  );
}

/**
 * Set CORS headers on the response.
 * Returns true when the request was a preflight (OPTIONS) and has been fully handled.
 */
export function setCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin as string);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, " +
      "POLY_ADDRESS, POLY_API_KEY, POLY_PASSPHRASE, POLY_SIGNATURE, POLY_TIMESTAMP"
  );

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}
