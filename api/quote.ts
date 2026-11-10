/**
 * Vercel Serverless Function: /api/quote
 *
 * Resilient multi-source proxy for Yahoo Finance chart & search API.
 * Called from the browser to avoid CORS restrictions on mobile and desktop.
 *
 * Query params:
 *   symbol  — ticker symbol or ISIN (e.g. VEUR.AS, VUSA.AS, AAPL, IE0007987690)
 *
 * Returns: { price, change24h, currency, symbol } | { error }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fallback twin ETF / benchmark map for common UCITS funds
const KNOWN_ISIN_MAP: Record<string, string> = {
  IE0032126645: 'VUSA.AS', // Vanguard US 500
  IE0007987690: 'VEUR.AS', // Vanguard European Stock
  IE00B03HD191: 'VWCE.DE', // Vanguard Global Stock
  IE0031786142: 'VEUR.AS', // Vanguard Eurozone Stock
  IE00B0476488: 'VFEM.AS', // Vanguard Emerging Markets
  IE0007987708: 'VJPN.AS', // Vanguard Japan Stock
  IE00B0476041: 'AGGH.AS', // Vanguard Global Bond
  IE00B18GC888: 'VETY.DE', // Vanguard Euro Government Bond
  LU0996177134: 'CW8.PA',  // Amundi MSCI World
  LU0996179007: 'VUSA.AS', // Amundi S&P 500
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchWithFallback(url1: string, url2: string, timeoutMs = 4000): Promise<any | null> {
  // Try primary
  try {
    const ctrl1 = new AbortController();
    const t1 = setTimeout(() => ctrl1.abort(), timeoutMs);
    const res1 = await fetch(url1, {
      signal: ctrl1.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });
    clearTimeout(t1);
    if (res1.ok) {
      return await res1.json();
    }
  } catch {
    // Continue to fallback
  }

  // Try secondary
  try {
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), timeoutMs);
    const res2 = await fetch(url2, {
      signal: ctrl2.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });
    clearTimeout(t2);
    if (res2.ok) {
      return await res2.json();
    }
  } catch {
    // Secondary failed
  }

  return null;
}

async function fetchFTQuote(isin: string): Promise<{ price: number; change24h: number; currency: 'EUR' | 'USD'; symbol: string } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const url = `https://markets.ft.com/data/funds/tearsheet/summary?s=${encodeURIComponent(isin)}:EUR`;
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(t);
    if (!res.ok) return null;

    const html = await res.text();
    const priceMatch = html.match(/Price \(([A-Z]{3})\)<\/span>\s*<span class="mod-ui-data-list__value">([0-9.,]+)<\/span>/);
    if (!priceMatch) return null;

    const currency = priceMatch[1] === 'USD' ? 'USD' : 'EUR';
    const price = Number(priceMatch[2].replace(/,/g, ''));
    if (isNaN(price) || price <= 0) return null;

    let change24h = 0;
    const changeMatch = html.match(/Today's Change<\/span>[\s\S]*?([+-]?[0-9.,]+)%\s*<\/span>/);
    if (changeMatch) {
      change24h = Number(changeMatch[1].replace(/,/g, ''));
      if (isNaN(change24h)) change24h = 0;
    }

    return {
      price,
      change24h,
      currency,
      symbol: isin,
    };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawSymbol = (req.query.symbol as string | undefined)?.trim();
  if (!rawSymbol || rawSymbol.length < 1) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  // Sanitize: only alphanumeric, dot, dash, underscore, caret, equals
  if (!/^[A-Za-z0-9.\-_^=]+$/.test(rawSymbol)) {
    return res.status(400).json({ error: 'Invalid symbol' });
  }

  const cleanInput = rawSymbol.toUpperCase();
  const isIsinFormat = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(cleanInput);
  const KNOWN_TICKER_TO_ISIN: Record<string, string> = {
    '0P00000SUJ.F': 'IE0032126645',
    '0P00000SUJ': 'IE0032126645',
    '0P00000RQ8.F': 'IE0007987690',
    '0P00000RQ8': 'IE0007987690',
  };
  const resolvedIsin = isIsinFormat ? cleanInput : KNOWN_TICKER_TO_ISIN[cleanInput];

  let targetSymbol = rawSymbol;

  // 1. High-speed resolution via Financial Times Markets for ISIN funds & fund tickers
  if (resolvedIsin) {
    const ftQuote = await fetchFTQuote(resolvedIsin);
    if (ftQuote && ftQuote.price > 0) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=120');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json({ ...ftQuote, symbol: rawSymbol });
    }
  }

  // If input is an ISIN or maps to one, resolve its Yahoo symbol (e.g. 0P00000RQ8.F) via Search API
  if (resolvedIsin) {
    const searchUrl1 = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(resolvedIsin)}`;
    const searchUrl2 = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(resolvedIsin)}`;
    const searchData = await fetchWithFallback(searchUrl1, searchUrl2, 3500);

    const quotes = searchData?.quotes;
    if (Array.isArray(quotes) && quotes.length > 0) {
      const fundQuote = quotes.find(
        (q: any) => q.quoteType === 'MUTUALFUND' || (q.symbol && String(q.symbol).includes('.'))
      ) || quotes[0];
      if (fundQuote?.symbol) {
        targetSymbol = String(fundQuote.symbol);
      }
    }

    // Fallback to equivalence map if search didn't resolve symbol
    if (targetSymbol === rawSymbol && KNOWN_ISIN_MAP[resolvedIsin]) {
      targetSymbol = KNOWN_ISIN_MAP[resolvedIsin];
    }
  }

  // Query Yahoo chart for target symbol
  const chartUrl1 = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(targetSymbol)}?range=1d&interval=1d`;
  const chartUrl2 = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(targetSymbol)}?range=1d&interval=1d`;
  const chartData = await fetchWithFallback(chartUrl1, chartUrl2, 5000);

  if (!chartData) {
    // If targetSymbol failed and was derived, try twin ETF fallback
    if (isIsinFormat && KNOWN_ISIN_MAP[cleanInput] && targetSymbol !== KNOWN_ISIN_MAP[cleanInput]) {
      const fallbackSymbol = KNOWN_ISIN_MAP[cleanInput];
      const fbUrl1 = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(fallbackSymbol)}?range=1d&interval=1d`;
      const fbUrl2 = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(fallbackSymbol)}?range=1d&interval=1d`;
      const fbData = await fetchWithFallback(fbUrl1, fbUrl2, 4000);
      if (fbData) {
        return handleChartResult(fbData, fallbackSymbol, res);
      }
    }
    return res.status(200).json({ error: `Could not fetch quote for ${rawSymbol}`, price: null, symbol: rawSymbol });
  }

  return handleChartResult(chartData, targetSymbol, res);
}

function handleChartResult(data: any, symbol: string, res: VercelResponse) {
  const result = data?.chart?.result?.[0];
  if (!result) {
    return res.status(200).json({ error: 'No chart data returned by Yahoo', price: null, symbol });
  }

  const meta = result.meta;
  let price = Number(meta.regularMarketPrice);
  if (isNaN(price) || price <= 0) {
    const closeList = result.indicators?.quote?.[0]?.close;
    if (Array.isArray(closeList) && closeList.length > 0) {
      const valid = closeList.filter(
        (p: unknown) => typeof p === 'number' && !isNaN(p as number) && (p as number) > 0
      );
      if (valid.length > 0) price = valid[valid.length - 1] as number;
    }
  }

  if (isNaN(price) || price <= 0) {
    return res.status(200).json({ error: 'Could not extract valid price', price: null, symbol });
  }

  const prevClose = Number(meta.previousClose || meta.chartPreviousClose);
  let change24h = 0;
  if (!isNaN(prevClose) && prevClose > 0) {
    change24h = ((price - prevClose) / prevClose) * 100;
  }

  const currency: 'EUR' | 'USD' = meta.currency === 'USD' ? 'USD' : 'EUR';

  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=120');
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.status(200).json({
    price: Number(price.toFixed(2)),
    change24h: Number(change24h.toFixed(2)),
    currency,
    symbol,
  });
}
