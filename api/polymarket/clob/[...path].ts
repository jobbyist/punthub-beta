import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildHmacSignature } from "@polymarket/builder-signing-sdk";

const BASE_URL = "https://clob.polymarket.com";

function getBuilderHeaders(method: string, path: string, body?: unknown) {
  const key = process.env.POLYMARKET_BUILDER_API_KEY!;
  const secret = process.env.POLYMARKET_BUILDER_SECRET!;
  const passphrase = process.env.POLYMARKET_BUILDER_PASSPHRASE!;
  const timestamp = Date.now().toString();

  const signature = buildHmacSignature(
    secret,
    Number(timestamp),
    method,
    path,
    body
  );

  return {
    POLY_BUILDER_API_KEY: key,
    POLY_BUILDER_PASSPHRASE: passphrase,
    POLY_BUILDER_TIMESTAMP: timestamp,
    POLY_BUILDER_SIGNATURE: signature,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const pathParts = req.query.path;
    const upstreamPath = `/${Array.isArray(pathParts) ? pathParts.join("/") : pathParts || ""}`;

    const method = req.method || "GET";
    const body = ["POST", "PUT", "PATCH"].includes(method) ? req.body : undefined;

    const builderHeaders = getBuilderHeaders(method, upstreamPath, body);

    const upstream = await fetch(`${BASE_URL}${upstreamPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...builderHeaders,

        // forward user-auth headers only if needed by your flow
        ...(req.headers.poly_address
          ? { POLY_ADDRESS: String(req.headers.poly_address) }
          : {}),
        ...(req.headers.poly_api_key
          ? { POLY_API_KEY: String(req.headers.poly_api_key) }
          : {}),
        ...(req.headers.poly_passphrase
          ? { POLY_PASSPHRASE: String(req.headers.poly_passphrase) }
          : {}),
        ...(req.headers.poly_signature
          ? { POLY_SIGNATURE: String(req.headers.poly_signature) }
          : {}),
        ...(req.headers.poly_timestamp
          ? { POLY_TIMESTAMP: String(req.headers.poly_timestamp) }
          : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await upstream.text();

    res.status(upstream.status).setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json"
    );

    return res.send(text);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Proxy failed" });
  }
}
