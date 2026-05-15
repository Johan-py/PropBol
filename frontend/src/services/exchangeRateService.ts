interface ExchangeRateData {
  official: number;
  referential: number | null;
  updatedAt: string;
}

interface P2PArmyResponse {
  status?: number;
  prices?: Array<{ avg_price_BUY?: number; updated_BUY?: number }>;
}

let moduleCache: { value: ExchangeRateData; timestamp: number } | null = null;

const getOfficialRate = () => {
  const officialRate = Number(process.env.OFFICIAL_EXCHANGE_RATE);
  return Number.isFinite(officialRate) ? officialRate : 0;
};

const getFallbackExchangeRate = (): ExchangeRateData =>
  moduleCache?.value ?? { official: getOfficialRate(), referential: null, updatedAt: "" };

export async function getExchangeRate(): Promise<ExchangeRateData> {
  const apiUrl = process.env.P2P_ARMY_API_URL;
  const apiKey = process.env.P2P_ARMY_API_KEY;

  if (!apiUrl || !apiKey) {
    return getFallbackExchangeRate();
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-APIKEY": apiKey },
      body: JSON.stringify({ market: "binance", fiat: "BOB", asset: "USDT", limit: 5 }),
      next: { revalidate: 1800 },
    });

    const data = (await response.json()) as P2PArmyResponse;
    const firstPrice = data.prices?.[0];

    if (!response.ok || data.status !== 1 || !firstPrice?.avg_price_BUY || !firstPrice.updated_BUY) {
      return getFallbackExchangeRate();
    }

    const exchangeRate = {
      official: getOfficialRate(),
      referential: firstPrice.avg_price_BUY,
      updatedAt: new Date(firstPrice.updated_BUY * 1000).toISOString(),
    };

    moduleCache = { value: exchangeRate, timestamp: Date.now() };
    return exchangeRate;
  } catch {
    return getFallbackExchangeRate();
  }
}
