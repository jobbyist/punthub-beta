// ─── POLYMARKET API SERVICE ───────────────────────────────────────────────────
// Fetches live prediction markets from Polymarket Gamma API and Data API.
// Markets are filtered to: active, not-yet-closed, non-trivial probability split.

const GAMMA_API = "https://gamma-api.polymarket.com";

// Map Polymarket tags/categories to app categories
const CATEGORY_MAP = {
  politics: "politics",
  election: "politics",
  government: "politics",
  sports: "sports",
  football: "sports",
  soccer: "sports",
  basketball: "sports",
  tennis: "sports",
  cricket: "sports",
  nba: "sports",
  nfl: "sports",
  fifa: "sports",
  crypto: "crypto",
  cryptocurrency: "crypto",
  bitcoin: "crypto",
  ethereum: "crypto",
  defi: "crypto",
  web3: "crypto",
  blockchain: "crypto",
  technology: "tech",
  tech: "tech",
  ai: "tech",
  "artificial intelligence": "tech",
  software: "tech",
  music: "music",
  entertainment: "celebrity",
  celebrity: "celebrity",
  science: "science",
  space: "science",
  climate: "science",
  economics: "markets",
  markets: "markets",
  stocks: "markets",
  finance: "markets",
  weather: "weather",
  culture: "popcult",
  "pop culture": "popcult",
  gaming: "gaming",
  movies: "movies",
  film: "movies",
};

function mapCategory(tags, category) {
  const candidates = [category, ...(Array.isArray(tags) ? tags : [])]
    .filter(Boolean)
    .map((t) => String(t).toLowerCase());

  for (const c of candidates) {
    if (CATEGORY_MAP[c]) return CATEGORY_MAP[c];
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (c.includes(key)) return val;
    }
  }
  return "trending";
}

function parseJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/** Roll a past date forward by one or two years so static fallback events remain future-dated. */
export function rollForwardDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  while (d <= now) {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d.toISOString().split("T")[0];
}

/** Transform a raw Polymarket market object into the app's event shape. */
export function transformMarket(market, idx) {
  const outcomes = parseJSON(market.outcomes, ["Yes", "No"]);
  const prices = parseJSON(market.outcomePrices, ["0.5", "0.5"]).map(Number);
  const volume = parseFloat(market.volume || 0);
  const liquidity = parseFloat(market.liquidity || 0);

  // Scale mock vote counts from probability prices
  const scale = Math.max(1000, Math.round(liquidity / 5));
  const votes = prices.map((p) => Math.round(p * scale));

  // Points proportional to market volume (capped)
  const points = Math.min(5000, Math.max(200, Math.round(Math.sqrt(volume) * 10)));

  // Difficulty based on probability spread
  const maxProb = Math.max(...prices);
  const difficulty = maxProb > 0.8 ? "Hard" : maxProb > 0.65 ? "Medium" : "Easy";

  const trending = volume > 100_000;

  return {
    id: `pm_${market.id || idx}`,
    cat: mapCategory(market.tags, market.category),
    title: market.question,
    desc:
      (market.description || "").slice(0, 120) ||
      `Closes ${new Date(market.endDate).toLocaleDateString()}`,
    options: outcomes,
    points,
    ends: market.endDate
      ? market.endDate.split("T")[0]
      : new Date(Date.now() + 90 * 86_400_000).toISOString().split("T")[0],
    difficulty,
    votes,
    trending,
    source: "polymarket",
  };
}

/** Return true if the raw Polymarket market should be shown in the app. */
export function isMarketValid(market) {
  if (!market || !market.active || market.closed) return false;

  const endDate = new Date(market.endDate);
  if (isNaN(endDate.getTime()) || endDate <= new Date()) return false;

  // Must have a real question
  if (!market.question || market.question.length < 15) return false;

  // Filter out near-certain outcomes (>92% probability for any single outcome)
  const prices = parseJSON(market.outcomePrices, ["0.5", "0.5"]).map(Number);
  if (!prices.length) return false;
  if (Math.max(...prices) > 0.92) return false;

  return true;
}

/** Fetch and transform active Polymarket prediction events. */
export async function fetchPolymarketEvents({ limit = 100 } = {}) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(
      `${GAMMA_API}/markets?active=true&closed=false&limit=${limit}&order=volume&ascending=false`,
      { signal: controller.signal }
    );
    clearTimeout(tid);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const markets = Array.isArray(data) ? data : data.markets || [];
    return markets.filter(isMarketValid).map(transformMarket).slice(0, 60);
  } catch (e) {
    clearTimeout(tid);
    if (e.name !== "AbortError") {
      console.warn("[Polymarket] events fetch failed:", e.message);
    }
    return [];
  }
}

/** Fetch Polymarket markets shaped as P2P scenarios (balanced binary markets). */
export async function fetchPolymarketP2PScenarios({ limit = 60 } = {}) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(
      `${GAMMA_API}/markets?active=true&closed=false&limit=${limit}&order=volume&ascending=false`,
      { signal: controller.signal }
    );
    clearTimeout(tid);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const markets = Array.isArray(data) ? data : data.markets || [];
    return markets
      .filter(isMarketValid)
      .filter((m) => {
        // Prefer balanced markets for fair P2P betting
        const prices = parseJSON(m.outcomePrices, ["0.5", "0.5"]).map(Number);
        return Math.max(...prices) < 0.8;
      })
      .map((m) => ({
        q: m.question,
        options: parseJSON(m.outcomes, ["Yes", "No"]),
        marketId: m.id,
        source: "polymarket",
      }))
      .slice(0, 30);
  } catch (e) {
    clearTimeout(tid);
    if (e.name !== "AbortError") {
      console.warn("[Polymarket] P2P scenarios fetch failed:", e.message);
    }
    return [];
  }
}
