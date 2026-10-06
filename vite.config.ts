import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import type { PluginOption } from 'vite'
import compression from 'vite-plugin-compression'

const viteCompression = compression as unknown as (options?: Record<string, unknown>) => PluginOption

async function fetchFTQuote(isin: string): Promise<{ price: number; change24h: number; currency: 'EUR' | 'USD'; symbol: string } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const url = `https://markets.ft.com/data/funds/tearsheet/summary?s=${encodeURIComponent(isin)}:EUR`;
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
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

function quoteDevProxyPlugin(): PluginOption {
  return {
    name: 'quote-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/quote', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          const rawSymbol = urlObj.searchParams.get('symbol')?.trim() || '';
          if (!rawSymbol) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing symbol' }));
            return;
          }

          const cleanInput = rawSymbol.toUpperCase();
          const isIsinFormat = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(cleanInput);
          let targetSymbol = rawSymbol;

          if (isIsinFormat) {
            // 1. High-speed resolution via Financial Times Markets (updates early morning vs 24h Yahoo delay)
            const ftQuote = await fetchFTQuote(cleanInput);
            if (ftQuote && ftQuote.price > 0) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(ftQuote));
              return;
            }

            try {
              const sRes = await fetch(
                `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanInput)}`,
                { headers: { 'User-Agent': 'Mozilla/5.0' } }
              );
              if (sRes.ok) {
                const sData = (await sRes.json()) as any;
                const q = sData?.quotes?.[0]?.symbol;
                if (q) targetSymbol = String(q);
              }
            } catch {
              // Ignore search failure
            }
          }

          let cRes = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(targetSymbol)}?range=1d&interval=1d`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
          );

          if (!cRes.ok) {
            cRes = await fetch(
              `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(targetSymbol)}?range=1d&interval=1d`,
              { headers: { 'User-Agent': 'Mozilla/5.0' } }
            );
          }

          if (!cRes.ok) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Upstream error ${cRes.status}` }));
            return;
          }

          const cData = (await cRes.json()) as any;
          const result = cData?.chart?.result?.[0];
          const meta = result?.meta;
          let price = Number(meta?.regularMarketPrice);
          if (isNaN(price) || price <= 0) {
            const closeList = result?.indicators?.quote?.[0]?.close;
            if (Array.isArray(closeList) && closeList.length > 0) {
              const valid = closeList.filter((p: unknown) => typeof p === 'number' && !isNaN(p as number) && (p as number) > 0);
              if (valid.length > 0) price = valid[valid.length - 1] as number;
            }
          }

          const prevClose = Number(meta?.previousClose || meta?.chartPreviousClose);
          const change24h = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
          const currency = meta?.currency === 'USD' ? 'USD' : 'EUR';

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              price: Number(price.toFixed(2)),
              change24h: Number(change24h.toFixed(2)),
              currency,
              symbol: targetSymbol,
            })
          );
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    quoteDevProxyPlugin(),
    react(),
    tailwindcss(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.svg', 'icon-180.jpg', 'icon-192.jpg', 'icon-512.jpg'],
      manifest: {
        name: 'Fluo',
        short_name: 'Fluo',
        description: 'Gestión inteligente de finanzas e inversiones',
        theme_color: '#0B0F19',
        background_color: '#0B0F19',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any',
          },
          {
            src: '/icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any',
          },
          {
            src: '/icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3000000,
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/recharts/')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/zustand/')) {
            return 'vendor-state';
          }
        },
      },
    },
  },
})