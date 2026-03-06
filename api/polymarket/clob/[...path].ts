import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildHmacSignature } from "@polymarket/builder-signing-sdk";
import { setCors } from "../../_cors.js";

const BASE_URL = "https://clob.polymarket.com";

// Only allow these HTTP methods to be proxied
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

function getBuilderHeaders(method: string, path: string, body?: unknown) {
  const key = process.env.POLYMARKET_BUILDER_API_KEY;
  const secret = process.env.POLYMARKET_BUILDER_SECRET;
  const passphrase = process.env.POLYMARKET_BUILDER_PASSPHRASE;

  if (!key || !secret || !passphrase) {
    throw new Error("Missing Polymarket builder env vars on server");
  }

  const timestamp = Date.now().toString();
  const bodyStr = body !== undefined ? JSON.stringify(body) : undefined;

  const signature = buildHmacSignature(
    secret,
    Number(timestamp),
    method,
    path,
    bodyStr
  );

  return {
    POLY_BUILDER_API_KEY: key,
    POLY_BUILDER_PASSPHRASE: passphrase,
    POLY_BUILDER_TIMESTAMP: timestamp,
    POLY_BUILDER_SIGNATURE: signature,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  const method = req.method || "GET";

  if (!ALLOWED_METHODS.has(method)) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const pathParts = req.query.path;
    const upstreamPath = `/${Array.isArray(pathParts) ? pathParts.join("/") : pathParts || ""}`;

    // Guard: only proxy to the Polymarket CLOB domain
    if (!/^\/[\w\-/.?=&%+]*$/.test(upstreamPath)) {
      return res.status(400).json({ error: "Invalid path" });
    }

    const body = ["POST", "PUT", "PATCH"].includes(method) ? req.body : undefined;

    const builderHeaders = getBuilderHeaders(method, upstreamPath, body);

    const upstream = await fetch(`${BASE_URL}${upstreamPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...builderHeaders,

        // Forward user-auth headers when provided by the client
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
