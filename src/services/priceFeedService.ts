/**
 * Live / Simulated Price Feed Service for Tickers & ISINs
 */

export interface QuoteResult {
  identifier: string;
  name?: string;
  price: number;
  change24h: number;
  currency: 'EUR' | 'USD';
  lastUpdated: string;
}

// Registry of known market tickers and ISINs
const MARKET_REGISTRY: Record<
  string,
  { name: string; basePrice: number; volatility: number; currency: 'EUR' | 'USD' }
> = {
  // ETFs & Fondos (ISIN / Ticker)
  'IE00BK5BQT80': { name: 'Vanguard FTSE All-World UCITS ETF', basePrice: 124.80, volatility: 0.003, currency: 'EUR' },
  'VWCE.DE':      { name: 'Vanguard FTSE All-World UCITS ETF', basePrice: 124.80, volatility: 0.003, currency: 'EUR' },
  'IE00B03HD191': { name: 'Vanguard Global Stock Index Fund', basePrice: 47.90, volatility: 0.003, currency: 'EUR' },
  'IE00B3XXRP09': { name: 'Vanguard S&P 500 UCITS ETF (VUSA)', basePrice: 94.20, volatility: 0.004, currency: 'EUR' },
  'ES0000012K21': { name: 'Bonos del Tesoro Español 3A', basePrice: 101.20, volatility: 0.0005, currency: 'EUR' },
  'DEP-TR-EUR':   { name: 'Depósito Remunerado 3.25% TAE', basePrice: 1.00, volatility: 0.000, currency: 'EUR' },

  // Acciones (Tickers)
  'AAPL':         { name: 'Apple Inc.', basePrice: 228.60, volatility: 0.008, currency: 'USD' },
  'NVDA':         { name: 'NVIDIA Corporation', basePrice: 122.40, volatility: 0.015, currency: 'USD' },
  'MSFT':         { name: 'Microsoft Corporation', basePrice: 428.10, volatility: 0.006, currency: 'USD' },
  'TSLA':         { name: 'Tesla, Inc.', basePrice: 248.50, volatility: 0.018, currency: 'USD' },
  'AMZN':         { name: 'Amazon.com, Inc.', basePrice: 186.40, volatility: 0.007, currency: 'USD' },
  'SAN.MC':       { name: 'Banco Santander, S.A.', basePrice: 4.45, volatility: 0.009, currency: 'EUR' },
  'ITX.MC':       { name: 'Inditex, S.A.', basePrice: 49.30, volatility: 0.007, currency: 'EUR' },

  // Criptomonedas
  'BTC':          { name: 'Bitcoin', basePrice: 63850.00, volatility: 0.020, currency: 'EUR' },
  'ETH':          { name: 'Ethereum', basePrice: 2640.00, volatility: 0.025, currency: 'EUR' },
  'SOL':          { name: 'Solana', basePrice: 148.00, volatility: 0.030, currency: 'EUR' },
};

export async function fetchLiveQuote(identifier: string): Promise<QuoteResult> {
  // Simulate network request latency (250ms - 450ms)
  await new Promise((resolve) => setTimeout(resolve, 320));

  const upperId = identifier.trim().toUpperCase();
  const assetData = MARKET_REGISTRY[upperId] || {
    name: upperId,
    basePrice: 100.0,
    volatility: 0.005,
    currency: 'EUR' as const,
  };

  // Small random Brownian walk oscillation around base price
  const randomFactor = 1 + (Math.random() * 2 - 1) * assetData.volatility;
  const currentPrice = Number(
    (assetData.basePrice * randomFactor).toFixed(upperId === 'BTC' ? 0 : 2)
  );
  const change24h = Number(((randomFactor - 1) * 100).toFixed(2));

  return {
    identifier: upperId,
    name: assetData.name,
    price: currentPrice,
    change24h,
    currency: assetData.currency,
    lastUpdated: new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

export async function batchUpdateQuotes(
  identifiers: string[]
): Promise<Record<string, QuoteResult>> {
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
