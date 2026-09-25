/**
 * Live / Simulated Price Feed Service for Tickers & ISINs
 */

interface QuoteResult {
  identifier: string;
  price: number;
  change24h: number;
  lastUpdated: string;
}

// Base mock market prices for known identifiers
const MARKET_REGISTRY: Record<string, { basePrice: number; volatility: number; currency: 'EUR' | 'USD' }> = {
  // ETFs & Fondos (ISIN)
  'IE00BK5BQT80': { basePrice: 124.80, volatility: 0.003, currency: 'EUR' }, // Vanguard All-World
  'IE00B03HD191': { basePrice: 47.90, volatility: 0.003, currency: 'EUR' },  // Vanguard Global Stock
  'ES0000012K21': { basePrice: 101.20, volatility: 0.0005, currency: 'EUR' }, // Bonos España 3A
  'DEP-TR-EUR':   { basePrice: 1.00, volatility: 0.000, currency: 'EUR' },    // Depósito Remunerado

  // Tickers
  'VWCE.DE':      { basePrice: 124.80, volatility: 0.003, currency: 'EUR' },
  'AAPL':         { basePrice: 228.60, volatility: 0.008, currency: 'USD' },
  'NVDA':         { basePrice: 122.40, volatility: 0.015, currency: 'USD' },
  'MSFT':         { basePrice: 428.10, volatility: 0.006, currency: 'USD' },
  'BTC':          { basePrice: 63850.00, volatility: 0.020, currency: 'EUR' },
  'ETH':          { basePrice: 2640.00, volatility: 0.025, currency: 'EUR' },
  'SAN.MC':       { basePrice: 4.45, volatility: 0.009, currency: 'EUR' },
};

export async function fetchLiveQuote(identifier: string): Promise<QuoteResult> {
  // Simulate network request latency (200ms - 400ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  const upperId = identifier.trim().toUpperCase();
  const assetData = MARKET_REGISTRY[upperId] || {
    basePrice: 100.0,
    volatility: 0.005,
    currency: 'EUR',
  };

  // Small random Brownian walk oscillation around base price
  const randomFactor = 1 + (Math.random() * 2 - 1) * assetData.volatility;
  const currentPrice = Number((assetData.basePrice * randomFactor).toFixed(upperId === 'BTC' ? 0 : 2));
  const change24h = Number(((randomFactor - 1) * 100).toFixed(2));

  return {
    identifier: upperId,
    price: currentPrice,
    change24h,
    lastUpdated: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export async function batchUpdateQuotes(identifiers: string[]): Promise<Record<string, QuoteResult>> {
  const results: Record<string, QuoteResult> = {};
  await Promise.all(
    identifiers.map(async (id) => {
      try {
        const quote = await fetchLiveQuote(id);
        results[id] = quote;
      } catch (e) {
        console.error(`Error updating quote for ${id}:`, e);
      }
    })
  );
  return results;
}
