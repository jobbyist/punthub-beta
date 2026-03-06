import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildHmacSignature } from "@polymarket/builder-signing-sdk";
import { setCors } from "../_cors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { method, path, body } = req.body ?? {};

    if (!method || !path) {
      return res.status(400).json({ error: "Missing method or path" });
    }

    const key = process.env.POLYMARKET_BUILDER_API_KEY;
    const secret = process.env.POLYMARKET_BUILDER_SECRET;
    const passphrase = process.env.POLYMARKET_BUILDER_PASSPHRASE;

    if (!key || !secret || !passphrase) {
      return res.status(500).json({ error: "Missing server env vars" });
    }

    const timestamp = Date.now().toString();
    const bodyStr: string | undefined =
      body !== undefined && body !== null
        ? typeof body === "string" ? body : JSON.stringify(body)
        : undefined;

    const signature = buildHmacSignature(
      secret,
      Number(timestamp),
      method,
      path,
      bodyStr
    );

    return res.status(200).json({
      POLY_BUILDER_API_KEY: key,
      POLY_BUILDER_PASSPHRASE: passphrase,
      POLY_BUILDER_TIMESTAMP: timestamp,
      POLY_BUILDER_SIGNATURE: signature,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Signing failed" });
  }
}
