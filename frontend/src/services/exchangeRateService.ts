import { buildBinanceRequest, getReferentialRateFromAds } from "@/services/binanceP2P";

export interface ExchangeRateData {
  officialRate: number;
  referentialRate: number | null;
  updatedAt: string;
}

let moduleCache: { value: ExchangeRateData; timestamp: number } | null = null;

// Cache TTL: configurable via env `EXCHANGE_RATE_CACHE_TTL_MS`, fallback 30 minutes
const envTtl = Number(process.env.EXCHANGE_RATE_CACHE_TTL_MS);
const CACHE_TTL = Number.isFinite(envTtl) && envTtl > 0 ? envTtl : 30 * 60 * 1000;

const getOfficialRate = () => {
  const officialRate = Number(process.env.OFFICIAL_EXCHANGE_RATE);
  return Number.isFinite(officialRate) ? officialRate : 0;
};

const getFallbackExchangeRate = (): ExchangeRateData =>
  moduleCache?.value ?? { officialRate: getOfficialRate(), referentialRate: null, updatedAt: "" };

export async function getExchangeRate(): Promise<ExchangeRateData> {
  // Return cached value when fresh
  if (moduleCache && Date.now() - moduleCache.timestamp < CACHE_TTL) {
    return moduleCache.value;
  }

  if (!process.env.BINANCE_P2P_URL) {
    return getFallbackExchangeRate();
  }

  try {
    // Perform fetch with a timeout to avoid hanging the API route.
    const fetchTimeoutMs = Number(process.env.EXCHANGE_RATE_FETCH_TIMEOUT_MS) || 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);
    let response: Response;
    try {
      const req = { ...(buildBinanceRequest(process.env.SCRAPER_USER_AGENT) as RequestInit), signal: controller.signal } as RequestInit;
      response = await fetch(process.env.BINANCE_P2P_URL ?? "", req);
    } finally {
      clearTimeout(timeoutId);
    }

    // If external call failed, return cached value if available
    if (!response || !response.ok) {
      if (moduleCache) return moduleCache.value;
      return getFallbackExchangeRate();
    }

    const data = (await response.json()) as { data?: Array<{ adv?: { price?: string } }> };
    const referentialRate = getReferentialRateFromAds(data.data);

    if (referentialRate === null) {
      if (moduleCache) return moduleCache.value;
      return getFallbackExchangeRate();
    }

    const exchangeRate = { officialRate: getOfficialRate(), referentialRate, updatedAt: new Date().toISOString() };
    moduleCache = { value: exchangeRate, timestamp: Date.now() };
    return exchangeRate;
  } catch (err) {
    void err;
    if (moduleCache) return moduleCache.value;
    return getFallbackExchangeRate();
  }
}
