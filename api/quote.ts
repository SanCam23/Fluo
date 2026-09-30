/**
 * Vercel Serverless Function: /api/quote
 *
 * CORS proxy for Yahoo Finance chart API.
 * Called from the browser to avoid CORS restrictions on mobile.
 *
 * Query params:
 *   symbol  — ticker symbol (e.g. VEUR.AS, VUSA.AS, AAPL)
 *
 * Returns: { price, change24h, currency, symbol } | { error }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const symbol = (req.query.symbol as string | undefined)?.trim();
  if (!symbol || symbol.length < 1) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  // Sanitize: only alphanumeric, dot, dash, underscore, caret, equals
  if (!/^[A-Za-z0-9.\-_^=]+$/.test(symbol)) {
    return res.status(400).json({ error: 'Invalid symbol' });
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://finance.yahoo.com/',
        Origin: 'https://finance.yahoo.com',
      },
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      return res.status(502).json({ error: `Yahoo returned ${upstream.status}` });
    }

    const data = await upstream.json();
    const result = data?.chart?.result?.[0];
    if (!result) {
      return res.status(502).json({ error: 'No chart data returned by Yahoo' });
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
      return res.status(502).json({ error: 'Could not extract valid price' });
    }

    const prevClose = Number(meta.previousClose || meta.chartPreviousClose);
    let change24h = 0;
    if (!isNaN(prevClose) && prevClose > 0) {
      change24h = ((price - prevClose) / prevClose) * 100;
    }

    const currency: 'EUR' | 'USD' = meta.currency === 'USD' ? 'USD' : 'EUR';

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).json({
      price: Number(price.toFixed(2)),
      change24h: Number(change24h.toFixed(2)),
      currency,
      symbol,
    });
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'));
    return res.status(isTimeout ? 504 : 502).json({ error: isTimeout ? 'Upstream timeout' : 'Network error' });
  }
}
